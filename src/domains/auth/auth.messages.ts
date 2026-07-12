export const AUTH_ERRORS = {
  TERMS_NOT_ACCEPTED: 'Terms and conditions not accepted',
  USER_EXISTS: 'User already exists with this mobile number',
  INVALID_CREDENTIALS: 'Invalid credentials',
  PASSWORD_NOT_SET: 'This account does not have a password set. Please log in via OTP.',
  ACCOUNT_NOT_ACTIVE: (status: string) => `Your account is currently ${status.toLowerCase()}`,
  ACCOUNT_INACTIVE_GENERIC: 'User account is inactive, blocked or deleted',
  TOKEN_INVALID: 'Invalid, expired, or revoked refresh token',
} as const;

export const AUTH_SUCCESS = {
  REGISTER: 'User registered successfully',
  LOGIN: 'Login successful',
  REFRESH: 'Tokens refreshed successfully',
  LOGOUT: 'Logged out successfully',
} as const;
