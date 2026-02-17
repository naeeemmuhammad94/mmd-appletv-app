/**
 * VideoCard – Card for individual video lessons in Program Detail
 * Shows thumbnail, title, duration, and optional lock overlay
 */

import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FocusableCard } from './FocusableCard';
import { LockOverlay } from './LockOverlay';
import { useTheme } from '../../theme';
import { rs, wp } from '../../theme/responsive';

interface VideoCardProps {
    title: string;
    imageUrl?: string;
    duration?: string;       // e.g. "12:30"
    isLocked?: boolean;
    lockMessage?: string;
    onPress: () => void;
    width?: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({
    title,
    imageUrl,
    duration,
    isLocked = false,
    lockMessage,
    onPress,
    width = wp(18),
}) => {
    const { theme } = useTheme();
    const thumbHeight = width * 0.56;

    return (
        <FocusableCard
            onPress={isLocked ? undefined : onPress}
            disabled={isLocked}
            style={[
                styles.card,
                {
                    width,
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.md,
                },
            ]}
        >
            {/* Thumbnail */}
            <ImageBackground
                source={imageUrl ? { uri: imageUrl } : undefined}
                style={[
                    styles.thumbnail,
                    {
                        width,
                        height: thumbHeight,
                        backgroundColor: theme.colors.surfaceVariant,
                    },
                ]}
                imageStyle={{
                    borderTopLeftRadius: theme.borderRadius.md,
                    borderTopRightRadius: theme.borderRadius.md,
                }}
            >
                {/* Play icon */}
                {!isLocked && (
                    <View style={styles.playIcon}>
                        <Icon name="play-circle-outline" size={rs(40)} color="rgba(255,255,255,0.9)" />
                    </View>
                )}

                {/* Duration badge */}
                {duration && (
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{duration}</Text>
                    </View>
                )}

                {/* Lock overlay */}
                {isLocked && <LockOverlay message={lockMessage} />}
            </ImageBackground>

            {/* Title */}
            <View style={styles.info}>
                <Text
                    numberOfLines={2}
                    style={[
                        styles.title,
                        {
                            color: isLocked ? theme.colors.textSecondary : theme.colors.text,
                            fontSize: theme.fontSize.caption,
                        },
                    ]}
                >
                    {title}
                </Text>
            </View>
        </FocusableCard>
    );
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        marginRight: rs(16),
        marginBottom: rs(16),
    },
    thumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        position: 'absolute',
    },
    durationBadge: {
        position: 'absolute',
        bottom: rs(8),
        right: rs(8),
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderRadius: rs(6),
        paddingHorizontal: rs(8),
        paddingVertical: rs(4),
    },
    durationText: {
        color: '#FFFFFF',
        fontSize: rs(18),
        fontWeight: '500',
    },
    info: {
        padding: rs(12),
    },
    title: {
        fontWeight: '500',
    },
});
