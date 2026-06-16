import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CartSummary from './CartSummary';

// Mock ShopContext
const mockCartItems = [
  {
    id: '1',
    title: 'Test Item 1',
    price: 10.99,
    condition: 'New',
    category: 'Electronics',
  },
  {
    id: '2',
    title: 'Test Item 2',
    price: 25.50,
    condition: 'Used',
    category: 'Books',
  },
];

const mockShopContext = {
  cartItems: mockCartItems,
  openCart: vi.fn(),
  openWishlist: vi.fn(),
};

vi.mock('../context/ShopContext', () => ({
  useShop: () => mockShopContext,
}));

// Mock formatCurrency
vi.mock('../utils/helpers', () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
}));

describe('CartSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockShopContext.cartItems = mockCartItems;
  });

  describe('Rendering', () => {
    it('renders order summary title', () => {
      render(<CartSummary />);
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });

    it('renders cart items', () => {
      render(<CartSummary />);
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });

    it('displays item details correctly', () => {
      render(<CartSummary />);
      expect(screen.getByText(/New.*Electronics/i)).toBeInTheDocument();
      expect(screen.getByText(/Used.*Books/i)).toBeInTheDocument();
    });

    it('displays item prices', () => {
      render(<CartSummary />);
      expect(screen.getByText('$10.99')).toBeInTheDocument();
      expect(screen.getByText('$25.50')).toBeInTheDocument();
    });
  });

  describe('Empty Cart', () => {
    it('shows empty cart message when cart is empty', () => {
      mockShopContext.cartItems = [];
      render(<CartSummary />);
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('does not show order summary when cart is empty', () => {
      mockShopContext.cartItems = [];
      render(<CartSummary />);
      expect(screen.queryByText('Subtotal')).not.toBeInTheDocument();
    });
  });

  describe('Calculations', () => {
    it('calculates and displays subtotal correctly', () => {
      render(<CartSummary />);
      // 10.99 + 25.50 = 36.49
      expect(screen.getByText('$36.49')).toBeInTheDocument();
    });

    it('calculates and displays service fee (5%)', () => {
      render(<CartSummary />);
      // 5% of 36.49 = 1.8245 ≈ 1.82
      expect(screen.getByText('$1.82')).toBeInTheDocument();
    });

    it('calculates and displays total correctly', () => {
      render(<CartSummary />);
      // 36.49 + 1.82 = 38.31
      const totalElements = screen.getAllByText('$38.31');
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('shows subtotal, fee, and total sections', () => {
      render(<CartSummary />);
      expect(screen.getByText('Subtotal')).toBeInTheDocument();
      expect(screen.getByText(/Service Fee \(5%\)/)).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<CartSummary className="custom-class" />);
      const summaryDiv = container.querySelector('.custom-class');
      expect(summaryDiv).toBeInTheDocument();
    });

    it('renders without custom className', () => {
      const { container } = render(<CartSummary />);
      const summaryDiv = container.querySelector('.bg-white');
      expect(summaryDiv).toBeInTheDocument();
    });
  });

  describe('Single Item', () => {
    it('handles single item in cart', () => {
      mockShopContext.cartItems = [mockCartItems[0]];
      render(<CartSummary />);
      
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      // $10.99 appears twice: the item price and the subtotal
      expect(screen.getAllByText('$10.99').length).toBeGreaterThanOrEqual(2);
    });
  });
});

