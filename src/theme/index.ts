/**
 * Theme System
 * Extensible design system for Apple TV
 */

import { createContext, useContext } from 'react';
import { rs } from './responsive';

// Type definition for the theme contract
export interface AppTheme {
    name: string;
    colors: {
        background: string;
        surface: string;
        surfaceVariant: string;
        primary: string;
        text: string;
        textSecondary: string;
        border: string;
        focusBorder: string;
        error: string;
        success: string;
        inputBackground: string;
        inputBorder: string;
        overlay: string; // For modals/backdrops
        // Badge colors
        badgeEvent: string;
        badgeBeltTest: string;
        badgeClosed: string;
        badgeUpdate: string;
    };
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
    };
    borderRadius: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
    fontSize: {
        caption: number;
        body: number;
        button: number;
        h3: number;
        h2: number;
        h1: number;
        subtitle: number;
    };
}

// Dark Theme (Default)
export const darkTheme: AppTheme = {
    name: 'dark',
    colors: {
        background: '#050505',   // Deep Black
        surface: '#252D3D',      // Lighter Slate Blue/Grey for visibility
        surfaceVariant: '#1E2536',
        primary: '#4A90E2',      // Bright Blue
        text: '#FFFFFF',
        textSecondary: '#9CA3AF',
        border: 'rgba(255, 255, 255, 0.2)',
        focusBorder: '#4A90E2',
        error: '#EF4444',
        success: '#22C55E',
        inputBackground: '#161B26', // Darker than surface, distinct
        inputBorder: '#374151',
        overlay: 'rgba(0, 0, 0, 0.7)',

        badgeEvent: '#22C55E',
        badgeBeltTest: '#DAA520', // Gold/Yellow
        badgeClosed: '#EF4444',
        badgeUpdate: '#6B7280',
    },
    spacing: {
        xs: rs(8),
        sm: rs(16),
        md: rs(24),
        lg: rs(32),
        xl: rs(48),
        xxl: rs(64),
    },
    borderRadius: {
        sm: rs(8),
        md: rs(12),
        lg: rs(16),
        xl: rs(24),
    },
    fontSize: {
        caption: rs(22),
        body: rs(28),
        button: rs(26),
        h3: rs(36), // Card Titles
        h2: rs(56), // Section Titles
        h1: rs(90), // Welcome Title
        subtitle: rs(40), // Manage My Dojo
    },
};

// You can add lightTheme here in the future if needed

// Context
type ThemeContextType = {
    theme: AppTheme;
    // setTheme: (themeName: string) => void; // For future dynamic switching
};

export const ThemeContext = createContext<ThemeContextType>({
    theme: darkTheme,
});

export const useTheme = () => useContext(ThemeContext);
