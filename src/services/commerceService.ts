import { auth, db } from '@/firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

import type {
  CommerceResult,
  CommerceErrorCode,
  ListingID,
} from '@/types/commerce';

function devLog(msg: string, extra?: unknown) {
  if (import.meta.env.DEV) console.log('[COMMERCE]', msg, extra ?? '');
}

// ------------------- CART -------------------

export async function addToCart(listingId: ListingID): Promise<CommerceResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, op: 'cart:add', code: 'unauthenticated' };

  try {
    const ref = doc(db, 'users', user.uid, 'cart', String(listingId));

    await setDoc(ref, {
      listingId,
      addedAt: serverTimestamp(),
    });

    devLog('cart:add ok', { listingId });
    return { ok: true, op: 'cart:add' };
  } catch (e: any) {
    const code: CommerceErrorCode = e?.code?.includes('permission')
      ? 'permission-denied'
      : 'unknown';
    
    devLog('cart:add err', e);
    return { ok: false, op: 'cart:add', code };
  }
}

export async function removeFromCart(listingId: ListingID): Promise<CommerceResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, op: 'cart:remove', code: 'unauthenticated' };

  try {
    const ref = doc(db, 'users', user.uid, 'cart', String(listingId));
    await deleteDoc(ref);

    devLog('cart:remove ok', { listingId });
    return { ok: true, op: 'cart:remove' };
  } catch (e: any) {
    const code: CommerceErrorCode = e?.code?.includes('permission')
      ? 'permission-denied'
      : 'unknown';
    
    devLog('cart:remove err', e);
    return { ok: false, op: 'cart:remove', code };
  }
}

// ------------------- WISHLIST -------------------

export async function addToWishlist(listingId: ListingID): Promise<CommerceResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, op: 'wishlist:add', code: 'unauthenticated' };

  try {
    const ref = doc(db, 'users', user.uid, 'favorites', String(listingId));

    await setDoc(ref, {
      listingId,
      createdAt: serverTimestamp(),
    });

    devLog('wishlist:add ok', { listingId });
    return { ok: true, op: 'wishlist:add' };
  } catch (e: any) {
    let code: CommerceErrorCode = 'unknown';

    if (e?.code?.includes('permission')) code = 'permission-denied';
    if (e?.code === 'already-exists') code = 'already-exists';

    devLog('wishlist:add err', e);
    return { ok: false, op: 'wishlist:add', code, message: e?.message };
  }
}

export async function removeFromWishlist(listingId: ListingID): Promise<CommerceResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, op: 'wishlist:remove', code: 'unauthenticated' };

  try {
    const ref = doc(db, 'users', user.uid, 'favorites', String(listingId));
    await deleteDoc(ref);

    devLog('wishlist:remove ok', { listingId });
    return { ok: true, op: 'wishlist:remove' };
  } catch (e: any) {
    const code: CommerceErrorCode = e?.code?.includes('permission')
      ? 'permission-denied'
      : 'unknown';

    devLog('wishlist:remove err', e);
    return { ok: false, op: 'wishlist:remove', code };
  }
}