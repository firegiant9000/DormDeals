/**
 * Test data fixtures for E2E tests
 * Centralized test data to maintain consistency across tests
 */

export interface TestUser {
  email: string;
  password: string;
  name: string;
  id: string;
}

export interface TestProduct {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
}

export interface MockApiResponse {
  status: number;
  data: unknown;
  message?: string;
}

/**
 * Sample test user data
 */
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
    id: 'user-123',
  } as TestUser,
  
  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    name: 'Admin User',
    id: 'admin-456',
  } as TestUser,
  
  newUser: {
    email: 'newuser@example.com',
    password: 'NewPassword123!',
    name: 'New User',
    id: 'user-789',
  } as TestUser,
};

/**
 * Sample product/test item data
 */
export const testProducts = {
  validProduct: {
    title: 'Test Product',
    description: 'This is a test product description',
    price: 29.99,
    category: 'Electronics',
    condition: 'Like New',
  } as TestProduct,
  
  furniture: {
    title: 'Office Chair',
    description: 'Comfortable office chair in excellent condition',
    price: 75.00,
    category: 'Furniture',
    condition: 'Good',
  } as TestProduct,
  
  textbook: {
    title: 'Introduction to Computer Science',
    description: 'Textbook for CS101 course',
    price: 45.00,
    category: 'Textbooks',
    condition: 'Used',
  } as TestProduct,
};

/**
 * Mock API responses
 */
export const mockApiResponses = {
  success: {
    status: 200,
    data: { message: 'Success' },
  } as MockApiResponse,
  
  created: {
    status: 201,
    data: { id: 'new-id', message: 'Created successfully' },
  } as MockApiResponse,
  
  unauthorized: {
    status: 401,
    data: { error: 'Unauthorized' },
    message: 'Authentication required',
  } as MockApiResponse,
  
  notFound: {
    status: 404,
    data: { error: 'Not Found' },
    message: 'Resource not found',
  } as MockApiResponse,
  
  serverError: {
    status: 500,
    data: { error: 'Internal Server Error' },
    message: 'Something went wrong',
  } as MockApiResponse,
};

/**
 * Test form data
 */
export const testFormData = {
  login: {
    email: testUsers.validUser.email,
    password: testUsers.validUser.password,
  },
  
  registration: {
    name: 'New Test User',
    email: 'newtest@example.com',
    password: 'NewTest123!',
    confirmPassword: 'NewTest123!',
  },
  
  search: {
    query: 'laptop',
    category: 'Electronics',
    minPrice: 0,
    maxPrice: 1000,
  },
};

