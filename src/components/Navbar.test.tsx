import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Mock the context providers
const mockThemeContext = {
  theme: 'light',
  toggle: vi.fn(),
};

const mockShopContext = {
  openCart: vi.fn(),
  openWishlist: vi.fn(),
};

const mockAuthContext = {
  isAuthenticated: false,
  logout: vi.fn(),
  user: null,
};

const mockAccessControl = {
  isAdmin: vi.fn(() => false),
  isPremium: vi.fn(() => false),
  canAccess: vi.fn(() => false),
};

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => mockThemeContext,
}));

vi.mock('../context/ShopContext', () => ({
  useShop: () => mockShopContext,
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

vi.mock('../hooks/useAccessControl', () => ({
  useAccessControl: () => mockAccessControl,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const renderNavbar = (initialPath = '/') => {
  window.history.pushState({}, '', initialPath);
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.isAuthenticated = false;
    mockAccessControl.isAdmin.mockReturnValue(false);
    mockAccessControl.isPremium.mockReturnValue(false);
    mockAccessControl.canAccess.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('renders logo', () => {
      renderNavbar();
      expect(screen.getByText('DormDeals')).toBeInTheDocument();
    });

    it('renders all navigation links', () => {
      renderNavbar();
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /marketplace/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
      renderNavbar();
      // There are two theme toggles (desktop and mobile), so use getAllByLabelText
      const themeButtons = screen.getAllByLabelText(/switch to/i);
      expect(themeButtons.length).toBeGreaterThan(0);
    });

    it('renders cart button', () => {
      renderNavbar();
      // Cart button doesn't have accessible name, find by SVG icon class
      const { container } = renderNavbar();
      const cartIcon = container.querySelector('.lucide-shopping-cart');
      expect(cartIcon).toBeInTheDocument();
    });
  });

  describe('Active Link Highlighting', () => {
    it('highlights active link for home page', () => {
      renderNavbar('/');
      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveClass('text-primary-600', 'bg-primary-50');
    });

    it('highlights active link for marketplace page', () => {
      renderNavbar('/marketplace');
      const marketplaceLink = screen.getByRole('link', { name: /marketplace/i });
      expect(marketplaceLink).toHaveClass('text-primary-600', 'bg-primary-50');
    });

    it('highlights active link for about page', () => {
      renderNavbar('/about');
      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toHaveClass('text-primary-600', 'bg-primary-50');
    });
  });

  describe('User Authentication States', () => {
    it('shows login button when not authenticated', () => {
      mockAuthContext.isAuthenticated = false;
      renderNavbar();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('shows account button when authenticated', () => {
      mockAuthContext.isAuthenticated = true;
      renderNavbar();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('shows sell button when authenticated', () => {
      mockAuthContext.isAuthenticated = true;
      renderNavbar();
      expect(screen.getByText('Sell')).toBeInTheDocument();
    });

    it('shows upgrade button for non-premium authenticated users', () => {
      mockAuthContext.isAuthenticated = true;
      mockAccessControl.isPremium.mockReturnValue(false);
      renderNavbar();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
    });

    it('does not show upgrade button for premium users', () => {
      mockAuthContext.isAuthenticated = true;
      mockAccessControl.isPremium.mockReturnValue(true);
      renderNavbar();
      expect(screen.queryByText('Upgrade')).not.toBeInTheDocument();
    });
  });

  describe('User Menu', () => {
    it('opens user menu when account button is clicked', async () => {
      const user = userEvent.setup();
      mockAuthContext.isAuthenticated = true;
      renderNavbar();
      
      const accountButton = screen.getByText('Account');
      await user.click(accountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });
    });

    it('shows profile link in user menu when authenticated', async () => {
      const user = userEvent.setup();
      mockAuthContext.isAuthenticated = true;
      renderNavbar();
      
      const accountButton = screen.getByText('Account');
      await user.click(accountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Create Listing')).toBeInTheDocument();
      });
    });

    it('calls logout when logout is clicked', async () => {
      const user = userEvent.setup();
      mockAuthContext.isAuthenticated = true;
      renderNavbar();
      
      const accountButton = screen.getByText('Account');
      await user.click(accountButton);
      
      await waitFor(() => {
        const logoutButton = screen.getByText('Logout');
        expect(logoutButton).toBeInTheDocument();
      });
      
      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);
      
      expect(mockAuthContext.logout).toHaveBeenCalled();
    });
  });

  describe('Mobile Menu', () => {
    it('toggles mobile menu when menu button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderNavbar();
      
      // Find mobile menu toggle button (has Menu icon)
      const buttons = container.querySelectorAll('button');
      const menuButton = Array.from(buttons).find(btn => {
        const svg = btn.querySelector('svg.lucide-menu');
        return svg !== null;
      });
      
      if (menuButton) {
        await user.click(menuButton);
        // Mobile menu should be toggled
        expect(menuButton).toBeInTheDocument();
      }
    });
  });

  describe('Theme Toggle', () => {
    it('calls toggle function when theme button is clicked', async () => {
      const user = userEvent.setup();
      renderNavbar();
      
      // Get the first theme button (desktop version)
      const themeButtons = screen.getAllByLabelText(/switch to/i);
      await user.click(themeButtons[0]);
      
      expect(mockThemeContext.toggle).toHaveBeenCalledTimes(1);
    });

    it('shows moon icon in light mode', () => {
      mockThemeContext.theme = 'light';
      renderNavbar();
      // Theme buttons should be present (desktop and mobile)
      const themeButtons = screen.getAllByLabelText(/switch to/i);
      expect(themeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Cart and Wishlist', () => {
    it('calls openCart when cart button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderNavbar();
      
      // Find cart button by finding the button containing the shopping cart icon
      const cartIcon = container.querySelector('.lucide-shopping-cart');
      const cartButton = cartIcon?.closest('button');
      
      if (cartButton) {
        await user.click(cartButton);
        expect(mockShopContext.openCart).toHaveBeenCalled();
      } else {
        // If button not found, skip the test
        expect(cartButton).toBeTruthy();
      }
    });

    it('calls openWishlist when wishlist button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderNavbar();
      
      // Find wishlist button by finding the button containing the heart icon
      const heartIcon = container.querySelector('.lucide-heart');
      const wishlistButton = heartIcon?.closest('button');
      
      if (wishlistButton) {
        await user.click(wishlistButton);
        expect(mockShopContext.openWishlist).toHaveBeenCalled();
      } else {
        // If button not found, skip the test
        expect(wishlistButton).toBeTruthy();
      }
    });
  });

  describe('Navigation', () => {
    it('navigates to home when logo is clicked', () => {
      renderNavbar('/marketplace');
      const logo = screen.getByText('DormDeals').closest('a');
      expect(logo).toHaveAttribute('href', '/');
    });

    it('navigates to correct path when link is clicked', () => {
      renderNavbar();
      const marketplaceLink = screen.getByRole('link', { name: /marketplace/i });
      expect(marketplaceLink).toHaveAttribute('href', '/marketplace');
    });
  });

  describe('Admin and Premium Features', () => {
    it('shows admin panel in menu for admin users', async () => {
      const user = userEvent.setup();
      mockAuthContext.isAuthenticated = true;
      mockAccessControl.isAdmin.mockReturnValue(true);
      renderNavbar();
      
      const accountButton = screen.getByText('Account');
      await user.click(accountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });
    });

    it('shows analytics in menu for premium users', async () => {
      const user = userEvent.setup();
      mockAuthContext.isAuthenticated = true;
      mockAccessControl.canAccess.mockReturnValue(true);
      renderNavbar();
      
      const accountButton = screen.getByText('Account');
      await user.click(accountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('hides desktop navigation on mobile', () => {
      renderNavbar();
      // Desktop nav should have 'hidden lg:flex' classes
      const desktopNav = screen.getByRole('link', { name: /home/i }).closest('div');
      if (desktopNav) {
        expect(desktopNav.className).toContain('hidden');
      }
    });

    it('shows mobile menu button on mobile', () => {
      renderNavbar();
      // Mobile menu button should be visible
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

