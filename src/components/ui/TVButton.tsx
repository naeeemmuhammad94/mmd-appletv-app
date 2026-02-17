import React from 'react';
import { StyleSheet, Text, TextStyle, StyleProp, ViewStyle, ActivityIndicator } from 'react-native';
import { FocusableCard } from './FocusableCard';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

interface TVButtonProps {
    title: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    isLoading?: boolean;
    disabled?: boolean;
}

export const TVButton: React.FC<TVButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    isLoading,
    disabled,
}) => {
    const { theme } = useTheme();

    return (
        <FocusableCard
            onPress={onPress}
            disabled={disabled || isLoading}
            style={[
                styles.button,
                {
                    backgroundColor: disabled ? theme.colors.surfaceVariant : theme.colors.primary,
                    borderRadius: theme.borderRadius.md,
                },
                style,
            ]}
            focusedStyle={{
                backgroundColor: disabled ? theme.colors.surfaceVariant : theme.colors.primary,
                borderColor: theme.colors.text, // High contrast border on focus
                borderWidth: 3,
                transform: [{ scale: 1.05 }],
            }}
            scaleOnFocus={true}
        >
            {({ focused }) => (
                isLoading ? (
                    <ActivityIndicator color={theme.colors.text} size="small" />
                ) : (
                    <Text
                        style={[
                            styles.text,
                            {
                                color: theme.colors.text,
                                fontSize: theme.fontSize.button,
                            },
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                )
            )}
        </FocusableCard>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: rs(12),
        paddingHorizontal: rs(24),
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: rs(200),
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
});
