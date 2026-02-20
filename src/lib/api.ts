import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    'VITE_API_URL environment variable is not set. Please configure it in your .env file.'
  );
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors safely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized
    if (error.response?.status === 401) {
      // Remove token ONLY
      localStorage.removeItem('token');

      // DO NOT redirect here
      // DO NOT use window.location
    }

    return Promise.reject(error);
  }
);

export default api;