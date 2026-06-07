// Format currency helper (USD, with $ symbol)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format relative time helper
export function formatRelativeTime(input: Date | number | string): string {
  const d = new Date(input)
  const diffMs = Date.now() - d.getTime()
  const day = Math.floor(diffMs / 86400000)
  if (day < 1) return 'just now'
  if (day < 7) return day === 1 ? '1 day ago' : `${day} days ago`
  if (day < 30) return `${Math.floor(day / 7)} weeks ago`
  return `${Math.floor(day / 30)} months ago`
}

// Format date helper
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Truncate text helper
export const truncateText = (text: string, maxLength: number): string => {
  if (text == null) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate unique ID helper
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Validate email helper
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number helper
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^[+]?[1-9]\d{9,14}$/.test(cleaned);
};

// Debounce helper
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle helper
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Normalize listing to unified imageUrls format
import type { Listing } from '@/types/commerce';

export function normalizeListing<T extends Partial<Listing>>(raw: T): Listing {
  const imageUrls = Array.isArray(raw.imageUrls) && raw.imageUrls.length
    ? raw.imageUrls
    : Array.isArray(raw.images) && raw.images.length
      ? raw.images
      : raw.imageUrl ? [raw.imageUrl] : [];

  return {
    id: (raw as any).id ?? '',
    title: raw.title ?? '',
    description: raw.description ?? '',
    price: Number(raw.price ?? 0),
    category: raw.category ?? 'Other',
    condition: raw.condition ?? 'Good',
    ownerId: raw.ownerId ?? '',
    status: (raw.status as any) ?? 'active',
    createdAt: (raw.createdAt as any) ?? null,
    imageUrls,
    images: raw.images,
    imageUrl: raw.imageUrl,
    isFeatured: (raw as any).isFeatured ?? false
  };
}