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
  rightAccessory?: React.ReactNode;
}

export const TVTextInput: React.FC<TVTextInputProps> = ({
  label,
  error,
  secureTextEntry,
  style,
  value,
  onChangeText,
  containerStyle,
  showVisibilityIcon = true,
  rightAccessory,
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
          },
          containerStyle,
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
            activeOpacity={0.7}
            focusable={true}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={30}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {rightAccessory && rightAccessory}
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
    height: rs(72),
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingVertical: rs(12),
    height: '100%',
  },
  eyeIcon: {
    padding: rs(10),
  },
  errorText: {
    marginTop: rs(6),
  },
});
