import { auth, db, storage } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function devLog(msg: string, extra?: unknown) {
  if (import.meta.env.DEV) console.log('[CREATE_LISTING]', msg, extra ?? '');
}

export type CreateListingErrorCode =
  | 'unauthenticated'
  | 'validation-failed'
  | 'image-upload-failed'
  | 'firestore/write-failed'
  | 'storage/unavailable'
  | 'unknown';

export interface CreateListingResultOk {
  ok: true;
  id: string;
  imageUrls: string[];
}

export interface CreateListingResultErr {
  ok: false;
  code: CreateListingErrorCode;
  step: string;
  message?: string;
}

export type CreateListingResult = CreateListingResultOk | CreateListingResultErr;

export async function createListing(data: {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location?: string;
  images: File[];
}): Promise<CreateListingResult> {
  const user = auth.currentUser;
  if (!user) {
    const result: CreateListingResultErr = {
      ok: false,
      code: 'unauthenticated',
      step: 'auth-check',
      message: 'User not authenticated',
    };
    devLog('createListing failed', result);
    return result;
  }

  // Step 1: Validation
  devLog('Step 1: Validation');
  if (!data.title?.trim() || !data.description?.trim() || !data.price || !data.category || !data.condition) {
    const result: CreateListingResultErr = {
      ok: false,
      code: 'validation-failed',
      step: 'validation',
      message: 'Missing required fields',
    };
    devLog('createListing failed', result);
    return result;
  }

  try {
    // Step 2: Upload images
    devLog('Step 2: Upload images', { count: data.images.length });
    const imageUrls: string[] = [];
    
    for (let i = 0; i < data.images.length; i++) {
      const file = data.images[i];
      try {
        const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}-${i}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
        devLog(`Image ${i + 1} uploaded`, { url });
      } catch (error: any) {
        const result: CreateListingResultErr = {
          ok: false,
          code: 'image-upload-failed',
          step: `image-upload-${i}`,
          message: `Failed to upload image ${i + 1}: ${error?.message}`,
        };
        devLog('createListing failed', result);
        return result;
      }
    }

    // Step 3: Create Firestore document
    devLog('Step 3: Create Firestore document');
    try {
      const listingData = {
        title: data.title.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price.toString()),
        category: data.category,
        condition: data.condition,
        location: data.location?.trim() || '',
        imageUrls,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isHidden: false,
        isFeatured: false,
        views: 0,
        likes: 0,
        tags: [],
      };

      const docRef = await addDoc(collection(db, 'listings'), listingData);
      devLog('createListing success', { listingId: docRef.id });

      const result: CreateListingResultOk = {
        ok: true,
        id: docRef.id,
        imageUrls,
      };
      return result;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const errorCode: CreateListingErrorCode = 
        code.includes('storage') ? 'storage/unavailable' :
        code.includes('firestore') || code.includes('permission') ? 'firestore/write-failed' :
        'unknown';
      
      const result: CreateListingResultErr = {
        ok: false,
        code: errorCode,
        step: 'firestore-write',
        message: error?.message || 'Failed to create listing',
      };
      devLog('createListing failed', result);
      return result;
    }
  } catch (error: any) {
    // Catch-all for any unexpected errors
    const result: CreateListingResultErr = {
      ok: false,
      code: 'unknown',
      step: 'unknown',
      message: error?.message || 'An unexpected error occurred',
    };
    devLog('createListing failed (catch-all)', result);
    return result;
  }
}
