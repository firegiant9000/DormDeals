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

export interface CommerceResultErr {
  ok: false;
  op: CommerceOp;
  code:
    | 'unauthenticated'
    | 'not-found'
    | 'permission-denied'
    | 'already-exists'
    | 'invalid-argument'
    | 'firestore/unavailable'
    | 'unknown';
  message?: string;
}

export type CommerceResult = CommerceResultOk | CommerceResultErr;

