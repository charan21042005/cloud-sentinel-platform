const LOG_PREFIX = '🛡️ [Sentinel]';

export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${LOG_PREFIX} INFO: ${message}`, data || '');
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`${LOG_PREFIX} WARN: ${message}`, data || '');
  },
  error: (message: string, data?: any) => {
    console.error(`${LOG_PREFIX} ERROR: ${message}`, data || '');
  },
  api: (method: string, url: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.groupCollapsed(`${LOG_PREFIX} API: ${method.toUpperCase()} ${url}`);
      console.log('Payload:', data);
      console.groupEnd();
    }
  }
};
