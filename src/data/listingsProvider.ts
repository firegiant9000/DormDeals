import { collection, query, where, orderBy, getDocs, startAfter } from 'firebase/firestore';
import { db } from '@/firebase';
import { normalizeListing } from '@/utils/helpers';
import type { Listing } from '@/types/commerce';

export async function fetchMarketplace({ 
  category, 
  condition, 
  minPrice, 
  maxPrice, 
  sort = 'newest' as 'newest'|'priceLow'|'priceHigh', 
  pageToken 
}: {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest'|'priceLow'|'priceHigh';
  pageToken?: any;
}): Promise<{ items: Listing[]; nextPageToken: any }> {
  let q = query(
    collection(db, 'listings'),
    where('status', '==', 'active')
  );

  if (category && category !== 'All Categories') q = query(q, where('category', '==', category));
  if (condition && condition !== 'Any Condition') q = query(q, where('condition', '==', condition));

  if (sort === 'newest') q = query(q, orderBy('createdAt', 'desc'));
  if (sort === 'priceLow') q = query(q, orderBy('price', 'asc'));
  if (sort === 'priceHigh') q = query(q, orderBy('price', 'desc'));

  if (pageToken) q = query(q, startAfter(pageToken));

  const snap = await getDocs(q);
  let items = snap.docs.map(d => normalizeListing({ id: d.id, ...d.data() } as any));
  // Price-range filtering is applied client-side: a Firestore inequality on
  // `price` requires `price` to be the first orderBy, which conflicts with the
  // newest (createdAt) sort and has no valid index. See firestore_indexes_audit.md.
  if (typeof minPrice === 'number') items = items.filter(i => i.price >= minPrice);
  if (typeof maxPrice === 'number') items = items.filter(i => i.price <= maxPrice);
  return { items, nextPageToken: snap.docs[snap.docs.length - 1] ?? null };
}

// Legacy compatibility functions
export async function fetchListings(opts?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  limitN?: number;
}): Promise<any[]> {
  const result = await fetchMarketplace({
    category: opts?.category,
    minPrice: opts?.minPrice,
    maxPrice: opts?.maxPrice,
    sort: 'newest'
  });
  return result.items.slice(0, opts?.limitN || 100);
}

export function subscribeListings(
  onData: (rows: any[]) => void,
  onErr?: (e: any) => void,
  opts?: Parameters<typeof fetchListings>[0]
) {
  // For now, just fetch once - can be enhanced with onSnapshot later
  fetchListings(opts)
    .then(onData)
    .catch((err) => {
      if (onErr) onErr(err);
    });
  return () => {}; // unsubscribe stub
}
