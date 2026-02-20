import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
}

export async function register(name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      return { success: true };
    }
    return { success: false, error: 'Registration failed' };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Registration failed' 
    };
  }
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      return { success: true };
    }
    return { success: false, error: 'Login failed' };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed' 
    };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await api.get('/auth/me');
    if (response.data.success) {
      return response.data.user;
    }
    return null;
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem('token');
}
