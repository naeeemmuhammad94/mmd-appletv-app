import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { FocusableCard } from '../ui/FocusableCard';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import PlayButton from '../../../assets/icons/play_button.svg';
import LockIcon from '../../../assets/icons/lock.svg';

interface LessonCardProps {
    title?: string;
    duration?: string;
    image?: ImageSourcePropType;
    locked: boolean;
    lockMessage?: string;
    onPress?: () => void;
    width?: number;
    height?: number;
}

export const LessonCard: React.FC<LessonCardProps> = ({
    title,
    duration,
    image,
    locked,
    lockMessage = 'Complete Beginner level',
    onPress,
    width = rs(380),
    height = rs(240),
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    if (locked) {
        return (
            <FocusableCard
                onPress={onPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={[
                    styles.container,
                    {
                        width,
                        height,
                        borderRadius: rs(10),
                        borderWidth: isFocused ? rs(4) : rs(2),
                        borderColor: isFocused ? theme.colors.primary : 'rgba(59, 130, 246, 0.4)',
                    },
                ]}
            >
                <View style={[styles.lockedContent, { borderRadius: rs(8) }]}>
                    <View style={styles.lockIconContainer}>
                        <LockIcon width={rs(50)} height={rs(50)} />
                    </View>
                    <Text style={styles.lockMessage} numberOfLines={1}>
                        {lockMessage}
                    </Text>
                </View>
            </FocusableCard>
        );
    }

    // Unlocked card — matches ProgramCard styling
    const imageSource = image || { uri: '' };

    return (
        <FocusableCard
            onPress={onPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
                styles.container,
                {
                    width,
                    height,
                    borderRadius: rs(10),
                    borderWidth: isFocused ? rs(4) : rs(2),
                    borderColor: isFocused ? theme.colors.primary : 'rgba(100,100,100, 0.5)',
                },
            ]}
        >
            <View
                style={[
                    styles.cardContent,
                    {
                        borderRadius: rs(10),
                        borderWidth: isFocused ? rs(4) : 0,
                        borderColor: isFocused ? theme.colors.primary : 'transparent',
                    },
                ]}
            >
                {/* Image Layer */}
                <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
                    <Image
                        source={imageSource}
                        style={[StyleSheet.absoluteFill, { borderRadius: rs(8) }]}
                        resizeMode="cover"
                    />

                    {/* Overlay Layer */}
                    <View
                        style={[
                            styles.overlay,
                            { backgroundColor: isFocused ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.4)' },
                        ]}
                    >
                        {/* Center Play Icon */}
                        <View style={styles.centerIcon}>
                            <PlayButton width={rs(64)} height={rs(64)} />
                        </View>

                        {/* Bottom Info */}
                        <View style={styles.footer}>
                            <View style={styles.textRow}>
                                <Text style={styles.title} numberOfLines={1}>
                                    {title}
                                </Text>
                                {duration ? (
                                    <Text style={styles.durationText}>{duration}</Text>
                                ) : null}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </FocusableCard>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: rs(24),
        overflow: 'hidden',
    },
    cardContent: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: 'black',
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        padding: rs(16),
    },
    centerIcon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        width: '100%',
    },
    textRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: rs(8),
    },
    title: {
        fontSize: rs(28),
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
        maxWidth: '75%',
    },
    durationText: {
        fontSize: rs(20),
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
    },
    // Locked styles
    lockedContent: {
        flex: 1,
        backgroundColor: 'rgba(20, 20, 30, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: rs(16),
    },
    lockIconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockMessage: {
        fontSize: rs(20),
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginTop: rs(8),
    },
});
