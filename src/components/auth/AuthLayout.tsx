import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { AUTH_SCREEN_THEME as SCREEN_THEME } from '../../theme/authTheme';
import Logo from '../../../assets/icons/logo.svg';

interface AuthLayoutProps {
    children: React.ReactNode;
    subtitle?: string;
    showHeader?: boolean;
    cardStyle?: StyleProp<ViewStyle>;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    subtitle,
    showHeader = true,
    cardStyle,
}) => {
    const { theme } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.bgGradient} />

            <View style={styles.content}>
                {showHeader && (
                    <View style={[styles.header, { width: SCREEN_THEME.layout.headerWidth }]}>
                        <View style={styles.headerIconContainer}>
                            <Logo
                                width={SCREEN_THEME.typography.logoSize}
                                height={SCREEN_THEME.typography.logoSize}
                                fill={theme.colors.text}
                            />
                        </View>
                        {subtitle && (
                            <Text style={[styles.headerSubtitle, { color: SCREEN_THEME.colors.headerText }]}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                )}

                <View style={[
                    styles.card,
                    {
                        backgroundColor: SCREEN_THEME.colors.cardBg,
                        borderColor: SCREEN_THEME.colors.borderColor,
                    },
                    cardStyle
                ]}>
                    {children}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: SCREEN_THEME.spacing.mainGap,
        width: '100%',
    },
    header: {
        alignItems: 'center',
        gap: SCREEN_THEME.spacing.headerGap,
    },
    headerIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: SCREEN_THEME.spacing.headerIconGap,
    },
    headerSubtitle: {
        fontFamily: 'SF Pro Display',
        fontWeight: '500',
        fontSize: SCREEN_THEME.typography.headerSubtitleSize,
        textAlign: 'center',
    },
    card: {
        width: '100%', // Parent constraint
        maxWidth: SCREEN_THEME.layout.containerWidth,
        borderRadius: SCREEN_THEME.layout.borderRadius,
        // Borders: l-2, r, t-2, b
        borderLeftWidth: 2,
        borderRightWidth: 1,
        borderTopWidth: 2,
        borderBottomWidth: 1,
        // Shadows
        shadowColor: '#000',
        shadowOffset: { width: rs(20), height: rs(18) },
        shadowOpacity: 0.37,
        shadowRadius: rs(37),
        elevation: rs(10), // Android fallback
        overflow: 'hidden',
        alignItems: 'center', // Center content horizontally
        justifyContent: 'center', // Center content vertically
    },
});
