/**
 * Forgot Password Validation Schema
 * userName only
 */

import { z } from 'zod';

export const forgotPasswordSchema = z.object({
    userName: z.string().min(1, 'Username is required'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
