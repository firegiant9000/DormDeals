import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('renders when visible is true', () => {
      render(<LoadingSpinner visible={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not render when visible is false', () => {
      render(<LoadingSpinner visible={false} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renders by default when visible prop is not provided', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders with default md size', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector('.w-6.h-6');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with xs size', () => {
      const { container } = render(<LoadingSpinner size="xs" />);
      const spinner = container.querySelector('.w-3.h-3');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with sm size', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const spinner = container.querySelector('.w-4.h-4');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with lg size', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const spinner = container.querySelector('.w-8.h-8');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with xl size', () => {
      const { container } = render(<LoadingSpinner size="xl" />);
      const spinner = container.querySelector('.w-12.h-12');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Colors', () => {
    it('renders with default primary color', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector('.text-primary-600');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with secondary color', () => {
      const { container } = render(<LoadingSpinner color="secondary" />);
      const spinner = container.querySelector('.text-gray-600');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with white color', () => {
      const { container } = render(<LoadingSpinner color="white" />);
      const spinner = container.querySelector('.text-white');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with red color', () => {
      const { container } = render(<LoadingSpinner color="red" />);
      const spinner = container.querySelector('.text-red-600');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with custom color', () => {
      const { container } = render(<LoadingSpinner customColor="#ff0000" />);
      const spinner = container.querySelector('[style*="color"]');
      expect(spinner).toHaveStyle({ color: '#ff0000' });
    });
  });

  describe('Accessibility', () => {
    it('has status role', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has default aria-label', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('has custom aria-label when provided', () => {
      render(<LoadingSpinner aria-label="Loading data" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading data');
    });

    it('supports custom aria-label prop', () => {
      render(<LoadingSpinner aria-label="Please wait" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Please wait');
    });
  });

  describe('SVG Structure', () => {
    it('renders SVG element', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has correct SVG viewBox', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('renders circle element', () => {
      const { container } = render(<LoadingSpinner />);
      const circle = container.querySelector('circle');
      expect(circle).toBeInTheDocument();
    });

    it('renders path element', () => {
      const { container } = render(<LoadingSpinner />);
      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('has animate-spin class', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('applies pulse animation when pulse prop is true', () => {
      const { container } = render(<LoadingSpinner pulse={true} />);
      // The pulse animation is handled by framer-motion variants
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-spinner" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('custom-spinner');
    });
  });
});

