/**
 * Auth Store - Zustand store for authentication state
 */

import { create } from 'zustand';
import { secureStorage } from '../services/axios';
import { authService } from '../services/authService';
import type { CurrentUser, AuthState } from '../types/auth';

interface AuthActions {
    login: (userName: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loadStoredAuth: () => Promise<void>;
    reset: () => void;
    clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    apiError: null,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
    ...initialState,

    /**
     * Login with userName and password
     */
    login: async (userName: string, password: string) => {
        set({ isLoading: true, apiError: null });
        try {
            const response = await authService.loginUser({
                userName,
                password,
                rememberMe: true,
                rememberMeDays: 365,
            });

            // Check if we have a valid response with data
            if (response && response.data) {
                // Handle potentially different token structures (matching kiosk logic)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const responseAny = response as any;
                const token = response.data.accessToken || responseAny.data?.token || responseAny.token;
                const refreshToken = response.data.refreshToken;
                const userData = response.data;

                // Store tokens securely
                if (token && typeof token === 'string') {
                    await secureStorage.setToken(token);
                }
                if (refreshToken && typeof refreshToken === 'string') {
                    await secureStorage.setRefreshToken(refreshToken);
                }

                // Store minimal user data
                const userInfo = userData.user || userData;
                const essentialUserData = {
                    _id: (userInfo as any)._id || '',
                    email: (userInfo as any).email || '',
                    firstName: (userInfo as any).firstName || '',
                };
                await secureStorage.setUserData(JSON.stringify(essentialUserData));

                set({
                    user: { ...userData, accessToken: token as string },
                    token: (token as string) || null,
                    isAuthenticated: true,
                    isLoading: false,
                    apiError: null,
                });
            } else {
                const errorMessage = response?.message || 'Login failed - no data received';
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            set({
                isLoading: false,
                apiError: error.message || 'Login failed. Please check your connection and credentials.'
            });
            // Re-throw to allow component to handle if needed
            throw error;
        }
    },

    /**
     * Logout user and clear all stored data
     */
    logout: async () => {
        set({ isLoading: true });
        try {
            // API call (fire and forget)
            authService.logoutUser().catch(() => { });
        } finally {
            // Clear local storage
            await secureStorage.clearAll();

            set({
                ...initialState,
                isInitialized: true,
            });
        }
    },

    /**
     * Load authentication state from secure storage
     */
    loadStoredAuth: async () => {
        try {
            set({ isLoading: true });
            const [token, userData] = await Promise.all([
                secureStorage.getToken(),
                secureStorage.getUserData(),
            ]);

            if (token && userData) {
                const parsedUser = JSON.parse(userData) as CurrentUser;
                set({
                    user: { ...parsedUser, accessToken: token },
                    token,
                    isAuthenticated: true,
                    isInitialized: true,
                    isLoading: false,
                });

                // Optionally verify token validity here with getCurrentUser()
            } else {
                set({ isInitialized: true, isLoading: false });
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
            set({ isInitialized: true, isLoading: false });
        }
    },

    /**
     * Reset store to initial state
     */
    reset: () => {
        set({ ...initialState, isInitialized: true });
    },

    clearError: () => {
        set({ apiError: null });
    }
}));

export default useAuthStore;
