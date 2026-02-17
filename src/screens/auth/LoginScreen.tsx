import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { TVTextInput } from '../../components/ui/TVTextInput';
import { TVButton } from '../../components/ui/TVButton';
import { useAuthStore } from '../../store/useAuthStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../validations/loginSchema';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../../assets/icons/logo.svg';

// ─── Figma Inspector Values ──────────────────────────────────────
const SCREEN_THEME = {
    layout: {
        containerWidth: rs(1680), // w-[1680px]
        headerWidth: rs(592),     // w-[592px]
        cardContentWidth: rs(1459), // w-[1459px]
        cardHeight: rs(600),      // h-[600px]
        borderRadius: rs(40),     // rounded-[40px]
        inputHeight: rs(96),      // h-24 -> 96px
        inputRadius: rs(16),      // rounded-2xl -> 16px
    },
    spacing: {
        mainGap: rs(64),          // gap-16 -> 64px
        headerGap: rs(10),        // gap-2.5 -> 10px
        headerIconGap: rs(14),    // gap-3.5 -> 14px
        cardInnerGap: rs(28),     // gap-7 -> 28px
        forgotPasswordTop: rs(482), // top-[482px] absolute
        showButtonTop: rs(16),    // top-[16px] absolute inside input
    },
    typography: {
        headerSubtitleSize: rs(36), // text-4xl -> 36px
        labelSize: rs(48),        // text-5xl -> 48px
        buttonTextSize: rs(48),   // text-5xl -> 48px
        showTextSize: rs(36),     // text-4xl -> 36px
        logoSize: rs(64),         // w-16 h-16 -> 64px
    },
    colors: {
        headerText: 'rgba(255, 255, 255, 0.6)', // text-white/60
        cardBg: 'rgba(31, 41, 55, 0.7)',        // bg-gray-800/70
        inputBg: 'rgba(0, 0, 0, 0.2)',          // bg-black/20
        borderColor: '#A3A3A3',                 // border-neutral-400
        blueButtonStart: '#3B82F6',             // from-blue-500
        blueButtonEnd: '#1E40AF',               // to-blue-800
        forgotPasswordText: '#3B82F6',          // text-blue-500
    },
} as const;

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const { theme } = useTheme();
    const { login, isLoading, apiError, clearError } = useAuthStore();
    const [localError, setLocalError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            userName: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setLocalError(null);
        clearError();
        try {
            await login(data.userName, data.password);
        } catch (error: any) {
            // Error handled in store
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.bgGradient} />

            <View style={styles.content}>
                {/* ── Header ── */}
                <View style={[styles.header, { width: SCREEN_THEME.layout.headerWidth }]}>
                    <View style={styles.headerIconContainer}>
                        <Logo
                            width={SCREEN_THEME.typography.logoSize}
                            height={SCREEN_THEME.typography.logoSize}
                            fill={theme.colors.text}
                        />
                    </View>
                    <Text style={[styles.headerSubtitle, { color: SCREEN_THEME.colors.headerText }]}>
                        Login to your Manage My Dojo account for access.
                    </Text>
                </View>

                {/* ── Main Card ── */}
                <View style={[styles.loginCard, { borderColor: SCREEN_THEME.colors.borderColor }]}>
                    <View style={styles.cardContent}>
                        {/* Username Field */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.text }]}>Username</Text>
                            <Controller
                                control={control}
                                name="userName"
                                render={({ field: { onChange, value } }) => (
                                    <TVTextInput
                                        value={value}
                                        onChangeText={onChange}
                                        placeholder=""
                                        autoCapitalize="none"
                                        style={styles.input}
                                        containerStyle={styles.inputContainer}
                                    />
                                )}
                            />
                        </View>

                        {/* Password Field */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({ field: { onChange, value } }) => (
                                        <TVTextInput
                                            value={value}
                                            onChangeText={onChange}
                                            secureTextEntry={!showPassword}
                                            placeholder=""
                                            style={styles.input}
                                            containerStyle={styles.inputContainer}
                                            showVisibilityIcon={false}
                                        />
                                    )}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.showButton}
                                >
                                    <Text style={styles.showButtonText}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Bottom Row Actions */}
                        <View style={styles.bottomRow}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('ForgotPassword')}
                                style={styles.forgotPasswordButton}
                            >
                                <Text style={styles.forgotPasswordText}>
                                    Forgot Password
                                </Text>
                            </TouchableOpacity>

                            <TVButton
                                title="Sign In"
                                onPress={handleSubmit(onSubmit)}
                                isLoading={isLoading}
                                style={styles.signInButton}
                                textStyle={styles.signInButtonText}
                            />
                        </View>
                    </View>

                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgGradient: {
        ...StyleSheet.absoluteFillObject,
        // Add gradient background logic if available, else standard bg
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
    loginCard: {
        width: '100%', // Parent constraint
        maxWidth: SCREEN_THEME.layout.containerWidth,
        height: SCREEN_THEME.layout.cardHeight,
        backgroundColor: SCREEN_THEME.colors.cardBg,
        borderRadius: SCREEN_THEME.layout.borderRadius,
        // Borders: l-2, r, t-2, b
        borderLeftWidth: 2,
        borderRightWidth: 1,
        borderTopWidth: 2,
        borderBottomWidth: 1,
        // Shadows
        shadowColor: '#000',
        shadowOffset: { width: 20, height: 18 },
        shadowOpacity: 0.37,
        shadowRadius: 37,
        elevation: 10, // Android fallback
        overflow: 'hidden',
        alignItems: 'center', // Center content horizontally
        justifyContent: 'center', // Center content vertically
    },
    cardContent: {
        // Remove absolute positioning to let flex center it
        width: SCREEN_THEME.layout.cardContentWidth,
        gap: SCREEN_THEME.spacing.cardInnerGap,
    },
    inputGroup: {
        gap: SCREEN_THEME.spacing.cardInnerGap,
        width: '100%',
    },
    label: {
        fontFamily: 'SF Pro Display',
        fontWeight: '500',
        fontSize: SCREEN_THEME.typography.labelSize,
    },
    inputContainer: {
        height: SCREEN_THEME.layout.inputHeight,
        backgroundColor: SCREEN_THEME.colors.inputBg,
        borderRadius: SCREEN_THEME.layout.inputRadius,
        borderWidth: 1,
        borderColor: SCREEN_THEME.colors.borderColor,
        justifyContent: 'center',
    },
    input: {
        fontSize: SCREEN_THEME.typography.labelSize,
        paddingHorizontal: rs(20),
        color: '#FFFFFF', // Assuming white text for dark bg
    },
    passwordContainer: {
        position: 'relative',
        width: '100%',
        height: SCREEN_THEME.layout.inputHeight,
        justifyContent: 'center',
    },
    showButton: {
        position: 'absolute',
        right: 40,
        paddingHorizontal: rs(40),
        paddingVertical: rs(10),
        borderRadius: rs(20),
        borderWidth: 2,
        borderColor: '#BFDBFE', // blue-200
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    showButtonText: {
        fontFamily: 'SF Pro Display',
        fontWeight: '400',
        fontSize: SCREEN_THEME.typography.showTextSize,
        color: '#FFFFFF',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'center', // Center the Sign In button
        alignItems: 'center',
        marginTop: rs(72), // Calculated to match 540vh content height
        width: '100%',
        position: 'relative', // For absolute positioning context
    },
    signInButton: {
        paddingHorizontal: rs(40),
        paddingVertical: rs(20),
        borderRadius: rs(20),
        borderWidth: 2,
        borderColor: '#BFDBFE', // blue-200
        backgroundColor: SCREEN_THEME.colors.blueButtonStart,
        width: undefined,
        // center alignment implied by justifyContent center
    },
    signInButtonText: {
        fontFamily: 'SF Pro Display',
        fontWeight: '500',
        fontSize: SCREEN_THEME.typography.buttonTextSize,
        color: '#FFFFFF',
    },
    forgotPasswordButton: {
        position: 'absolute',
        left: 0,
        paddingVertical: rs(20),
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    forgotPasswordText: {
        fontFamily: 'SF Pro Display',
        fontWeight: '500',
        fontSize: SCREEN_THEME.typography.buttonTextSize,
        color: SCREEN_THEME.colors.forgotPasswordText,
        textAlign: 'center',
    },
});
