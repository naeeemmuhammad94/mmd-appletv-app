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
import { AUTH_SCREEN_THEME as SCREEN_THEME } from '../../theme/authTheme';
import { AuthLayout } from '../../components/auth/AuthLayout';

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
        <AuthLayout
            subtitle="Login to your Manage My Dojo account for access."
        >
            <View style={styles.cardContent}>
                {/* Error Message */}
                {(apiError || localError) && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                            {apiError || localError}
                        </Text>
                    </View>
                )}
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
                    </View>
                </View>

                {/* Bottom Row Actions */}
                <View style={styles.bottomRow}>
                    <View style={styles.bottomColLeft}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotPasswordButton}
                        >
                            <Text style={styles.forgotPasswordText}>
                                Forgot Password
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomColCenter}>
                        <TVButton
                            title="Sign In"
                            onPress={handleSubmit(onSubmit)}
                            isLoading={isLoading}
                            style={styles.signInButton}
                            textStyle={styles.signInButtonText}
                        />
                    </View>

                    <View style={styles.bottomColRight}>
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.showButton}
                            focusable={true}
                            accessible={true}
                            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                        >
                            <Text style={styles.showButtonText}>
                                {showPassword ? 'Hide Password' : 'Show Password'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    cardContent: {
        width: SCREEN_THEME.layout.cardContentWidth,
        gap: SCREEN_THEME.spacing.cardInnerGap,
        paddingTop: rs(60),
        paddingBottom: rs(80), // Generous bottom padding so the focused button's scale effect isn't clipped
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
        paddingHorizontal: rs(24),
        paddingVertical: rs(12),
        borderRadius: rs(24),
        borderWidth: 2,
        borderColor: '#BFDBFE', // blue-200
        backgroundColor: 'transparent',
    },
    showButtonText: {
        fontFamily: 'SF Pro Display',
        fontWeight: '400',
        fontSize: SCREEN_THEME.typography.showTextSize,
        color: '#FFFFFF',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: rs(50),
        width: '100%',
    },
    bottomColLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    bottomColCenter: {
        flex: 1,
        alignItems: 'center',
    },
    bottomColRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    signInButton: {
        paddingHorizontal: rs(50),
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
        paddingVertical: rs(20),
        justifyContent: 'center',
    },
    forgotPasswordText: {
        fontFamily: 'SF Pro Display',
        fontWeight: '500',
        fontSize: SCREEN_THEME.typography.buttonTextSize,
        color: SCREEN_THEME.colors.forgotPasswordText,
        textAlign: 'center',
    },
    errorContainer: {
        width: '100%',
        padding: rs(20),
        backgroundColor: 'rgba(239, 68, 68, 0.2)', // red-500/20
        borderRadius: rs(12),
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)', // red-500/50
        marginBottom: rs(20),
    },
    errorText: {
        color: '#FCA5A5', // red-300
        fontSize: rs(32),
        fontFamily: 'SF Pro Display',
        textAlign: 'center',
    },
});
