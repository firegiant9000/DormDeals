import { db } from '@/firebase';
import {
  collection, query, where, orderBy, limit,
  getDocs, onSnapshot, QueryConstraint
} from 'firebase/firestore';
import type { Item } from '@/types';
import { normalizeListing } from '@/utils/helpers';
import { isDebug } from '@/utils/debug';

// Firestore listing document structure
export interface FirestoreListing {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  description: string;
  imageUrls?: string[];
  images?: string[];
  ownerId: string;
  createdAt?: any;
  updatedAt?: any;
  isHidden?: boolean;
  isFeatured?: boolean;
  location?: string;
  pickupAvailable?: boolean;
  deliveryAvailable?: boolean;
  deliveryFee?: number;
  views?: number;
  likes?: number;
  tags?: string[];
  status?: string;
  posted?: string;
  // Seller info might be embedded or just ownerId
  seller?: any;
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Convert Firestore listing to Item format
function convertListingToItem(listing: FirestoreListing | { id: string; imageUrls?: string[]; [key: string]: any }): Item {
  const images = listing.imageUrls || (listing as any).images || [];
  const createdAt = listing.createdAt?.toDate ? listing.createdAt.toDate() : (listing.createdAt ? new Date(listing.createdAt) : new Date());
  const updatedAt = listing.updatedAt?.toDate ? listing.updatedAt.toDate() : (listing.updatedAt ? new Date(listing.updatedAt) : createdAt);
  const posted = listing.posted || createdAt.toISOString();

  // Create minimal seller object if not provided
  const seller = listing.seller || {
    id: listing.ownerId,
    name: 'Unknown Seller',
    email: '',
    school: 'University of Louisiana',
    joinDate: new Date().toISOString(),
    joinedDate: new Date().toISOString(),
    rating: 0,
    reviewCount: 0,
    totalSales: 0,
    isVerified: false,
  };

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description || '',
    price: listing.price,
    condition: listing.condition as any,
    category: listing.category as any,
    images,
    seller,
    location: listing.location || '',
    pickupAvailable: listing.pickupAvailable ?? false,
    deliveryAvailable: listing.deliveryAvailable ?? false,
    deliveryFee: listing.deliveryFee,
    createdAt,
    updatedAt,
    posted,
    status: (listing.status as any) || 'ACTIVE',
    views: listing.views || 0,
    likes: listing.likes || 0,
    isLiked: false,
    isInCart: false,
    isInWishlist: false,
    tags: listing.tags || [],
  };
}

// DEV mock fallback - using mockItems from mockData for consistency
async function getMockListings(): Promise<Item[]> {
  if (!USE_MOCKS) return [];
  try {
    const { mockItems } = await import('../data/mockData');
    return mockItems;
  } catch {
    return [];
  }
}

export async function fetchListings(opts?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  limitN?: number;
}): Promise<Item[]> {
  if (USE_MOCKS) {
    if (import.meta.env.DEV) {
      console.log('[LISTINGS] Using mock data', { opts });
    }
    return getMockListings();
  }

  try {
    const qc: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    if (opts?.category) qc.push(where('category', '==', opts.category));
    if (opts?.featuredOnly) qc.push(where('isFeatured', '==', true));
    // (min/max price can be done via composite indexes; skip if index missing)
    const q = query(collection(db, 'listings'), ...(opts?.limitN ? [...qc, limit(opts.limitN)] : qc));
    const snap = await getDocs(q);
    const rows = snap.docs.map(d => {
      const normalized = normalizeListing(d);
      return convertListingToItem(normalized);
    });
    
    if (isDebug()) {
      console.log('[LISTINGS_PROVIDER] fetched', { count: rows.length, docs: snap.docs.length, opts });
    }
    
    return rows;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[LISTINGS] Fetch error', error);
    }
    // Fallback to mocks on error if mocks are enabled
    if (USE_MOCKS) {
      return getMockListings();
    }
    throw error;
  }
}

export function subscribeListings(
  onData: (rows: Item[]) => void,
  onErr?: (e: any) => void,
  opts?: Parameters<typeof fetchListings>[0]
) {
  if (USE_MOCKS) {
    // simulate async
    getMockListings().then(onData).catch((err) => {
      if (onErr) onErr(err);
    });
    return () => {};
  }

  try {
    const qc: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    if (opts?.category) qc.push(where('category', '==', opts.category));
    if (opts?.featuredOnly) qc.push(where('isFeatured', '==', true));
    const q = query(collection(db, 'listings'), ...qc);
    
    if (import.meta.env.DEV) {
      console.log('[LISTINGS] Subscribing to Firestore', { opts });
    }
    
    return onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => {
        const normalized = normalizeListing(d);
        return convertListingToItem(normalized);
      });
      onData(rows);
      
      if (isDebug()) {
        console.log('[LISTINGS_PROVIDER] snapshot', { count: rows.length, docs: snap.docs.length });
      }
    }, (error) => {
      if (import.meta.env.DEV) {
        console.error('[LISTINGS] Snapshot error', error);
      }
      if (onErr) onErr(error);
    });
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[LISTINGS] Subscribe error', error);
    }
    if (onErr) onErr(error);
    return () => {};
  }
}

