import React, { useState } from 'react';
import {
    TextInput,
    TextInputProps,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

// Import Vector Icons
import Ionicons from 'react-native-vector-icons/Ionicons';

interface TVTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    secureTextEntry?: boolean;
    value: string;
    onChangeText: (text: string) => void;
    containerStyle?: StyleProp<ViewStyle>;
    showVisibilityIcon?: boolean;
}

export const TVTextInput: React.FC<TVTextInputProps> = ({
    label,
    error,
    secureTextEntry,
    style,
    value,
    onChangeText,
    containerStyle, // Destructure
    showVisibilityIcon = true,
    ...props
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={styles.container}>
            {label && (
                <Text
                    style={[
                        styles.label,
                        {
                            color: error ? theme.colors.error : theme.colors.textSecondary,
                            fontSize: theme.fontSize.caption,
                        },
                    ]}
                >
                    {label}
                </Text>
            )}

            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: error
                            ? theme.colors.error
                            : isFocused
                                ? theme.colors.focusBorder
                                : theme.colors.inputBorder,
                        borderRadius: theme.borderRadius.md,
                        borderWidth: 2, // Standardize to prevent layout shift
                    },
                    containerStyle, // Apply here
                ]}
            >
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: theme.colors.text,
                            fontSize: theme.fontSize.body,
                        },
                        style,
                    ]}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    {...props}
                />

                {secureTextEntry && showVisibilityIcon && (
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={togglePasswordVisibility}
                        // For TV, this touchable might be hard to reach if not handled via focus navigation.
                        // Usually on TV, "Show Password" is a separate button or action.
                        // But for now keeping it as a touchable (clickable via remote cursor if enabled or next focus).
                        // To make it fully accessible on TV, it should ideally be a focusable element next to input.
                        activeOpacity={0.7}
                        focusable={true} // Make focusable on TV
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={30}
                            color={theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <Text
                    style={[
                        styles.errorText,
                        { color: theme.colors.error, fontSize: theme.fontSize.caption },
                    ]}
                >
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: rs(20),
        width: '100%',
    },
    label: {
        marginBottom: rs(8),
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rs(16),
        height: rs(72), // Enforce height for container relative to input (60 + padding)
    },
    input: {
        flex: 1,
        paddingVertical: rs(12),
        // height removed from here as flex will handle it, or keep it match
        height: '100%',
    },
    eyeIcon: {
        padding: rs(10),
    },
    errorText: {
        marginTop: rs(6),
    },
});
