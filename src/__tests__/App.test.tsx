// Basic test to ensure Jest is working
describe('Basic Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });
});

// Simple component test
describe('Component Tests', () => {
  it('should handle basic math operations', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });
});