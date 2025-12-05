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
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  ownerId: string;
  status: 'active' | 'sold' | 'archived';
  createdAt?: any; // Firestore timestamp
  imageUrls: string[]; // canonical
  // legacy fields (do not use directly)
  images?: any;      // deprecated
  imageUrl?: string; // deprecated
};

