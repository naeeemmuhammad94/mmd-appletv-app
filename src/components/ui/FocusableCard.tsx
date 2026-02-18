import React, { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    ViewStyle,
    StyleProp,
    Animated,
    PressableProps,
} from 'react-native';
import { useTheme } from '../../theme';

interface FocusableCardProps extends PressableProps {
    style?: StyleProp<ViewStyle>;
    focusedStyle?: StyleProp<ViewStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;
    children: React.ReactNode | ((state: { focused: boolean; pressed: boolean }) => React.ReactNode);
    scaleOnFocus?: boolean;
}

export const FocusableCard: React.FC<FocusableCardProps> = ({
    style,
    focusedStyle,
    wrapperStyle,
    children,
    scaleOnFocus = true,
    onFocus,
    onBlur,
    ...props
}) => {
    const { theme } = useTheme();
    const [scale] = useState(new Animated.Value(1));
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        if (scaleOnFocus) {
            Animated.spring(scale, {
                toValue: 1.05,
                friction: 3,
                useNativeDriver: true,
            }).start();
        }
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (scaleOnFocus) {
            Animated.spring(scale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }).start();
        }
        onBlur?.(e);
    };

    return (
        <Pressable
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={({ pressed, focused }) => [
                style,
                focused && focusedStyle,
            ]}
            {...props}
        >
            {({ pressed, focused }) => (
                <Animated.View style={[{ flex: 1, transform: [{ scale }] }, wrapperStyle]}>
                    {typeof children === 'function'
                        ? children({ focused, pressed })
                        : children}
                </Animated.View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    focused: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1,
    },
});
