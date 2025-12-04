import { auth, db } from '@/firebase';
import {
  doc, runTransaction, serverTimestamp
} from 'firebase/firestore';
import type { CommerceResult, CommerceErrorCode, ListingID, CartDoc, WishlistDoc } from '@/types/commerce';

function devLog(msg: string, extra?: unknown) {
  if (import.meta.env.DEV) console.log('[COMMERCE]', msg, extra ?? '');
}

export async function addToCart(listingId: ListingID): Promise<CommerceResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, op: 'cart:add', code: 'unauthenticated' };
  const path = `carts/${user.uid}`;

  try {
    await runTransaction(db, async (tx) => {
      const ref = doc(db, path);
      const snap = await tx.get(ref);
      const data = (snap.exists() ? snap.data() : { items: {} }) as CartDoc;
      if (data.items?.[listingId]) {
        throw { code: 'already-exists', message: 'Item already in cart' };
      }
      const items = { ...(data.items || {}), [listingId]: true };
      tx.set(ref, { items, updatedAt: serverTimestamp() }, { merge: true });
    });
    devLog('cart:add ok', { listingId });
    return { ok: true, op: 'cart:add' };
  } catch (e: any) {
    let code = 'unknown' as CommerceErrorCode;
    if (e?.code === 'already-exists') code = 'already-exists';
    else if (e?.code === 'permission-denied' || e?.code?.includes('permission')) code = 'permission-denied';
    else if (e?.code === 'unavailable' || e?.code?.includes('unavailable')) code = 'firestore/unavailable';
    else if (e?.code === 'not-found') code = 'not-found';
    devLog('cart:add err', e);
    return { ok: false, op: 'cart:add', code, message: e?.message };
  }
}

export async function removeFromCart(listingId: ListingID): Promise<CommerceResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, op: 'cart:remove', code: 'unauthenticated' };
  const path = `carts/${user.uid}`;

  try {
    await runTransaction(db, async (tx) => {
      const ref = doc(db, path);
      const snap = await tx.get(ref);
      const data = (snap.exists() ? snap.data() : { items: {} }) as CartDoc;
      if (!data.items?.[listingId]) {
        throw { code: 'not-found', message: 'Item not in cart' };
      }
      const { [listingId]: _, ...rest } = data.items;
      tx.set(ref, { items: rest, updatedAt: serverTimestamp() }, { merge: true });
    });
    devLog('cart:remove ok', { listingId });
    return { ok: true, op: 'cart:remove' };
  } catch (e: any) {
    let code = 'unknown' as CommerceErrorCode;
    if (e?.code === 'not-found') code = 'not-found';
    else if (e?.code === 'permission-denied' || e?.code?.includes('permission')) code = 'permission-denied';
    else if (e?.code === 'unavailable' || e?.code?.includes('unavailable')) code = 'firestore/unavailable';
    devLog('cart:remove err', e);
    return { ok: false, op: 'cart:remove', code, message: e?.message };
  }
}

export async function addToWishlist(listingId: ListingID): Promise<CommerceResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, op: 'wishlist:add', code: 'unauthenticated' };
  const path = `wishlists/${user.uid}`;

  try {
    await runTransaction(db, async (tx) => {
      const ref = doc(db, path);
      const snap = await tx.get(ref);
      const data = (snap.exists() ? snap.data() : { items: {} }) as WishlistDoc;
      if (data.items?.[listingId]) {
        throw { code: 'already-exists', message: 'Item already in wishlist' };
      }
      const items = { ...(data.items || {}), [listingId]: true };
      tx.set(ref, { items, updatedAt: serverTimestamp() }, { merge: true });
    });
    devLog('wishlist:add ok', { listingId });
    return { ok: true, op: 'wishlist:add' };
  } catch (e: any) {
    let code = 'unknown' as CommerceErrorCode;
    if (e?.code === 'already-exists') code = 'already-exists';
    else if (e?.code === 'permission-denied' || e?.code?.includes('permission')) code = 'permission-denied';
    else if (e?.code === 'unavailable' || e?.code?.includes('unavailable')) code = 'firestore/unavailable';
    else if (e?.code === 'not-found') code = 'not-found';
    devLog('wishlist:add err', e);
    return { ok: false, op: 'wishlist:add', code, message: e?.message };
  }
}

export async function removeFromWishlist(listingId: ListingID): Promise<CommerceResult> {
  const user = auth.currentUser;
  if (!user) return { ok: false, op: 'wishlist:remove', code: 'unauthenticated' };
  const path = `wishlists/${user.uid}`;

  try {
    await runTransaction(db, async (tx) => {
      const ref = doc(db, path);
      const snap = await tx.get(ref);
      const data = (snap.exists() ? snap.data() : { items: {} }) as WishlistDoc;
      if (!data.items?.[listingId]) {
        throw { code: 'not-found', message: 'Item not in wishlist' };
      }
      const { [listingId]: _, ...rest } = data.items;
      tx.set(ref, { items: rest, updatedAt: serverTimestamp() }, { merge: true });
    });
    devLog('wishlist:remove ok', { listingId });
    return { ok: true, op: 'wishlist:remove' };
  } catch (e: any) {
    let code = 'unknown' as CommerceErrorCode;
    if (e?.code === 'not-found') code = 'not-found';
    else if (e?.code === 'permission-denied' || e?.code?.includes('permission')) code = 'permission-denied';
    else if (e?.code === 'unavailable' || e?.code?.includes('unavailable')) code = 'firestore/unavailable';
    devLog('wishlist:remove err', e);
    return { ok: false, op: 'wishlist:remove', code, message: e?.message };
  }
}

