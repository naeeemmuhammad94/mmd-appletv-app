import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { TVTextInput } from '../../components/ui/TVTextInput';
import { TVButton } from '../../components/ui/TVButton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from '../../validations/forgotPasswordSchema';
import { authService } from '../../services/authService';
import { useMutation } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation';
import Tick from '../../../assets/icons/tick.svg';

import { AUTH_SCREEN_THEME as SCREEN_THEME } from '../../theme/authTheme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

import { AuthLayout } from '../../components/auth/AuthLayout';

// ...

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submittedUserName, setSubmittedUserName] = useState('');

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      userName: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) =>
      authService.sendPasswordResetEmail({
        userName: data.userName,
        email: '',
      }),
    onSuccess: (_, variables) => {
      setIsSuccess(true);
      setSubmittedUserName(variables.userName);
      setApiError(null);
    },
    onError: (error: any) => {
      setApiError(
        error.message || 'Failed to send reset email. Please try again.',
      );
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
      <Tick
        width={rs(120)}
        height={rs(120)}
        fill={theme.colors.success}
        style={styles.icon}
      />
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontSize: theme.fontSize.h2 },
        ]}
      >
        Email Sent!
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: theme.colors.textSecondary, fontSize: theme.fontSize.body },
        ]}
      >
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
        <Text
          style={[
            styles.resendText,
            { color: theme.colors.primary, fontSize: theme.fontSize.button },
          ]}
        >
          {mutation.isPending ? 'Sending...' : 'Resend Email'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRequestState = () => (
    <View style={styles.cardContent}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Username
        </Text>
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

        {apiError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        )}
      </View>

      {/* Bottom Row Actions - Matching LoginScreen */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>

        <TVButton
          title="Send Reset Link"
          onPress={handleSubmit(onSubmit)}
          isLoading={mutation.isPending}
          style={styles.sendButton}
          textStyle={styles.sendButtonText}
        />
      </View>
    </View>
  );

  return (
    <AuthLayout
      subtitle={
        !isSuccess
          ? "If you don't know your username contact your school for help."
          : undefined
      }
      showHeader={!isSuccess}
    >
      {isSuccess ? renderSuccessState() : renderRequestState()}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  // container, bgGradient, content, header* removed
  cardContent: {
    // Remove absolute positioning to match LoginScreen
    width: SCREEN_THEME.layout.cardContentWidth,
    gap: SCREEN_THEME.spacing.cardInnerGap,
    paddingTop: rs(60),
    paddingBottom: rs(80), // Generous bottom padding so the focused button's scale effect isn't clipped
  },
  // ... keep inputGroup and below

  inputGroup: {
    gap: rs(28), // Same as Login gap-7
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
  },
  input: {
    flex: 1,
    height: 'auto',
    fontSize: SCREEN_THEME.typography.labelSize,
    paddingHorizontal: rs(20),
    backgroundColor: 'transparent',
    color: '#FFFFFF', // Assuming white text for dark bg
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the Sign In button
    alignItems: 'center',
    marginTop: rs(50), // Match LoginScreen spacing
    width: '100%',
    position: 'relative', // For absolute positioning context
  },
  sendButton: {
    paddingHorizontal: rs(40),
    paddingVertical: rs(20),
    borderRadius: rs(20),
    borderWidth: 2,
    borderColor: '#BFDBFE', // blue-200
    backgroundColor: SCREEN_THEME.colors.blueButtonStart,
    width: undefined,
  },
  sendButtonText: {
    fontFamily: 'SF Pro Display',
    fontWeight: '500',
    fontSize: SCREEN_THEME.typography.buttonTextSize,
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    paddingVertical: rs(20),
    justifyContent: 'center',
    alignItems: 'flex-start',
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
    alignItems: 'center',
    paddingVertical: rs(10), // Small spacer
  },
  errorText: {
    color: '#EF4444', // red-500
    fontSize: SCREEN_THEME.typography.labelSize,
    fontFamily: 'SF Pro Display',
    fontWeight: '500',
    textAlign: 'center',
  },
});
