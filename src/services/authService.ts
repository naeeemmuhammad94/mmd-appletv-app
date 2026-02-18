/**
 * Auth Service
 * API calls for login, logout, and password reset
 */

import { AxiosError } from 'axios';
import axiosInstance from './axios';
import { ApiEndpoints } from '../config/apiEndpoints';
import type { CurrentUser, LoginPayload, ForgotPasswordPayload, CommonApiResponse } from '../types/auth';

/**
 * Login user with userName and password
 */
export async function loginUser(payload: LoginPayload): Promise<CommonApiResponse<CurrentUser>> {
    const requestPayload = {
        ...payload,
        // Staging API requires both userName and email for student login
        email: payload.email || payload.userName
    };

    console.log('[AuthService] Logging in with payload (password hidden):', { ...requestPayload, password: '***' });
    try {
        const response = await axiosInstance.post<CommonApiResponse<CurrentUser>>(
            ApiEndpoints.Login,
            requestPayload
        );
        console.log('[AuthService] Login response:', response.data);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        console.error('[AuthService] Login error:', axiosError.response?.data || axiosError.message);
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Login failed. Please check your credentials.',
            data: null,
        };
    }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<CommonApiResponse<CurrentUser>> {
    try {
        const response = await axiosInstance.get<CommonApiResponse<CurrentUser>>(ApiEndpoints.CurrentUser);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Failed to fetch user data.',
            data: null,
        };
    }
}

/**
 * Send password reset email
 * User only provides userName, email sent as empty string (server looks up email)
 */
export async function sendPasswordResetEmail(
    payload: ForgotPasswordPayload
): Promise<CommonApiResponse<void>> {
    try {
        const response = await axiosInstance.post<CommonApiResponse<void>>(
            ApiEndpoints.SendEmailToResetPassword,
            payload
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Failed to send password reset email.',
            data: null,
        };
    }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
    try {
        await axiosInstance.get(ApiEndpoints.Logout);
    } catch (error) {
        // Silently fail - we'll clear local storage anyway
        console.error('[AuthService] Logout error (non-fatal):', error);
    }
}

export const authService = {
    loginUser,
    getCurrentUser,
    sendPasswordResetEmail,
    logoutUser,
};

export default authService;
