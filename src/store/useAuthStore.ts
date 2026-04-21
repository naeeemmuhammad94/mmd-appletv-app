/**
 * Auth Store - Zustand store for authentication state
 */

import { create } from 'zustand';
import { secureStorage } from '../services/axios';
import { authService } from '../services/authService';
import type { CurrentUser, AuthState } from '../types/auth';
import { getBackendRoleName, normalizeBackendRole } from '../utils/authHelpers';

interface AuthActions {
  login: (userName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
  setRole: (role: 'student' | 'dojo' | 'admin') => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  apiError: null,
  selectedRole: undefined, // Add selectedRole to state
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  setRole: async (role: 'student' | 'dojo' | 'admin') => {
    try {
      await secureStorage.setSelectedRole(role);
    } catch (error) {
      console.warn('AsyncStorage error while setting role:', error);
    }
    set({ selectedRole: role });
  },

  /**
   * Login with userName and password.
   *
   * After successful authentication the backend-returned role
   * (userRole.role.name) is used as the source of truth for selectedRole.
   * This auto-corrects the role the user tapped on RoleSelectScreen and routes
   * them to the correct stack (Student / Dojo Cast / Admin) regardless of which
   * tile they pressed. If the backend returns an unrecognized role name the
   * user's tapped selection is kept as a fallback.
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
        interface LoginResponseData {
          accessToken?: string;
          refreshToken?: string;
          token?: string;
          user?: Record<string, string>;
          userRole?: { role?: { name?: string; _id?: string } };
          _id?: string;
          email?: string;
          firstName?: string;
          lastName?: string;
        }

        const responseData = response.data as unknown as LoginResponseData;
        const token = responseData.accessToken || responseData.token;
        const refreshToken = responseData.refreshToken;
        const userData = response.data;

        // Validate token exists before doing anything else
        if (!token || typeof token !== 'string') {
          throw new Error('No valid token received from login response');
        }

        // --- Role resolution from backend ---
        // Role can come back as `data.userRole.role.name` or nested under
        // `data.user.userRole` depending on backend shape.
        const backendRoleName =
          responseData.userRole?.role?.name ||
          getBackendRoleName(userData as unknown as CurrentUser) ||
          '';
        const normalizedBackendRole = normalizeBackendRole(backendRoleName);

        // Use the backend role as the source of truth.
        // If recognized, persist it so the navigator shows the correct stack.
        // If unrecognized (normalizedBackendRole === null), keep whatever the
        // user tapped on RoleSelectScreen as a fallback.
        if (normalizedBackendRole) {
          try {
            await secureStorage.setSelectedRole(normalizedBackendRole);
          } catch {
            // non-fatal — store will still be updated below
          }
        }
        const resolvedRole = normalizedBackendRole ?? get().selectedRole;

        // Store token (strip Bearer prefix if present)
        const cleanToken = token.startsWith('Bearer ')
          ? token.replace('Bearer ', '')
          : token;
        await secureStorage.setToken(cleanToken);

        if (refreshToken && typeof refreshToken === 'string') {
          await secureStorage.setRefreshToken(refreshToken);
        }

        // Persist essential user data (expanded to include lastName + userRole
        // so full-name display and role info survive app restart).
        const userInfo: Record<string, unknown> =
          (responseData.user as Record<string, unknown>) ||
          (responseData as unknown as Record<string, unknown>);
        const essentialUserData: Record<string, unknown> = {
          _id: (userInfo._id as string) || '',
          email: (userInfo.email as string) || '',
          firstName: (userInfo.firstName as string) || '',
          lastName: (userInfo.lastName as string) || '',
        };
        if (responseData.userRole) {
          essentialUserData.userRole = responseData.userRole;
        }
        // Persist dojo association fields so Dojo-role screens can resolve
        // the dojoId after app restart. This backend puts the association
        // at top-level `dojo: { _id, owner, schoolName, ... }`. Other
        // surfaces (CRM) use `dojoDetail` — we persist both if present.
        const rd = responseData as unknown as Record<string, unknown>;
        const ui = userInfo as Record<string, unknown>;
        const dojoSource = rd.dojo ?? ui.dojo;
        if (dojoSource) {
          essentialUserData.dojo = dojoSource;
        }
        const dojoDetailSource = rd.dojoDetail ?? ui.dojoDetail;
        if (dojoDetailSource) {
          essentialUserData.dojoDetail = dojoDetailSource;
        }
        const dojoIdField = rd.dojoId ?? ui.dojoId;
        if (typeof dojoIdField === 'string' && dojoIdField) {
          essentialUserData.dojoId = dojoIdField;
        }
        await secureStorage.setUserData(JSON.stringify(essentialUserData));

        set({
          user: { ...userData, accessToken: cleanToken } as CurrentUser,
          token: cleanToken,
          isAuthenticated: true,
          isLoading: false,
          apiError: null,
          ...(resolvedRole ? { selectedRole: resolvedRole } : {}),
        });
      } else {
        const errorMessage =
          response?.message || 'Login failed - no data received';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      set({
        isLoading: false,
        apiError:
          error.message ||
          'Login failed. Please check your connection and credentials.',
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
      authService.logoutUser().catch(() => {});

      // Clear local storage
      await secureStorage
        .clearAll()
        .catch(e => console.error('Clear storage failed', e));
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      set({
        ...initialState,
        // Explicitly reset critical flags
        user: null,
        token: null,
        isAuthenticated: false,
        selectedRole: undefined,
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  /**
   * Load authentication state from secure storage
   */
  loadStoredAuth: async () => {
    try {
      set({ isLoading: true });
      const [token, userData, role] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUserData(),
        secureStorage.getSelectedRole(),
      ]);

      if (token && userData) {
        const parsedUser = JSON.parse(userData) as CurrentUser;
        set({
          user: { ...parsedUser, accessToken: token },
          token,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          selectedRole: (role as 'student' | 'dojo' | 'admin') || undefined,
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
  },
}));

export default useAuthStore;
