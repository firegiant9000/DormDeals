import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock AuthContext
const mockAuthContext = {
  isAuthenticated: false,
  isLoading: false,
  logout: vi.fn(),
  user: null,
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// ProtectedRoute redirects with <Navigate to="/login" state={{ from: location }} replace />.
// It MUST be rendered inside a <Routes> that has a /login route, exactly as App.tsx does.
// Rendering it as a bare child of <MemoryRouter> (no Routes) leaves <Navigate> mounted on
// every location change; with a fresh `state` object each render react-router treats every
// redirect as a new location, re-renders, and navigates again — an infinite loop that grows
// the heap until the worker OOMs. Gating it behind a real /login route lets the redirect
// resolve and unmount ProtectedRoute, which is what happens in production.
function renderProtected(initialEntry = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.isLoading = false;
  });

  it('renders children when authenticated', () => {
    mockAuthContext.isAuthenticated = true;

    renderProtected();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    mockAuthContext.isLoading = true;

    renderProtected();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.isLoading = false;

    renderProtected();

    // Should redirect to the login route, not render the protected content.
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders loading spinner when loading', () => {
    mockAuthContext.isLoading = true;

    const { container } = renderProtected();

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
