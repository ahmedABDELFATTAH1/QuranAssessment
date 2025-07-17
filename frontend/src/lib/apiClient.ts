const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';

export class APIError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private getHeaders(includeAuth: boolean = true, customToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = customToken || this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new APIError(response.status, data.message || 'Request failed', data);
    }

    return data;
  }

  async get(endpoint: string, includeAuth: boolean = true, token?: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth, token),
    });

    return this.handleResponse(response);
  }

  async post(endpoint: string, body?: Record<string, unknown>, includeAuth: boolean = true, token?: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth, token),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse(response);
  }

  async patch(endpoint: string, body?: Record<string, unknown>, includeAuth: boolean = true, token?: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(includeAuth, token),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse(response);
  }

  async delete(endpoint: string, includeAuth: boolean = true, token?: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth, token),
    });

    return this.handleResponse(response);
  }

  async put(endpoint: string, body?: Record<string, unknown>, includeAuth: boolean = true, token?: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth, token),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse(response);
  }
}

// Create a singleton instance
export const apiClient = new APIClient(BACKEND_URL);

// Feedback API methods for client-side use
export const feedbackAPI = {
  // Submit new feedback
  create: (feedbackData: { name: string; message: string; category?: string }) =>
    apiClient.post('/feedback', feedbackData),

  // Get all feedback (admin) or user's feedback
  getAll: () => apiClient.get('/feedback'),

  // Get user's own feedback
  getMyFeedback: () => apiClient.get('/feedback/my-feedback'),

  // Get specific feedback by ID
  getById: (id: number) => apiClient.get(`/feedback/${id}`),

  // Mark feedback as inappropriate (admin only)
  markInappropriate: (id: number) => 
    apiClient.patch(`/feedback/${id}/mark-inappropriate`),

  // Delete feedback
  delete: (id: number) => apiClient.delete(`/feedback/${id}`),
};

// Server-side API methods (for use in API routes)
export const serverAPI = {
  feedback: {
    create: (feedbackData: Record<string, unknown>, token: string) =>
      apiClient.post('/feedback', feedbackData, true, token),
    
    getAll: (token: string) => apiClient.get('/feedback', true, token),
    
    getById: (id: number, token: string) => 
      apiClient.get(`/feedback/${id}`, true, token),
    
    markInappropriate: (id: number, token: string) => 
      apiClient.patch(`/feedback/${id}/mark-inappropriate`, undefined, true, token),
    
    delete: (id: number, token: string) => 
      apiClient.delete(`/feedback/${id}`, true, token),
  },
  
  auth: {
    login: (credentials: Record<string, unknown>) =>
      apiClient.post('/auth/login', credentials, false),
    
    validateToken: (token: string) => 
      apiClient.get('/auth/validate', true, token),
    
    getProfile: (token: string) => 
      apiClient.get('/auth/profile', true, token),
  },
};

// Auth API methods (already exists but can be updated to use the new client)
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/login', credentials, false), // No auth needed for login

  validateToken: () => apiClient.get('/auth/validate'),

  getProfile: () => apiClient.get('/auth/profile'),
};
