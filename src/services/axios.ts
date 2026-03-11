/**
 * Axios instance with interceptors for API calls
 * Uses react-native-keychain for tvOS secure storage
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

// Using the same API URL as the kiosk app (Production)
const API_BASE_URL = ENV.API_BASE_URL;

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
    await Keychain.setGenericPassword('token', token, {
      service: STORAGE_KEYS.ACCESS_TOKEN,
    });
  },

  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: STORAGE_KEYS.ACCESS_TOKEN,
      });
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('refresh', token, {
      service: STORAGE_KEYS.REFRESH_TOKEN,
    });
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: STORAGE_KEYS.REFRESH_TOKEN,
      });
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  },

  async setSelectedRole(role: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_ROLE, role);
    } catch (error) {
      console.warn('[secureStorage] Failed to persist role:', error);
    }
  },

  async getSelectedRole(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_ROLE);
    } catch (error) {
      console.warn('[secureStorage] Failed to read role:', error);
      return null;
    }
  },

  // Storage for non-sensitive user data
  async setUserData(userData: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, userData);
    } catch (error) {
      console.warn('[secureStorage] Failed to persist user data:', error);
    }
  },

  async getUserData(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.warn('[secureStorage] Failed to read user data:', error);
      return null;
    }
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      Keychain.resetGenericPassword({ service: STORAGE_KEYS.ACCESS_TOKEN }),
      Keychain.resetGenericPassword({ service: STORAGE_KEYS.REFRESH_TOKEN }),
      AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_ROLE).catch(e =>
        console.warn('[secureStorage] clearAll role failed:', e),
      ),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA).catch(e =>
        console.warn('[secureStorage] clearAll userData failed:', e),
      ),
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
  paramsSerializer: params => {
    const searchParams = new URLSearchParams();
    for (const key in params) {
      if (Array.isArray(params[key])) {
        params[key].forEach((val: any) => searchParams.append(`${key}[]`, val));
      } else if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    }
    return searchParams.toString();
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
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading token:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
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
      console.log(
        '[Axios] 401 Unauthorized on:',
        error.config?.url,
        '- clearing auth state',
      );
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
  },
);

export default axiosInstance;
