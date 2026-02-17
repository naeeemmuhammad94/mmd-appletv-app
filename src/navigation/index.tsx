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
import HomeScreen from '../screens/student/HomeScreen';
import AnnouncementsScreen from '../screens/student/AnnouncementsScreen';
import AnnouncementDetailScreen from '../screens/student/AnnouncementDetailScreen';
import SearchProgramScreen from '../screens/student/SearchProgramScreen';
import VideoListScreen from '../screens/student/VideoListScreen';
import VideoPlayerScreen from '../screens/student/VideoPlayerScreen';

export type AuthStackParamList = {
    RoleSelect: undefined;
    Login: undefined;
    ForgotPassword: undefined;
};

export type StudentStackParamList = {
    Home: undefined;
    Announcements: undefined;
    SearchProgram: undefined;
    ProgramDetail: {
        categoryId: string;
        programName?: string;
        categoryName?: string;
    };
    VideoPlayer: {
        videoUrl: string;
        title?: string;
    };
    AnnouncementDetail: {
        announcementId: string;
        title: string;
        description: string;
        createdAt: string;
        authorName?: string;
    };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const StudentStack = createNativeStackNavigator<StudentStackParamList>();

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
            <StudentStack.Screen name="Home" component={HomeScreen} />
            <StudentStack.Screen name="Announcements" component={AnnouncementsScreen} />
            <StudentStack.Screen name="SearchProgram" component={SearchProgramScreen} />
            <StudentStack.Screen name="ProgramDetail" component={VideoListScreen} />
            <StudentStack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
            <StudentStack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
        </StudentStack.Navigator>
    );
};

export const RootNavigator = () => {
    const { isAuthenticated, isInitialized, loadStoredAuth } = useAuthStore();
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
            {isAuthenticated ? <StudentNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};
