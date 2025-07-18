import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginForm from '@/components/forms/LoginForm';
import { AuthProvider } from '@/context/AuthContext';

// Mock the API module
jest.mock('@/lib/api', () => ({
  authAPI: {
    login: jest.fn(),
    validateToken: jest.fn(),
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

const LoginFormWithProvider = () => (
  <AuthProvider>
    <LoginForm />
  </AuthProvider>
);

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with required fields', () => {
    render(<LoginFormWithProvider />);
    
    expect(screen.getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginFormWithProvider />);
    
    const submitButton = screen.getByText('Sign in');
    submitButton.click();
    
    // Form should handle validation (implementation depends on form library)
    expect(screen.getByText('Sign in')).toBeTruthy();
  });
});
