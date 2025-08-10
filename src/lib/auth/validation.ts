import { z } from 'zod';

// Login validation
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
});

// User creation validation (admin only)
export const createUserSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format'),
    role: z
        .enum(['admin', 'user'])
        .default('user'),
});

// Password change validation
export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
    confirmPassword: z
        .string()
        .min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Session validation
export const sessionSchema = z.object({
    userId: z.number(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['admin', 'user']),
    iat: z.number().optional(),
    exp: z.number().optional(),
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SessionPayload = z.infer<typeof sessionSchema>;
