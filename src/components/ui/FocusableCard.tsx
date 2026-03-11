import React, { useState } from 'react';
import {
  Pressable,
  ViewStyle,
  StyleProp,
  Animated,
  PressableProps,
} from 'react-native';

interface FocusableCardProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  focusedStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  children:
    | React.ReactNode
    | ((state: { focused: boolean; pressed: boolean }) => React.ReactNode);
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
  const [scale] = useState(new Animated.Value(1));

  const handleFocus = (e: any) => {
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
      style={({ focused }) => [style, focused && focusedStyle]}
      {...props}
    >
      {({ focused }) => (
        <Animated.View
          style={[{ flex: 1, transform: [{ scale }] }, wrapperStyle]}
        >
          {typeof children === 'function'
            ? children({ focused, pressed: false })
            : children}
        </Animated.View>
      )}
    </Pressable>
  );
};
