import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { CartDoc, WishlistDoc } from '@/types/commerce';

export function useCartWishlist(userId?: string) {
  const [cart, setCart] = useState<CartDoc>({ items: {} });
  const [wishlist, setWishlist] = useState<WishlistDoc>({ items: {} });
  const [listenerStatus, setListenerStatus] =
    useState<'active' | 'inactive' | 'error'>('inactive');

  useEffect(() => {
    let cartUnsub: (() => void) | undefined;
    let wishlistUnsub: (() => void) | undefined;

    // No user: clear state and don't listen
    if (!userId) {
      if (import.meta.env.DEV) {
        console.log('[COMMERCE] No userId, clearing cart/wishlist');
      }
      setCart({ items: {} });
      setWishlist({ items: {} });
      setListenerStatus('inactive');

      return () => {
        cartUnsub?.();
        wishlistUnsub?.();
      };
    }

    if (import.meta.env.DEV) {
      console.log('[COMMERCE] Setting up listeners for uid:', userId);
    }

    try {
      // Listen to users/{uid}/cart
      const cartRef = collection(db, 'users', userId, 'cart');
      cartUnsub = onSnapshot(
        query(cartRef),
        (snap) => {
          const items: Record<string, true> = {};
          snap.forEach((doc) => {
            const listingId = doc.id;
            items[listingId] = true as const;
          });
          setCart({ items });
          setListenerStatus('active');

          if (import.meta.env.DEV) {
            console.log('[COMMERCE] Cart updated', {
              count: Object.keys(items).length,
            });
          }
        },
        (error) => {
          setListenerStatus('error');
          if (import.meta.env.DEV) {
            console.error('[COMMERCE] Cart listener error', error);
          }
        }
      );

      // Listen to users/{uid}/favorites (wishlist)
      const favoritesRef = collection(db, 'users', userId, 'favorites');
      wishlistUnsub = onSnapshot(
        query(favoritesRef),
        (snap) => {
          const items: Record<string, true> = {};
          snap.forEach((doc) => {
            const listingId = doc.id;
            items[listingId] = true as const;
          });
          setWishlist({ items });
          setListenerStatus('active');

          if (import.meta.env.DEV) {
            console.log('[COMMERCE] Wishlist updated', {
              count: Object.keys(items).length,
            });
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
      cartUnsub?.();
      wishlistUnsub?.();
      if (import.meta.env.DEV) {
        console.log('[COMMERCE] Cleaned up listeners for uid:', userId);
      }
    };
  }, [userId]);

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