export type ListingID = string;

export interface CartDoc {
  items: Record<ListingID, true>;
  updatedAt?: any;
}

export interface WishlistDoc {
  items: Record<ListingID, true>;
  updatedAt?: any;
}

export type CommerceOp =
  | 'cart:add' | 'cart:remove'
  | 'wishlist:add' | 'wishlist:remove';

export interface CommerceResultOk {
  ok: true;
  op: CommerceOp;
}

export type CommerceErrorCode =
  | 'unauthenticated'
  | 'not-found'
  | 'permission-denied'
  | 'already-exists'
  | 'invalid-argument'
  | 'firestore/unavailable'
  | 'unknown';

export interface CommerceResultErr {
  ok: false;
  op: CommerceOp;
  code: CommerceErrorCode;
  message?: string;
}

export type CommerceResult = CommerceResultOk | CommerceResultErr;

// Unified Listing type with imageUrls
export type Listing = {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  location?: string
  ownerId: string
  createdAt: Date | { seconds: number; nanoseconds: number } // Firestore Timestamp compatible
  status?: 'active' | 'draft' | 'archived'
  imageUrls?: string[]          // <- unify on this
  // Legacy fields (deprecated - map to imageUrls at read time)
  /** @deprecated Use imageUrls instead */
  images?: string[]
  /** @deprecated Use imageUrls instead */
  imageUrl?: string
}

