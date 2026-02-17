/**
 * Login Validation Schema
 * userName + password
 */

import { z } from 'zod';

export const loginSchema = z.object({
    userName: z
        .string()
        .min(1, 'Username is required')
        .max(50, 'Username must be less than 50 characters'),
    password: z
        .string()
        .min(1, 'Password is required')
        .max(50, 'Password must be less than 50 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
