// Format currency helper (without $ symbol)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format relative time helper
export function formatRelativeTime(input: Date | number | string): string {
  const d = typeof input === 'string' ? new Date(input) : new Date(input)
  const diffMs = Date.now() - d.getTime()
  const sec = Math.floor(diffMs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (day > 0) return `${day}d ago`
  if (hr > 0) return `${hr}h ago`
  if (min > 0) return `${min}m ago`
  return `${sec}s ago`
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
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
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
    imageUrl: raw.imageUrl
  };
}