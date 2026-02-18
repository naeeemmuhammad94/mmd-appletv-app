/**
 * Auth Types
 * Shared across MMD apps
 */

export interface User {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    country: string;
}

export interface UserRole {
    _id: string;
    role: {
        _id: string;
        name: string;
        isSubRole?: boolean;
    };
}

export interface CurrentUser {
    user: User;
    userRole: UserRole;
    accessToken?: string;
    refreshToken?: string;
}

export interface LoginPayload {
    userName: string;
    email?: string; // Staging API requirement for students
    password: string;
    rememberMe?: boolean;
    rememberMeDays?: number;
}

export interface ForgotPasswordPayload {
    userName: string;
    email?: string;
}

export interface CommonApiResponse<T> {
    message?: string;
    success: boolean;
    error: boolean;
    errorCode?: string;
    subCode?: string;
    data: T;
}

export interface AuthState {
    user: CurrentUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    apiError: string | null;
}
