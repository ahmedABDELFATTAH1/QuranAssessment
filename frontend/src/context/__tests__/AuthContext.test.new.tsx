import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  authAPI: {
    login: jest.fn(),
    validateToken: jest.fn(),
  },
}));

const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

// Test component to use the auth context
const TestComponent = () => {
  const { user, login, logout, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading...' : 'Loaded'}</div>
      <div data-testid="user">{user ? `User: ${user.username}` : 'No user'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login({ username: 'testuser', password: 'password' })}
      >
        Login
      </button>
      <button 
        data-testid="logout-btn" 
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    mockAuthAPI.login.mockClear();
    mockAuthAPI.validateToken.mockClear();
  });

  it('should initialize with loading state and no user', async () => {
    // Arrange
    localStorageMock.getItem.mockReturnValue(null);
    mockAuthAPI.validateToken.mockResolvedValue(false);

    // Act
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('should restore user from localStorage on init', async () => {
    // Arrange
    const mockUser = { id: 1, username: 'testuser', isAdmin: false };
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });
    mockAuthAPI.validateToken.mockResolvedValue(true);

    // Act
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('User: testuser');
    });
    expect(mockAuthAPI.validateToken).toHaveBeenCalled();
  });

  it('should handle successful login', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockUser = { id: 1, username: 'testuser', isAdmin: false };
    const mockResponse = { user: mockUser, token: 'mock-token' };
    
    localStorageMock.getItem.mockReturnValue(null);
    mockAuthAPI.validateToken.mockResolvedValue(false);
    mockAuthAPI.login.mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    // Act
    await user.click(screen.getByTestId('login-btn'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('User: testuser');
    });

    expect(mockAuthAPI.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password',
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });

  it('should handle login failure', async () => {
    // Arrange
    const user = userEvent.setup();
    localStorageMock.getItem.mockReturnValue(null);
    mockAuthAPI.validateToken.mockResolvedValue(false);
    mockAuthAPI.login.mockRejectedValue(new Error('Login failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    // Act & Assert
    await expect(user.click(screen.getByTestId('login-btn'))).rejects.toThrow();
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('should handle logout', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockUser = { id: 1, username: 'testuser', isAdmin: false };
    const mockResponse = { user: mockUser, token: 'mock-token' };
    
    localStorageMock.getItem.mockReturnValue(null);
    mockAuthAPI.validateToken.mockResolvedValue(false);
    mockAuthAPI.login.mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // First login
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    await user.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('User: testuser');
    });

    // Act - logout
    await user.click(screen.getByTestId('logout-btn'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  it('should clear user data when token validation fails', async () => {
    // Arrange
    const mockUser = { id: 1, username: 'testuser', isAdmin: false };
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });
    mockAuthAPI.validateToken.mockResolvedValue(false);

    // Act
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });
});
