import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api-proxy',
  headers: {
    'Content-Type': 'application/json',
  },
});

const isPublicAuthRequest = (url?: string) =>
  typeof url === 'string' && /\/auth\/(?:login|register)\/?(?:\?|$)/.test(url);
const isCurrentUserRequest = (url?: string) =>
  typeof url === 'string' && /\/users\/me(?:\?|$)/.test(url);

let sessionValidation: { token: string; promise: Promise<boolean | null> } | null = null;

function isSessionValid(token: string): Promise<boolean | null> {
  if (sessionValidation?.token === token) return sessionValidation.promise;

  const promise = axios
    .get('/users/me', {
      baseURL: apiClient.defaults.baseURL,
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => true)
    .catch((error: { response?: { status?: number } }) => {
      if (error.response?.status === 401) return false;
      return null;
    })
    .finally(() => {
      if (sessionValidation?.promise === promise) sessionValidation = null;
    });

  sessionValidation = { token, promise };
  return promise;
}

// Request Interceptor: Inject JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    // Login and registration must remain independent of any stale saved session.
    // In particular, a failed login should reach LoginForm so it can show its
    // error instead of being treated as an expired dashboard session.
    if (isPublicAuthRequest(config.url)) {
      if (typeof config.headers?.delete === 'function') {
        config.headers.delete('Authorization');
      } else if (config.headers) {
        delete config.headers.Authorization;
      }
      return config;
    }

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
    if (error.response?.status === 401 && !isPublicAuthRequest(error.config?.url)) {
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
          const expireSession = () => {
            if (localStorage.getItem('token') !== currentToken) return;
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
          };

          if (isCurrentUserRequest(error.config?.url)) {
            expireSession();
          } else {
            // A panel-specific 401 does not prove the whole session expired.
            // Confirm against the canonical profile endpoint before redirecting.
            void isSessionValid(currentToken).then((valid) => {
              if (valid === false) expireSession();
            });
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
