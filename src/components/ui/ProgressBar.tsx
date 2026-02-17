/**
 * ProgressBar – Thin horizontal progress indicator
 * Blue fill on dark track
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

interface ProgressBarProps {
    progress: number; // 0–100
    height?: number;
    trackColor?: string;
    fillColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = rs(6),
    trackColor,
    fillColor,
}) => {
    const { theme } = useTheme();
    const clampedProgress = Math.max(0, Math.min(100, progress));

    return (
        <View
            style={[
                styles.track,
                {
                    height,
                    borderRadius: height / 2,
                    backgroundColor: trackColor || 'rgba(255,255,255,0.15)',
                },
            ]}
        >
            <View
                style={[
                    styles.fill,
                    {
                        width: `${clampedProgress}%`,
                        height,
                        borderRadius: height / 2,
                        backgroundColor: fillColor || theme.colors.primary,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    track: {
        width: '100%',
        overflow: 'hidden',
    },
    fill: {},
});
