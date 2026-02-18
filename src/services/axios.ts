/**
 * Axios instance with interceptors for API calls
 * Uses react-native-keychain for tvOS secure storage
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Keychain from 'react-native-keychain';

// Using the same API URL as the kiosk app
const API_BASE_URL = 'https://staging-api.managemydojo.com/api/v1';

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    SELECTED_ROLE: 'selected_role',
} as const;

/**
 * Secure storage utility using Keychain
 */
export const secureStorage = {
    async setToken(token: string): Promise<void> {
        await Keychain.setGenericPassword('token', token, { service: STORAGE_KEYS.ACCESS_TOKEN });
    },

    async getToken(): Promise<string | null> {
        try {
            const credentials = await Keychain.getGenericPassword({ service: STORAGE_KEYS.ACCESS_TOKEN });
            return credentials ? credentials.password : null;
        } catch {
            return null;
        }
    },

    async setRefreshToken(token: string): Promise<void> {
        await Keychain.setGenericPassword('refresh', token, { service: STORAGE_KEYS.REFRESH_TOKEN });
    },

    async getRefreshToken(): Promise<string | null> {
        try {
            const credentials = await Keychain.getGenericPassword({ service: STORAGE_KEYS.REFRESH_TOKEN });
            return credentials ? credentials.password : null;
        } catch {
            return null;
        }
    },

    async setSelectedRole(role: string): Promise<void> {
        await Keychain.setGenericPassword('role', role, { service: STORAGE_KEYS.SELECTED_ROLE });
    },

    async getSelectedRole(): Promise<string | null> {
        try {
            const credentials = await Keychain.getGenericPassword({ service: STORAGE_KEYS.SELECTED_ROLE });
            return credentials ? credentials.password : null;
        } catch {
            return null;
        }
    },

    // Storage for non-sensitive user data (using Keychain simply for unified storage API on TV)
    async setUserData(userData: string): Promise<void> {
        await Keychain.setGenericPassword('user', userData, { service: STORAGE_KEYS.USER_DATA });
    },

    async getUserData(): Promise<string | null> {
        try {
            const credentials = await Keychain.getGenericPassword({ service: STORAGE_KEYS.USER_DATA });
            return credentials ? credentials.password : null;
        } catch {
            return null;
        }
    },

    async clearAll(): Promise<void> {
        await Promise.all([
            Keychain.resetGenericPassword({ service: STORAGE_KEYS.ACCESS_TOKEN }),
            Keychain.resetGenericPassword({ service: STORAGE_KEYS.REFRESH_TOKEN }),
            Keychain.resetGenericPassword({ service: STORAGE_KEYS.USER_DATA }),
            Keychain.resetGenericPassword({ service: STORAGE_KEYS.SELECTED_ROLE }),
        ]);
    },
};

/**
 * Configured axios instance
 */
export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

/**
 * Request interceptor to attach auth token
 */
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await secureStorage.getToken();
            if (token) {
                config.headers.Authorization = token;
            }
        } catch (error) {
            console.error('Error reading token:', error);
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor for error handling
 */
axiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    async (error: AxiosError) => {
        // On 401 Unauthorized, clear auth state
        if (error.response?.status === 401) {
            try {
                await secureStorage.clearAll();

                // Reset auth store state via module import to avoid circular dependency
                // We catch import errors just in case
                try {
                    const { useAuthStore } = require('../store/useAuthStore');
                    if (useAuthStore && useAuthStore.getState) {
                        useAuthStore.getState().reset();
                    }
                } catch (e) {
                    console.warn('Could not reset auth store', e);
                }

            } catch (e) {
                console.error('Failed to clear auth on 401:', e);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
