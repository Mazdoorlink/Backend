import { z } from 'zod';

export const registerSchema = z.object({
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'WORKER', 'CONTRACTOR', 'AGENT']),
  termsAccepted: z.boolean(),
});

export const loginSchema = z.object({
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterUserDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
