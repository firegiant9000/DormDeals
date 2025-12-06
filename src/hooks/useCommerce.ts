import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { CartDoc, WishlistDoc } from '@/types/commerce';

export function useCartWishlist() {
  const [cart, setCart] = useState<CartDoc>({ items: {} });
  const [wishlist, setWishlist] = useState<WishlistDoc>({ items: {} });
  const [listenerStatus, setListenerStatus] = useState<'active' | 'inactive' | 'error'>('inactive');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setCart({ items: {} });
      setWishlist({ items: {} });
      setListenerStatus('inactive');
      return;
    }

    if (import.meta.env.DEV) {
      console.log('[COMMERCE] Setting up listeners for uid:', uid);
    }

    let cartUnsub: (() => void) | null = null;
    let wishlistUnsub: (() => void) | null = null;

    try {
      cartUnsub = onSnapshot(
        doc(db, `carts/${uid}`),
        (snap) => {
          const data = snap.exists() ? (snap.data() as CartDoc) : { items: {} };
          setCart(data);
          setListenerStatus('active');
          if (import.meta.env.DEV) {
            console.log('[COMMERCE] Cart updated', { count: Object.keys(data.items || {}).length });
          }
        },
        (error) => {
          setListenerStatus('error');
          if (import.meta.env.DEV) {
            console.error('[COMMERCE] Cart listener error', error);
          }
        }
      );

      wishlistUnsub = onSnapshot(
        doc(db, `wishlists/${uid}`),
        (snap) => {
          const data = snap.exists() ? (snap.data() as WishlistDoc) : { items: {} };
          setWishlist(data);
          setListenerStatus('active');
          if (import.meta.env.DEV) {
            console.log('[COMMERCE] Wishlist updated', { count: Object.keys(data.items || {}).length });
          }
        },
        (error) => {
          setListenerStatus('error');
          if (import.meta.env.DEV) {
            console.error('[COMMERCE] Wishlist listener error', error);
          }
        }
      );
    } catch (error) {
      setListenerStatus('error');
      if (import.meta.env.DEV) {
        console.error('[COMMERCE] Listener setup error', error);
      }
    }

    return () => {
      if (cartUnsub) cartUnsub();
      if (wishlistUnsub) wishlistUnsub();
      if (import.meta.env.DEV) {
        console.log('[COMMERCE] Cleaned up listeners');
      }
    };
  }, []);

  return {
    cart,
    wishlist,
    isInCart: (id: string) => !!cart.items?.[id],
    isInWishlist: (id: string) => !!wishlist.items?.[id],
    cartCount: Object.keys(cart.items || {}).length,
    wishlistCount: Object.keys(wishlist.items || {}).length,
    listenerStatus,
  };
}

