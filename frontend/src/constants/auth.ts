// Authentication constants
export const AUTH_CONFIG = {
  TOKEN_KEY: 'cloudwatch_token',
  TOKEN_EXPIRATION_KEY: 'cloudwatch_token_expiration',
  REMEMBER_ME_KEY: 'cloudwatch_remember_me',
  LAST_USERNAME_KEY: 'cloudwatch_last_username',
  REMEMBER_DURATION_DAYS: 30,
  SESSION_TIMEOUT_MINUTES: 60,
} as const

export const VALIDATION_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
} as const

export const VALIDATION_MESSAGES = {
  USERNAME: {
    REQUIRED: 'Username is required',
    MIN_LENGTH: 'Username must be at least 3 characters',
    MAX_LENGTH: 'Username cannot exceed 50 characters',
    INVALID_PATTERN: 'Username can only contain letters, numbers, underscore and dash',
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: 'Password must be at least 6 characters',
    MAX_LENGTH: 'Password cannot exceed 100 characters',
    WEAK: 'Password should contain uppercase, lowercase, number and special character',
  },
  GENERAL: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    INVALID_CREDENTIALS: 'Invalid username or password',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
    UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
  },
} as const

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  PROFILE: '/auth/profile',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const
