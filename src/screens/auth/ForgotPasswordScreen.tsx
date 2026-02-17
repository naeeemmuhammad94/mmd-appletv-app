import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { rs, wp } from '../../theme/responsive';
import { TVTextInput } from '../../components/ui/TVTextInput';
import { TVButton } from '../../components/ui/TVButton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../validations/forgotPasswordSchema';
import { authService } from '../../services/authService';
import { useMutation } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../../assets/icons/logo.svg';

// ─── Figma Inspector Values ──────────────────────────────────────
const SCREEN_THEME = {
    layout: {
        containerWidth: rs(1680), // w-[1680px]
        headerWidth: rs(592),     // w-[592px]
        cardContentWidth: rs(1459), // w-[1459px]
        cardHeight: rs(517),      // h-[517px]
        borderRadius: rs(40),     // rounded-[40px]
        inputHeight: rs(96),      // h-24 -> 96px
        inputRadius: rs(16),      // rounded-2xl -> 16px
    },
    spacing: {
        mainGap: rs(64),          // gap-16 -> 64px
        headerGap: rs(10),        // gap-2.5 -> 10px
        headerIconGap: rs(14),    // gap-3.5 -> 14px
        cardInnerGap: rs(96),     // gap-24 -> 96px
        backButtonTop: rs(370),   // top-[370px] absolute
    },
    typography: {
        headerSubtitleSize: rs(36), // text-4xl -> 36px
        labelSize: rs(48),        // text-5xl -> 48px
        buttonTextSize: rs(48),   // text-5xl -> 48px
        logoSize: rs(64),         // w-16 h-16 -> 64px
    },
    colors: {
        headerText: 'rgba(255, 255, 255, 0.6)', // text-white/60
        cardBg: 'rgba(31, 41, 55, 0.7)',        // bg-gray-800/70
        inputBg: 'rgba(0, 0, 0, 0.2)',          // bg-black/20
        borderColor: '#A3A3A3',                 // border-neutral-400
        blueButtonStart: '#3B82F6',             // from-blue-500
        blueButtonEnd: '#1E40AF',               // to-blue-800
        backButtonText: '#3B82F6',              // text-blue-500
    },
} as const;

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
    const { theme } = useTheme();
    const [isSuccess, setIsSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [submittedUserName, setSubmittedUserName] = useState('');

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            userName: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: ForgotPasswordFormData) =>
            authService.sendPasswordResetEmail({ userName: data.userName, email: '' }),
        onSuccess: (_, variables) => {
            setIsSuccess(true);
            setSubmittedUserName(variables.userName);
            setApiError(null);
        },
        onError: (error: any) => {
            setApiError(error.message || 'Failed to send reset email. Please try again.');
        },
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        mutation.mutate(data);
    };

    const handleResend = () => {
        if (submittedUserName) {
            mutation.mutate({ userName: submittedUserName });
        }
    };

    const renderSuccessState = () => (
        <View style={styles.successContent}>
            <Ionicons name="checkmark-circle" size={rs(120)} color={theme.colors.success} style={styles.icon} />
            <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.fontSize.h2 }]}>
                Email Sent!
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.fontSize.body }]}>
                We've sent a password reset link to your registered email address.
            </Text>

            <TVButton
                title="Back to Login"
                onPress={() => navigation.navigate('Login')}
            />

            <TouchableOpacity
                onPress={handleResend}
                style={styles.resendButton}
                disabled={mutation.isPending}
            >
                <Text style={[styles.resendText, { color: theme.colors.primary, fontSize: theme.fontSize.button }]}>
                    {mutation.isPending ? 'Sending...' : 'Resend Email'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderRequestState = () => (
        <View style={styles.cardContent}>
            {apiError && (
                <View style={[styles.errorContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Text style={[styles.errorText, { color: theme.colors.error, fontSize: theme.fontSize.caption }]}>
                        {apiError}
                    </Text>
                </View>
            )}

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
                        // Using style for container styling if valid, or wrapper
                        // containerStyle mapping TBD based on TVTextInput check
                        />
                    )}
                />
            </View>

            <View style={styles.sendButtonContainer}>
                <TVButton
                    title="Send Reset Link"
                    onPress={handleSubmit(onSubmit)}
                    isLoading={mutation.isPending}
                    style={styles.sendButton}
                    textStyle={styles.sendButtonText}
                />
            </View>

            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Text style={styles.backText}>
                    Back to Sign In
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.bgGradient} />

            <View style={styles.content}>
                {!isSuccess && (
                    <View style={styles.header}>
                        <View style={styles.headerIconContainer}>
                            <Logo
                                width={SCREEN_THEME.typography.logoSize}
                                height={SCREEN_THEME.typography.logoSize}
                                fill={theme.colors.text}
                            />
                        </View>
                        <Text style={[styles.headerSubtitle, { color: SCREEN_THEME.colors.headerText }]}>
                            If you don't know your username contact your school for help.
                        </Text>
                    </View>
                )}

                <View style={[
                    styles.card,
                    {
                        borderColor: SCREEN_THEME.colors.borderColor,
                        // Adjust height dynamically if success state is different,
                        // but design implies fixed size for form. Success state might reuse or differ.
                        // I will stick to fixed height for form.
                        height: isSuccess ? undefined : SCREEN_THEME.layout.cardHeight,
                    }
                ]}>
                    {isSuccess ? renderSuccessState() : renderRequestState()}
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
        width: SCREEN_THEME.layout.headerWidth,
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
        width: '100%',
        maxWidth: SCREEN_THEME.layout.containerWidth,
        backgroundColor: SCREEN_THEME.colors.cardBg,
        borderRadius: SCREEN_THEME.layout.borderRadius,
        // Borders
        borderLeftWidth: 2,
        borderRightWidth: 1,
        borderTopWidth: 2,
        borderBottomWidth: 1,
        // Shadows
        shadowColor: '#000',
        shadowOffset: { width: 20, height: 18 },
        shadowOpacity: 0.37,
        shadowRadius: 37,
        elevation: 10,
        overflow: 'hidden',
        alignItems: 'center', // Success state centering
        justifyContent: 'center',
    },
    cardContent: {
        position: 'absolute',
        top: 69, // top-[69px]
        left: 110, // left-[110px]
        width: SCREEN_THEME.layout.cardContentWidth,
        gap: SCREEN_THEME.spacing.cardInnerGap,
    },
    inputGroup: {
        gap: rs(28), // Same as Login gap-7
        width: '100%',
    },
    label: {
        fontFamily: 'SF Pro Display',
        fontWeight: '500',
        fontSize: SCREEN_THEME.typography.labelSize,
    },
    input: {
        height: SCREEN_THEME.layout.inputHeight,
        backgroundColor: SCREEN_THEME.colors.inputBg,
        borderRadius: SCREEN_THEME.layout.inputRadius,
        borderWidth: 1,
        borderColor: SCREEN_THEME.colors.borderColor,
        fontSize: SCREEN_THEME.typography.labelSize,
        paddingHorizontal: rs(20),
        color: '#FFFFFF',
    },
    sendButtonContainer: {
        // "px-10 py-5 bg-gradient... inline-flex"
        alignItems: 'flex-start',
    },
    sendButton: {
        paddingHorizontal: rs(40),
        paddingVertical: rs(20),
        borderRadius: rs(20),
        borderWidth: 2,
        borderColor: '#BFDBFE', // blue-200
        backgroundColor: SCREEN_THEME.colors.blueButtonStart,
    },
    sendButtonText: {
        fontFamily: 'SF Pro Display',
        fontWeight: '500',
        fontSize: SCREEN_THEME.typography.buttonTextSize,
        color: '#FFFFFF',
    },
    backButton: {
        position: 'absolute',
        left: 127, // left-[127px] -> Relative to CARD? 
        // Design says "left-[127px] top-[370px] absolute"
        // This acts as absolute to the card container (since it's inside `relative` in web).
        // My `cardContent` wrapper is absolute.
        // `backButton` being absolute inside `cardContent` might be tricky if `cardContent` has fixed size.
        // Actually, in web `top-[370px]` is relative to Card. 
        // My `cardContent` is at top 69.
        // So 370 - 69 = 301 from top of `cardContent`.
        // Or just use absolute on Card level if possible, but structure prevents easy sibling overlap.
        // I'll put it outside `cardContent` or use absolute positioning similar to `cardContent`.
        top: SCREEN_THEME.spacing.backButtonTop,
        width: rs(384), // w-96
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontFamily: 'SF Pro Display',
        fontWeight: '500',
        fontSize: SCREEN_THEME.typography.buttonTextSize,
        color: SCREEN_THEME.colors.backButtonText,
        textAlign: 'center',
    },
    // Success State Styles
    successContent: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: rs(60),
        gap: rs(30),
    },
    icon: {
        marginBottom: rs(20),
    },
    title: {
        fontWeight: '700',
        marginBottom: rs(10),
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: rs(20),
        textAlign: 'center',
        maxWidth: rs(1200),
    },
    resendButton: {
        padding: rs(12),
    },
    resendText: {
        fontWeight: '500',
    },
    errorContainer: {
        width: '100%',
        padding: rs(12),
        borderRadius: rs(8),
        marginBottom: rs(20),
        alignItems: 'center',
    },
    errorText: {
        textAlign: 'center',
        fontWeight: '500',
    },
});
