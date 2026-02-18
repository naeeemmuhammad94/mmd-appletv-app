import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FocusableCard } from './FocusableCard';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

interface TrainingAreaCardProps {
    title: string;
    imageUrl?: string;
    iconName?: string;
    onPress: () => void;
    width?: number;
    height?: number;
}

export const TrainingAreaCard: React.FC<TrainingAreaCardProps> = ({
    title,
    imageUrl,
    iconName = 'fitness-center',
    onPress,
    width = rs(250),
    height = rs(280),
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Fallback if no image
    const imageSource = imageUrl
        ? { uri: imageUrl }
        : null;

    return (
        <FocusableCard
            onPress={onPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
                styles.card,
                {
                    width,
                    height,
                    borderRadius: rs(10),
                    borderWidth: isFocused ? rs(4) : rs(2),
                    borderColor: isFocused ? theme.colors.primary : 'rgba(100,100,100,0.5)',
                    backgroundColor: theme.colors.surfaceVariant,
                },
            ]}
        >
            {imageSource ? (
                <ImageBackground
                    source={imageSource}
                    style={styles.imageBackground}
                    imageStyle={{ borderRadius: rs(8) }}
                >
                    <View style={[styles.overlay, { backgroundColor: isFocused ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.3)' }]}>
                        {/* Title at bottom */}
                        <Text style={styles.title}>{title}</Text>
                    </View>
                </ImageBackground>
            ) : (
                <View style={styles.fallbackContainer}>
                    <Icon name={iconName} size={rs(64)} color={theme.colors.textSecondary} />
                    <Text style={[styles.title, { textAlign: 'center' }]}>{title}</Text>
                </View>
            )}
        </FocusableCard>
    );
};

const styles = StyleSheet.create({
    card: {
        marginRight: rs(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: rs(16),
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: rs(16),
        gap: rs(16),
    },
    title: {
        fontSize: rs(32),
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'SF Pro Display',
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});
