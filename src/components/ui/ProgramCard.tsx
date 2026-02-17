/**
 * ProgramCard – Card showing program thumbnail, title, play icon, and progress
 * Used in Programs row, Recently Watched, and Search results
 */

import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FocusableCard } from './FocusableCard';
import { ProgressBar } from './ProgressBar';
import { useTheme } from '../../theme';
import { rs, wp } from '../../theme/responsive';

interface ProgramCardProps {
    title: string;
    imageUrl?: string;
    progress?: number; // 0–100
    onPress: () => void;
    width?: number;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
    title,
    imageUrl,
    progress = 0,
    onPress,
    width = wp(22),
}) => {
    const { theme } = useTheme();
    const cardHeight = width * 0.56; // 16:9 aspect ratio

    return (
        <FocusableCard
            onPress={onPress}
            style={[
                styles.card,
                {
                    width,
                    height: cardHeight + rs(60),
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.md,
                },
            ]}
        >
            {/* Thumbnail */}
            <ImageBackground
                source={
                    imageUrl
                        ? { uri: imageUrl }
                        : undefined
                }
                style={[
                    styles.thumbnail,
                    {
                        width,
                        height: cardHeight,
                        backgroundColor: theme.colors.surfaceVariant,
                    },
                ]}
                imageStyle={{ borderTopLeftRadius: theme.borderRadius.md, borderTopRightRadius: theme.borderRadius.md }}
            >
                {/* Play overlay */}
                <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                        <Icon name="play-arrow" size={rs(36)} color="#FFFFFF" />
                    </View>
                </View>
            </ImageBackground>

            {/* Info */}
            <View style={styles.info}>
                <Text
                    numberOfLines={1}
                    style={[
                        styles.title,
                        { color: theme.colors.text, fontSize: theme.fontSize.caption },
                    ]}
                >
                    {title}
                </Text>
                {progress > 0 && (
                    <ProgressBar progress={progress} height={rs(4)} />
                )}
            </View>
        </FocusableCard>
    );
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        marginRight: rs(16),
    },
    thumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    playButton: {
        width: rs(56),
        height: rs(56),
        borderRadius: rs(28),
        backgroundColor: 'rgba(74, 144, 226, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: rs(12),
        paddingVertical: rs(8),
        gap: rs(6),
    },
    title: {
        fontWeight: '600',
    },
});
