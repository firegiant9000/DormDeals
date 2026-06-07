import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { Item } from '@/types';
import { useCartWishlist } from '@/hooks/useCommerce';
import {
  addToCart as addToCartService,
  removeFromCart as removeFromCartService,
  addToWishlist as addToWishlistService,
  removeFromWishlist as removeFromWishlistService,
} from '@/services/commerceService';
import { getListingById } from '@/services/listingService';
import { trackEvent } from '@/services/analytics';

type ShopContextValue = {
  cartItems: Item[];
  wishlistItems: Item[];
  cartCount: number;
  wishlistCount: number;
  showCart: boolean;
  showWishlist: boolean;
  isInCart: (id: string) => boolean;
  isInWishlist: (id: string) => boolean;
  addToCart: (item: Item) => Promise<void>;
  addToWishlist: (item: Item) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  setShowCart: (v: boolean) => void;
  setShowWishlist: (v: boolean) => void;
  openCart: () => void;
  openWishlist: () => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Drawer visibility
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  // Real-time state via hooks (now user-aware)
  const {
    cart,
    wishlist,
    isInCart: isInCartHook,
    isInWishlist: isInWishlistHook,
    cartCount,
    wishlistCount,
  } = useCartWishlist(user?.id);
  // We need full Item[] for IDs we track in cart/wishlist
  const [cartItems, setCartItems] = useState<Item[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Item[]>([]);

  // Resolve cart/wishlist item IDs into Item[] by fetching each listing
  useEffect(() => {
    const fetchItems = async () => {
      const cartIds = Object.keys(cart.items || {});
      const wishlistIds = Object.keys(wishlist.items || {});

      // Fetch cart items
      const cartPromises = cartIds.map((id) => 
        getListingById(id).catch((err) => {
          if (import.meta.env.DEV) console.error(`[ShopContext] Failed to fetch cart item ${id}`, err);
          return null;
        })
      );
      const cartResults = await Promise.all(cartPromises);
      const resolvedCart = cartResults.filter((x): x is Item => !!x);
      setCartItems(resolvedCart);

      // Fetch wishlist items
      const wishlistPromises = wishlistIds.map((id) => 
        getListingById(id).catch((err) => {
          if (import.meta.env.DEV) console.error(`[ShopContext] Failed to fetch wishlist item ${id}`, err);
          return null;
        })
      );
      const wishlistResults = await Promise.all(wishlistPromises);
      const resolvedWishlist = wishlistResults.filter((x): x is Item => !!x);
      setWishlistItems(resolvedWishlist);
    };

    if (isAuthenticated) {
      fetchItems();
    } else {
      setCartItems([]);
      setWishlistItems([]);
    }
  }, [cart.items, wishlist.items, isAuthenticated]);

  const isInCart = useCallback((id: string) => isInCartHook(id), [isInCartHook]);
  const isInWishlist = useCallback((id: string) => isInWishlistHook(id), [isInWishlistHook]);

  const addToCart = useCallback(
    async (item: Item) => {
      if (!isAuthenticated) {
        toast.error('Please log in to add items to cart');
        return;
      }
      const result = await addToCartService(item.id);
      if (!result.ok) {
        toast.error(`[${result.code}] ${result.op}`);
      } else {
        trackEvent('cart_add', { listing_id: item.id });
        toast.success('Added to cart');
        setShowCart(true);
      }
    },
    [isAuthenticated]
  );

  const addToWishlist = useCallback(
    async (item: Item) => {
      if (!isAuthenticated) {
        toast.error('Please log in to add items to wishlist');
        return;
      }
      const result = await addToWishlistService(item.id);
      if (!result.ok) {
        toast.error(`[${result.code}] ${result.op}`);
      } else {
        toast.success('Added to wishlist');
        setShowWishlist(true);
      }
    },
    [isAuthenticated]
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return;
      const result = await removeFromCartService(id);
      if (!result.ok) toast.error(`[${result.code}] ${result.op}`);
      else toast.success('Removed from cart');
    },
    [isAuthenticated]
  );

  const removeFromWishlist = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return;
      const result = await removeFromWishlistService(id);
      if (!result.ok) toast.error(`[${result.code}] ${result.op}`);
      else toast.success('Removed from wishlist');
    },
    [isAuthenticated]
  );

  const openCart = useCallback(() => {
    setShowWishlist(false);
    setShowCart(true);
  }, []);

  const openWishlist = useCallback(() => {
    setShowCart(false);
    setShowWishlist(true);
  }, []);

  const value: ShopContextValue = useMemo(
    () => ({
      cartItems,
      wishlistItems,
      cartCount,
      wishlistCount,
      showCart,
      showWishlist,
      isInCart,
      isInWishlist,
      addToCart,
      addToWishlist,
      removeFromCart,
      removeFromWishlist,
      setShowCart,
      setShowWishlist,
      openCart,
      openWishlist,
    }),
    [
      cartItems,
      wishlistItems,
      cartCount,
      wishlistCount,
      showCart,
      showWishlist,
      isInCart,
      isInWishlist,
      addToCart,
      addToWishlist,
      removeFromCart,
      removeFromWishlist,
      openCart,
      openWishlist,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
};

// Cart and Wishlist Drawers
import CartDrawer from '@/components/CartDrawer';
import WishlistDrawer from '@/components/WishlistDrawer';

export const ShopDrawers: React.FC = () => {
  return (
    <>
      <CartDrawer />
      <WishlistDrawer />
    </>
  );
};