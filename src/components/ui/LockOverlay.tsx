/**
 * LockOverlay – Semi-transparent overlay with lock icon
 * Shown on locked video sections (Intermediate / Advanced)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

interface LockOverlayProps {
    message?: string;
}

export const LockOverlay: React.FC<LockOverlayProps> = ({
    message = 'Complete previous level',
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.overlay}>
            <Icon name="lock" size={rs(36)} color="rgba(255,255,255,0.8)" />
            <Text
                style={[
                    styles.message,
                    { fontSize: theme.fontSize.caption, color: 'rgba(255,255,255,0.8)' },
                ]}
            >
                {message}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: rs(12),
        gap: rs(8),
    },
    message: {
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: rs(12),
    },
});
