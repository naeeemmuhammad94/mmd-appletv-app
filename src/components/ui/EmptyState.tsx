import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { TVButton } from './TVButton';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

interface EmptyStateProps {
  message: string;
  variant?: 'empty' | 'loading' | 'error';
  onRetry?: () => void;
  onGoBack?: () => void;
  retryLabel?: string;
  goBackLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  variant = 'empty',
  onRetry,
  onGoBack,
  retryLabel = 'Retry',
  goBackLabel = 'Go Back',
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {variant === 'loading' && (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.spinner}
        />
      )}
      <Text
        style={[
          styles.message,
          {
            color:
              variant === 'error'
                ? theme.colors.error
                : theme.colors.textSecondary,
            fontSize: theme.fontSize.body,
          },
        ]}
      >
        {message}
      </Text>
      <View style={styles.buttonRow}>
        {onRetry && (
          <TVButton
            title={retryLabel}
            onPress={onRetry}
            style={styles.button}
          />
        )}
        {onGoBack && (
          <TVButton
            title={goBackLabel}
            onPress={onGoBack}
            style={[
              styles.button,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(40),
  },
  spinner: {
    marginBottom: rs(20),
  },
  message: {
    textAlign: 'center',
    marginBottom: rs(30),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: rs(20),
  },
  button: {
    minWidth: rs(200),
  },
});
