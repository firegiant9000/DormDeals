import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageTransition from './PageTransition';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('PageTransition', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PageTransition className="custom-class">
        <div>Test Content</div>
      </PageTransition>
    );
    
    const div = container.querySelector('div');
    expect(div).toHaveClass('custom-class');
  });

  it('renders without className prop', () => {
    const { container } = render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    );
    
    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <PageTransition>
        <div>Child 1</div>
        <div>Child 2</div>
      </PageTransition>
    );
    
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});

