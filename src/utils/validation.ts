// Email validation
export const validateEmail = (email: string): boolean => {
  if (!email || email.trim() === '') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Form field validation
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateRequired = (value: string | number | undefined | null): FieldValidationResult => {
  if (value === undefined || value === null) {
    return { isValid: false, error: 'This field is required' };
  }
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: 'This field is required' };
  }
  return { isValid: true };
};

export const validateMinLength = (value: string, minLength: number): FieldValidationResult => {
  if (!value || value.length < minLength) {
    return { isValid: false, error: `Must be at least ${minLength} characters long` };
  }
  return { isValid: true };
};

export const validateMaxLength = (value: string, maxLength: number): FieldValidationResult => {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `Must be less than ${maxLength} characters long` };
  }
  return { isValid: true };
};

export const validatePhoneNumber = (phone: string): FieldValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Check for valid phone number format (10 digits or with country code)
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true };
};

export const validatePrice = (price: number | string): FieldValidationResult => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }
  
  if (numPrice < 0) {
    return { isValid: false, error: 'Price cannot be negative' };
  }
  
  if (numPrice > 1000000) {
    return { isValid: false, error: 'Price cannot exceed $1,000,000' };
  }
  
  return { isValid: true };
};

export const validateCardNumber = (cardNumber: string): FieldValidationResult => {
  if (!cardNumber) {
    return { isValid: false, error: 'Card number is required' };
  }
  
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (cleaned.length !== 16) {
    return { isValid: false, error: 'Card number must be 16 digits' };
  }
  
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Card number must contain only digits' };
  }
  
  return { isValid: true };
};

export const validateExpiryDate = (expiryDate: string): FieldValidationResult => {
  if (!expiryDate) {
    return { isValid: false, error: 'Expiry date is required' };
  }
  
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  
  if (!expiryRegex.test(expiryDate)) {
    return { isValid: false, error: 'Please enter a valid expiry date (MM/YY)' };
  }
  
  // Check if card is expired
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const now = new Date();
  
  if (expiry < now) {
    return { isValid: false, error: 'Card has expired' };
  }
  
  return { isValid: true };
};

export const validateCVC = (cvc: string): FieldValidationResult => {
  if (!cvc) {
    return { isValid: false, error: 'CVC is required' };
  }
  
  if (cvc.length < 3 || cvc.length > 4) {
    return { isValid: false, error: 'CVC must be 3 or 4 digits' };
  }
  
  if (!/^\d+$/.test(cvc)) {
    return { isValid: false, error: 'CVC must contain only digits' };
  }
  
  return { isValid: true };
};

// Combined form validation
export interface FormValidationErrors {
  [key: string]: string;
}

export const validateForm = (
  fields: Record<string, any>,
  rules: Record<string, (value: any) => FieldValidationResult>
): { isValid: boolean; errors: FormValidationErrors } => {
  const errors: FormValidationErrors = {};
  
  for (const [fieldName, validateFn] of Object.entries(rules)) {
    const result = validateFn(fields[fieldName]);
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};


