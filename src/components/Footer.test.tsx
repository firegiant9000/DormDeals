import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

// Mock the AuthContext
const mockAuthContext = {
  isAuthenticated: false,
  logout: vi.fn(),
  user: null,
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.isAuthenticated = false;
  });

  describe('Rendering', () => {
    it('renders footer with brand logo and name', () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );
      expect(screen.getByText('DormDeals')).toBeInTheDocument();
    });

    it('renders all navigation links', () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );
      expect(screen.getByText('Marketplace')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('renders copyright text', () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );
      expect(screen.getByText(/DormDeals\. Made by UL students/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('has correct links to marketplace and about', () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );
      const marketplaceLink = screen.getByText('Marketplace').closest('a');
      const aboutLink = screen.getByText('About').closest('a');
      
      expect(marketplaceLink).toHaveAttribute('href', '/marketplace');
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('has mailto link for support', () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );
      const supportLink = screen.getByText('Support').closest('a');
      expect(supportLink).toHaveAttribute('href', 'mailto:support@dormdeals.com');
    });
  });

  describe('Authentication Handling', () => {
    it('allows profile navigation when authenticated', async () => {
      mockAuthContext.isAuthenticated = true;
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );
      
      const profileLink = screen.getByText('Profile').closest('a');
      expect(profileLink).toBeInTheDocument();
      
      await user.click(profileLink!);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('redirects to login when profile clicked and not authenticated', async () => {
      mockAuthContext.isAuthenticated = false;
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );
      
      const profileLink = screen.getByText('Profile').closest('a');
      await user.click(profileLink!);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});

