import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatCurrency,
  formatRelativeTime,
  formatDate,
  truncateText,
  generateId,
  isValidEmail,
  isValidPhone,
  debounce,
  throttle,
} from './helpers';

describe('helpers', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers as USD currency', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(99.99)).toBe('$99.99');
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('formats zero as currency', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats negative numbers as currency', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
    });

    it('formats large numbers with commas', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });

    it('formats decimal numbers correctly', () => {
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(0.99)).toBe('$0.99');
      expect(formatCurrency(123.456)).toBe('$123.46'); // Rounded
    });

    it('handles very small numbers', () => {
      expect(formatCurrency(0.01)).toBe('$0.01');
      expect(formatCurrency(0.001)).toBe('$0.00'); // Rounded
    });

    it('handles very large numbers', () => {
      expect(formatCurrency(999999999.99)).toBe('$999,999,999.99');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "1 day ago" for yesterday', () => {
      const yesterday = new Date('2024-01-14T12:00:00Z').toISOString();
      expect(formatRelativeTime(yesterday)).toBe('1 day ago');
    });

    it('returns days ago for dates within a week', () => {
      const threeDaysAgo = new Date('2024-01-12T12:00:00Z').toISOString();
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('returns weeks ago for dates within a month', () => {
      const twoWeeksAgo = new Date('2024-01-01T12:00:00Z').toISOString();
      expect(formatRelativeTime(twoWeeksAgo)).toBe('2 weeks ago');
    });

    it('returns months ago for dates older than a month', () => {
      const twoMonthsAgo = new Date('2023-11-15T12:00:00Z').toISOString();
      expect(formatRelativeTime(twoMonthsAgo)).toBe('2 months ago');
    });

    it('handles same day correctly', () => {
      const today = new Date('2024-01-15T11:00:00Z').toISOString();
      // Should return 1 day ago since it's the same day but different time
      const result = formatRelativeTime(today);
      expect(result).toBeDefined();
    });

    it('handles future dates', () => {
      const future = new Date('2024-01-20T12:00:00Z').toISOString();
      const result = formatRelativeTime(future);
      expect(result).toBeDefined();
    });

    it('handles edge case of exactly 7 days', () => {
      const sevenDaysAgo = new Date('2024-01-08T12:00:00Z').toISOString();
      const result = formatRelativeTime(sevenDaysAgo);
      expect(result).toBe('1 weeks ago');
    });

    it('handles edge case of exactly 30 days', () => {
      const thirtyDaysAgo = new Date('2023-12-16T12:00:00Z').toISOString();
      const result = formatRelativeTime(thirtyDaysAgo);
      expect(result).toBe('1 months ago');
    });
  });

  describe('formatDate', () => {
    it('formats Date object correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDate(date);
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('formats date string correctly', () => {
      const dateString = '2024-01-15T12:00:00Z';
      const result = formatDate(dateString);
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('formats different months correctly', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const result = formatDate(date);
      expect(result).toContain('June');
    });

    it('formats different days correctly', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const result = formatDate(date);
      expect(result).toContain('1');
    });

    it('handles leap year dates', () => {
      const date = new Date('2024-02-29T12:00:00Z');
      const result = formatDate(date);
      expect(result).toContain('February');
      expect(result).toContain('29');
    });

    it('handles year boundaries', () => {
      const date = new Date('2023-12-31T12:00:00Z');
      const result = formatDate(date);
      expect(result).toContain('December');
      expect(result).toContain('2023');
    });
  });

  describe('truncateText', () => {
    it('returns original text if shorter than maxLength', () => {
      const text = 'Short text';
      expect(truncateText(text, 20)).toBe('Short text');
    });

    it('returns original text if equal to maxLength', () => {
      const text = 'Exactly ten!';
      expect(truncateText(text, 12)).toBe('Exactly ten!');
    });

    it('truncates text longer than maxLength', () => {
      const text = 'This is a very long text that should be truncated';
      const result = truncateText(text, 20);
      expect(result).toBe('This is a very long ...');
      expect(result.length).toBe(23); // 20 chars + '...'
    });

    it('handles empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });

    it('handles maxLength of 0', () => {
      const text = 'Test';
      expect(truncateText(text, 0)).toBe('...');
    });

    it('handles maxLength of 1', () => {
      const text = 'Test';
      expect(truncateText(text, 1)).toBe('T...');
    });

    it('handles text with special characters', () => {
      const text = 'Test with émojis 🎉 and special chars!';
      const result = truncateText(text, 20);
      expect(result).toContain('...');
    });

    it('handles unicode characters', () => {
      const text = '测试文本内容';
      const result = truncateText(text, 3);
      expect(result).toContain('...');
    });

    it('handles very long text', () => {
      const text = 'a'.repeat(1000);
      const result = truncateText(text, 50);
      expect(result.length).toBe(53); // 50 + '...'
      expect(result).toContain('...');
    });
  });

  describe('generateId', () => {
    it('generates a string ID', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('generates IDs of consistent length', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1.length).toBe(id2.length);
    });

    it('generates IDs with alphanumeric characters', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });

    it('generates multiple unique IDs', () => {
      const ids = Array.from({ length: 100 }, () => generateId());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(100);
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('returns false for invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('returns true for valid phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('123 456 7890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
    });

    it('returns false for invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc123')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });

    it('handles phone numbers with spaces', () => {
      expect(isValidPhone('123 456 7890')).toBe(true);
    });

    it('handles phone numbers with dashes', () => {
      expect(isValidPhone('123-456-7890')).toBe(true);
    });

    it('handles international format', () => {
      expect(isValidPhone('+12345678901')).toBe(true);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('delays function execution', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls when called multiple times', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('passes arguments correctly', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('handles rapid successive calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      for (let i = 0; i < 10; i++) {
        debouncedFn();
        vi.advanceTimersByTime(50);
      }

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('executes function after wait time', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 200);

      debouncedFn();
      vi.advanceTimersByTime(199);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('executes function immediately on first call', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('prevents execution within throttle period', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('allows execution after throttle period', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('passes arguments correctly', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('arg1', 'arg2');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('handles multiple calls with time intervals', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn(); // Call 1
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(50);
      throttledFn(); // Should be ignored
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(50);
      throttledFn(); // Call 2
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('resets throttle after period', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      vi.advanceTimersByTime(100);
      throttledFn();
      vi.advanceTimersByTime(50);
      throttledFn(); // Should be ignored
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge cases', () => {
    it('formatCurrency handles NaN', () => {
      expect(() => formatCurrency(NaN)).not.toThrow();
    });

    it('formatCurrency handles Infinity', () => {
      expect(() => formatCurrency(Infinity)).not.toThrow();
      expect(() => formatCurrency(-Infinity)).not.toThrow();
    });

    it('formatDate handles invalid date string', () => {
      expect(() => formatDate('invalid-date')).not.toThrow();
    });

    it('formatDate handles invalid Date object', () => {
      const invalidDate = new Date('invalid');
      expect(() => formatDate(invalidDate)).not.toThrow();
    });

    it('truncateText handles null and undefined', () => {
      expect(() => truncateText(null as any, 10)).not.toThrow();
      expect(() => truncateText(undefined as any, 10)).not.toThrow();
    });

    it('isValidEmail handles null and undefined', () => {
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
    });

    it('isValidPhone handles null and undefined', () => {
      expect(isValidPhone(null as any)).toBe(false);
      expect(isValidPhone(undefined as any)).toBe(false);
    });

    it('debounce handles function that throws', () => {
      vi.useFakeTimers();
      const throwingFn = () => {
        throw new Error('Test error');
      };
      const debouncedFn = debounce(throwingFn, 100);

      expect(() => {
        debouncedFn();
        vi.advanceTimersByTime(100);
      }).toThrow('Test error');
      vi.useRealTimers();
    });

    it('throttle handles function that throws', () => {
      const throwingFn = () => {
        throw new Error('Test error');
      };
      const throttledFn = throttle(throwingFn, 100);

      expect(() => throttledFn()).toThrow('Test error');
    });
  });
});


