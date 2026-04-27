import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../theme';
import { View, ActivityIndicator, Text } from 'react-native';
import { rs } from '../theme/responsive';
import { useDojoCastOfflineSync } from '../hooks/useDojoCastOfflineSync';

// Auth Screens
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Student Screens
import StudentHomeScreen from '../screens/student/HomeScreen';
import SearchScreen from '../screens/student/SearchScreen';
import AnnouncementsScreen from '../screens/student/AnnouncementsScreen';
import AnnouncementDetailScreen from '../screens/student/AnnouncementDetailScreen';
import ProgramDetailScreen from '../screens/student/ProgramDetailScreen';
import VimeoPlayerScreen from '../screens/student/VimeoPlayerScreen';
import ImageViewerScreen from '../screens/student/ImageViewerScreen';
import StudentSettingsScreen from '../screens/student/StudentSettingsScreen';

// Dojo Screens
import DojoCastConnectScreen from '../screens/dojo/DojoCastConnectScreen';
import DojoCastSetupScreen from '../screens/dojo/DojoCastSetupScreen';
import DojoCastSlideshowScreen from '../screens/dojo/DojoCastSlideshowScreen';
import DojoCastErrorScreen from '../screens/dojo/DojoCastErrorScreen';
import DojoCastSettingsScreen from '../screens/dojo/DojoCastSettingsScreen';

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
  Announcements: undefined;
  AnnouncementDetail: {
    title: string;
    description: string;
    createdAt?: string;
  };
  ProgramDetail: { id: string; type: 'program' | 'category' };
  VideoPlayer: { videoUrl: string; title?: string; contentId?: string };
  ImageViewer: { url: string; title: string; contentId: string };
  Settings: undefined;
};

export type DojoStackParamList = {
  Home: undefined;
  Connect: undefined;
  Setup: undefined;
  Slideshow: undefined;
  Error: undefined;
  Settings: undefined;
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
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
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
      <StudentStack.Screen
        name="Announcements"
        component={AnnouncementsScreen}
      />
      <StudentStack.Screen
        name="AnnouncementDetail"
        component={AnnouncementDetailScreen}
      />
      <StudentStack.Screen
        name="ProgramDetail"
        component={ProgramDetailScreen}
      />
      <StudentStack.Screen name="VideoPlayer" component={VimeoPlayerScreen} />
      <StudentStack.Screen name="ImageViewer" component={ImageViewerScreen} />
      <StudentStack.Screen name="Settings" component={StudentSettingsScreen} />
    </StudentStack.Navigator>
  );
};

const DojoNavigator = () => {
  useDojoCastOfflineSync();
  const { theme } = useTheme();
  return (
    <DojoStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'fade',
      }}
    >
      <DojoStack.Screen name="Connect" component={DojoCastConnectScreen} />
      <DojoStack.Screen name="Setup" component={DojoCastSetupScreen} />
      <DojoStack.Screen name="Slideshow" component={DojoCastSlideshowScreen} />
      <DojoStack.Screen name="Error" component={DojoCastErrorScreen} />
      <DojoStack.Screen name="Settings" component={DojoCastSettingsScreen} />
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
  const { isAuthenticated, isInitialized, loadStoredAuth, selectedRole } =
    useAuthStore();
  const { theme } = useTheme();

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: rs(24),
            marginTop: rs(20),
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        selectedRole === 'dojo' ? (
          <DojoNavigator />
        ) : selectedRole === 'admin' ? (
          <AdminNavigator />
        ) : (
          <StudentNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
