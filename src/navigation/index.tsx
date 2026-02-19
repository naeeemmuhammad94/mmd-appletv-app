import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../theme';
import { View, ActivityIndicator } from 'react-native';

// Auth Screens
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Student Screens
import StudentHomeScreen from '../screens/student/HomeScreen';
import SearchScreen from '../screens/student/SearchScreen';
import ProgramDetailScreen from '../screens/student/ProgramDetailScreen';
import VimeoPlayerScreen from '../screens/student/VimeoPlayerScreen';

// Dojo Screens
import DojoHomeScreen from '../screens/dojo/DojoHomeScreen';

// Admin Screens
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';

export type AuthStackParamList = {
    RoleSelect: undefined;
    Login: undefined;
    ForgotPassword: undefined;
};

export type StudentStackParamList = {
    Home: undefined;
    Search: undefined;
    ProgramDetail: { programId: string };
    VideoPlayer: { videoUrl: string; title?: string };
};

export type DojoStackParamList = {
    Home: undefined;
};

export type AdminStackParamList = {
    Home: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const StudentStack = createNativeStackNavigator<StudentStackParamList>();
const DojoStack = createNativeStackNavigator<DojoStackParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

const AuthNavigator = () => {
    const { theme } = useTheme();
    return (
        <AuthStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
                animation: 'fade', // Smooth fade for TV
            }}
        >
            <AuthStack.Screen name="RoleSelect" component={RoleSelectScreen} />
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
    );
};

const StudentNavigator = () => {
    const { theme } = useTheme();
    return (
        <StudentStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
                animation: 'fade',
            }}
        >
            <StudentStack.Screen name="Home" component={StudentHomeScreen} />
            <StudentStack.Screen name="Search" component={SearchScreen} />
            <StudentStack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
            <StudentStack.Screen name="VideoPlayer" component={VimeoPlayerScreen} />
        </StudentStack.Navigator>
    );
};

const DojoNavigator = () => {
    const { theme } = useTheme();
    return (
        <DojoStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
                animation: 'fade',
            }}
        >
            <DojoStack.Screen name="Home" component={DojoHomeScreen} />
        </DojoStack.Navigator>
    );
};

const AdminNavigator = () => {
    const { theme } = useTheme();
    return (
        <AdminStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
                animation: 'fade',
            }}
        >
            <AdminStack.Screen name="Home" component={AdminHomeScreen} />
        </AdminStack.Navigator>
    );
};

export const RootNavigator = () => {
    const { isAuthenticated, isInitialized, loadStoredAuth, selectedRole } = useAuthStore();
    const { theme } = useTheme();

    useEffect(() => {
        loadStoredAuth();
    }, [loadStoredAuth]);

    if (!isInitialized) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                selectedRole === 'dojo' ? <DojoNavigator /> :
                    selectedRole === 'admin' ? <AdminNavigator /> :
                        <StudentNavigator />
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
};
