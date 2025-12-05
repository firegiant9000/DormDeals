import { Listing } from '@/types/commerce';

export function normalizeListing<T extends Partial<Listing>>(raw: T): Listing {
  const imageUrls = Array.isArray((raw as any).imageUrls) && (raw as any).imageUrls.length
    ? (raw as any).imageUrls as string[]
    : ((raw as any).images?.map?.((f: any) => f.url).filter(Boolean) ?? ((raw as any).imageUrl ? [(raw as any).imageUrl] : []));

  const priceNum =
    typeof raw.price === 'number' ? raw.price :
    typeof raw.price === 'string' ? Number.parseFloat(raw.price) :
    0;

  return {
    id: (raw as any).id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    category: (raw as any).category ?? 'Other',
    condition: (raw as any).condition ?? 'Good',
    location: (raw as any).location ?? '',
    pickupMethod: (raw as any).pickupMethod ?? 'pickup',
    status: (raw as any).status ?? 'active',
    ownerId: (raw as any).ownerId ?? '',
    createdAt: (raw as any).createdAt ?? null,
    imageUrls,
    price: Number.isFinite(priceNum) ? priceNum : 0,
  } as Listing;
}

