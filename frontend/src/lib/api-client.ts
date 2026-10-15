import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api-proxy',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const requestHeaders = error.config?.headers;
        const authorization =
          typeof requestHeaders?.get === 'function'
            ? requestHeaders.get('Authorization')
            : requestHeaders?.Authorization;
        const requestToken =
          typeof authorization === 'string' ? authorization.replace(/^Bearer\s+/i, '') : null;
        const currentToken = localStorage.getItem('token');

        // An older request can finish after a new login. Only expire the session
        // if the rejected request used the token that is still currently stored.
        if (requestToken && currentToken && requestToken === currentToken) {
          localStorage.removeItem('token');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
