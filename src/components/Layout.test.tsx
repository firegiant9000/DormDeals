import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

// Mock Navbar and Footer
vi.mock('./Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('./Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

describe('Layout', () => {
  it('renders navbar and children', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders footer by default', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('hides footer on /chat route', () => {
    render(
      <MemoryRouter initialEntries={['/chat']}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('shows footer on other routes', () => {
    render(
      <MemoryRouter initialEntries={['/marketplace']}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders children in main element', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div data-testid="child-content">Child Content</div>
        </Layout>
      </BrowserRouter>
    );
    
    const main = screen.getByTestId('child-content').closest('main');
    expect(main).toBeInTheDocument();
  });
});

