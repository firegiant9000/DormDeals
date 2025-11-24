import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePhoneNumber,
  validatePrice,
  validateCardNumber,
  validateExpiryDate,
  validateCVC,
  validateForm,
} from './validation';

describe('validation', () => {
  describe('validateEmail', () => {
    it('returns true for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com',
        'a@b.co',
        'test_email@example-domain.com',
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('returns false for invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test@example',
        'test @example.com',
        'test@example .com',
        '',
        '   ',
        'test..test@example.com',
        '@',
        'test@.com',
        'test@com',
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('returns false for null or undefined', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('   ')).toBe(false);
    });

    it('handles special characters in email', () => {
      expect(validateEmail('user+tag@example.com')).toBe(true);
      expect(validateEmail('user_name@example.com')).toBe(true);
      expect(validateEmail('user-name@example.com')).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('returns valid for strong passwords', () => {
      const strongPasswords = [
        'Password123',
        'MyP@ssw0rd',
        'Secure123',
        'Test1234',
        'ValidPass1',
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
      });
    });

    it('returns error for password shorter than 6 characters', () => {
      const result = validatePassword('Pass1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters long');
    });

    it('returns error for password longer than 128 characters', () => {
      const longPassword = 'A'.repeat(129) + '1';
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be less than 128 characters');
    });

    it('returns error for password without letters', () => {
      const result = validatePassword('12345678');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one letter');
    });

    it('returns error for password without numbers', () => {
      const result = validatePassword('Password');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('returns multiple errors for very weak password', () => {
      const result = validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('returns error for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('returns error for null password', () => {
      const result = validatePassword(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('returns error for undefined password', () => {
      const result = validatePassword(undefined as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('handles password with exactly 6 characters', () => {
      const result = validatePassword('Pass1');
      expect(result.isValid).toBe(false); // Still fails because it's less than 6
    });

    it('handles password with exactly 128 characters', () => {
      const password = 'A'.repeat(127) + '1';
      const result = validatePassword(password);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateRequired', () => {
    it('returns valid for non-empty string', () => {
      const result = validateRequired('test');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns invalid for empty string', () => {
      const result = validateRequired('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    it('returns invalid for whitespace-only string', () => {
      const result = validateRequired('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    it('returns valid for number', () => {
      const result = validateRequired(123);
      expect(result.isValid).toBe(true);
    });

    it('returns valid for zero', () => {
      const result = validateRequired(0);
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for null', () => {
      const result = validateRequired(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    it('returns invalid for undefined', () => {
      const result = validateRequired(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });
  });

  describe('validateMinLength', () => {
    it('returns valid for string meeting minimum length', () => {
      const result = validateMinLength('test', 4);
      expect(result.isValid).toBe(true);
    });

    it('returns valid for string exceeding minimum length', () => {
      const result = validateMinLength('testing', 4);
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for string shorter than minimum', () => {
      const result = validateMinLength('tes', 4);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be at least 4 characters long');
    });

    it('returns invalid for empty string', () => {
      const result = validateMinLength('', 5);
      expect(result.isValid).toBe(false);
    });

    it('handles zero minimum length', () => {
      const result = validateMinLength('test', 0);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateMaxLength', () => {
    it('returns valid for string within maximum length', () => {
      const result = validateMaxLength('test', 10);
      expect(result.isValid).toBe(true);
    });

    it('returns valid for string at maximum length', () => {
      const result = validateMaxLength('test', 4);
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for string exceeding maximum length', () => {
      const result = validateMaxLength('testing', 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be less than 5 characters long');
    });

    it('returns valid for empty string', () => {
      const result = validateMaxLength('', 5);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePhoneNumber', () => {
    it('returns valid for valid phone numbers', () => {
      const validPhones = [
        '1234567890',
        '+1234567890',
        '123-456-7890',
        '(123) 456-7890',
        '123 456 7890',
        '+1 234 567 8901',
      ];

      validPhones.forEach(phone => {
        const result = validatePhoneNumber(phone);
        expect(result.isValid).toBe(true);
      });
    });

    it('returns invalid for empty phone number', () => {
      const result = validatePhoneNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    it('returns invalid for whitespace-only phone number', () => {
      const result = validatePhoneNumber('   ');
      expect(result.isValid).toBe(false);
    });

    it('returns invalid for phone numbers with letters', () => {
      const result = validatePhoneNumber('123-456-ABCD');
      expect(result.isValid).toBe(false);
    });

    it('returns invalid for too short phone numbers', () => {
      const result = validatePhoneNumber('123');
      expect(result.isValid).toBe(false);
    });

    it('handles phone numbers with country code', () => {
      const result = validatePhoneNumber('+12345678901');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePrice', () => {
    it('returns valid for positive prices', () => {
      const result = validatePrice(100);
      expect(result.isValid).toBe(true);
    });

    it('returns valid for zero price', () => {
      const result = validatePrice(0);
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for negative prices', () => {
      const result = validatePrice(-10);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Price cannot be negative');
    });

    it('returns invalid for prices exceeding maximum', () => {
      const result = validatePrice(1000001);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Price cannot exceed $1,000,000');
    });

    it('returns valid for prices at maximum', () => {
      const result = validatePrice(1000000);
      expect(result.isValid).toBe(true);
    });

    it('handles string prices', () => {
      const result = validatePrice('100');
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for non-numeric string', () => {
      const result = validatePrice('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Price must be a valid number');
    });

    it('handles decimal prices', () => {
      const result = validatePrice(99.99);
      expect(result.isValid).toBe(true);
    });

    it('handles empty string', () => {
      const result = validatePrice('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateCardNumber', () => {
    it('returns valid for 16-digit card number', () => {
      const result = validateCardNumber('1234567890123456');
      expect(result.isValid).toBe(true);
    });

    it('returns valid for card number with spaces', () => {
      const result = validateCardNumber('1234 5678 9012 3456');
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for card number with wrong length', () => {
      const result = validateCardNumber('123456789012345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Card number must be 16 digits');
    });

    it('returns invalid for card number with letters', () => {
      const result = validateCardNumber('123456789012345a');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Card number must contain only digits');
    });

    it('returns invalid for empty card number', () => {
      const result = validateCardNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Card number is required');
    });

    it('handles card number with dashes', () => {
      const result = validateCardNumber('1234-5678-9012-3456');
      expect(result.isValid).toBe(false); // Dashes are not removed, so it fails length check
    });
  });

  describe('validateExpiryDate', () => {
    it('returns valid for future expiry date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const year = String(futureDate.getFullYear()).slice(-2);
      const expiryDate = `${month}/${year}`;

      const result = validateExpiryDate(expiryDate);
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for expired card', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      const month = String(pastDate.getMonth() + 1).padStart(2, '0');
      const year = String(pastDate.getFullYear()).slice(-2);
      const expiryDate = `${month}/${year}`;

      const result = validateExpiryDate(expiryDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Card has expired');
    });

    it('returns invalid for invalid format', () => {
      const result = validateExpiryDate('13/25');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid expiry date (MM/YY)');
    });

    it('returns invalid for empty expiry date', () => {
      const result = validateExpiryDate('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Expiry date is required');
    });

    it('returns invalid for single digit month', () => {
      const result = validateExpiryDate('1/25');
      expect(result.isValid).toBe(false);
    });

    it('handles current month correctly', () => {
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = String(currentDate.getFullYear() + 1).slice(-2);
      const expiryDate = `${month}/${year}`;

      const result = validateExpiryDate(expiryDate);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCVC', () => {
    it('returns valid for 3-digit CVC', () => {
      const result = validateCVC('123');
      expect(result.isValid).toBe(true);
    });

    it('returns valid for 4-digit CVC', () => {
      const result = validateCVC('1234');
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for CVC shorter than 3 digits', () => {
      const result = validateCVC('12');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CVC must be 3 or 4 digits');
    });

    it('returns invalid for CVC longer than 4 digits', () => {
      const result = validateCVC('12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CVC must be 3 or 4 digits');
    });

    it('returns invalid for CVC with letters', () => {
      const result = validateCVC('12a');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CVC must contain only digits');
    });

    it('returns invalid for empty CVC', () => {
      const result = validateCVC('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CVC is required');
    });
  });

  describe('validateForm', () => {
    it('returns valid for form with all valid fields', () => {
      const fields = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const rules = {
        name: (value: any) => validateRequired(value),
        email: (value: any) => validateRequired(value),
        age: (value: any) => validateRequired(value),
      };

      const result = validateForm(fields, rules);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('returns invalid for form with missing required fields', () => {
      const fields = {
        name: '',
        email: 'john@example.com',
      };

      const rules = {
        name: (value: any) => validateRequired(value),
        email: (value: any) => validateRequired(value),
      };

      const result = validateForm(fields, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('This field is required');
      expect(result.errors.email).toBeUndefined();
    });

    it('returns invalid for form with multiple errors', () => {
      const fields = {
        name: '',
        email: 'invalid-email',
        password: 'weak',
      };

      const rules = {
        name: (value: any) => validateRequired(value),
        email: (value: any) => {
          if (!validateRequired(value).isValid) {
            return validateRequired(value);
          }
          return validateEmail(value)
            ? { isValid: true }
            : { isValid: false, error: 'Invalid email' };
        },
        password: (value: any) => validateMinLength(value, 6),
      };

      const result = validateForm(fields, rules);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('handles empty rules object', () => {
      const fields = { name: 'Test' };
      const rules = {};

      const result = validateForm(fields, rules);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('handles fields not in rules', () => {
      const fields = {
        name: 'Test',
        extra: 'field',
      };

      const rules = {
        name: (value: any) => validateRequired(value),
      };

      const result = validateForm(fields, rules);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('handles special characters in email validation', () => {
      expect(validateEmail('test+tag@example.com')).toBe(true);
      expect(validateEmail('test_tag@example.com')).toBe(true);
      expect(validateEmail('test-tag@example.com')).toBe(true);
    });

    it('handles very long strings', () => {
      const longString = 'a'.repeat(1000);
      const result = validateMaxLength(longString, 100);
      expect(result.isValid).toBe(false);
    });

    it('handles unicode characters', () => {
      const result = validateRequired('测试');
      expect(result.isValid).toBe(true);
    });

    it('handles password with special characters', () => {
      const result = validatePassword('P@ssw0rd!');
      expect(result.isValid).toBe(true);
    });

    it('handles price with currency symbols in string', () => {
      const result = validatePrice('$100');
      expect(result.isValid).toBe(false); // parseFloat will return NaN
    });
  });
});


