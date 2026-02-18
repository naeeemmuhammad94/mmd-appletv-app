import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FocusableCard } from './FocusableCard';
import { useTheme } from '../../theme';
import { rs, wp } from '../../theme/responsive';

interface ProgramCardProps {
    title: string;
    imageUrl?: string;
    progress?: number;
    onPress: () => void;
    width?: number;
    height?: number;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
    title,
    imageUrl,
    progress = 0,
    onPress,
    width = rs(380), // Approx w-96
    height = rs(240), // Approx h-64
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Fallback image if none provided
    const imageSource = imageUrl
        ? { uri: imageUrl }
        : { uri: 'https://images.unsplash.com/photo-1544367563-12123d81a13d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' };

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
            <ImageBackground
                source={imageSource}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: rs(8) }} // Inner radius slightly less
            >
                <View style={[styles.overlay, { backgroundColor: isFocused ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.4)' }]}>
                    {/* Center Icon */}
                    <View style={styles.centerIcon}>
                        <View style={styles.playIconCircle}>
                            <Icon name="play-arrow" size={rs(32)} color={theme.colors.primary} />
                        </View>
                    </View>

                    {/* Bottom Info */}
                    <View style={styles.footer}>
                        <View style={styles.textRow}>
                            <Text style={styles.title} numberOfLines={1}>
                                {title}
                            </Text>
                            <Text style={styles.percentage}>
                                {Math.round(progress)}%
                            </Text>
                        </View>
                        {/* Progress Bar */}
                        <View style={[styles.progressBarTrack, { backgroundColor: theme.colors.border }]}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${Math.min(100, Math.max(0, progress))}%`,
                                        backgroundColor: theme.colors.primary,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </FocusableCard>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: rs(24),
        overflow: 'hidden',
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'space-between',
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
    playIconCircle: {
        width: rs(64),
        height: rs(64),
        borderRadius: rs(32),
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: rs(2),
        borderColor: '#3B82F6', // Blue-500
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
        maxWidth: '80%',
    },
    percentage: {
        fontSize: rs(20),
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
    },
    progressBarTrack: {
        height: rs(6),
        width: '100%',
        borderRadius: rs(3),
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: rs(3),
    },
});
