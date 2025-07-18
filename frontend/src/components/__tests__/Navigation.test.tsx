import React from 'react';
import { render, screen } from '@testing-library/react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';

// Mock the useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Navigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      getToken: jest.fn(),
    });

    render(<Navigation />);

    expect(screen.getByText('Login')).toBeTruthy();
    expect(screen.getByText('Feedback Board')).toBeTruthy();
  });

  it('renders user info when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'testuser', isAdmin: false },
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      getToken: jest.fn(),
    });

    render(<Navigation />);

    expect(screen.getByText(/testuser/)).toBeTruthy();
    expect(screen.getByText('Logout')).toBeTruthy();
  });

  it('shows admin dashboard for admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'admin', isAdmin: true },
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      getToken: jest.fn(),
    });

    render(<Navigation />);

    expect(screen.getByText(/admin/)).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
  });
});
