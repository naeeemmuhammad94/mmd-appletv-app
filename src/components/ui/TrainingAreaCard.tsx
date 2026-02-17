/**
 * TrainingAreaCard – Square card for a study category
 * Shows category icon/image and title
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FocusableCard } from './FocusableCard';
import { useTheme } from '../../theme';
import { rs, wp } from '../../theme/responsive';

interface TrainingAreaCardProps {
    title: string;
    imageUrl?: string;
    iconName?: string; // fallback MaterialIcons name
    onPress: () => void;
    size?: number;
}

export const TrainingAreaCard: React.FC<TrainingAreaCardProps> = ({
    title,
    imageUrl,
    iconName = 'fitness-center',
    onPress,
    size = wp(14),
}) => {
    const { theme } = useTheme();

    return (
        <FocusableCard
            onPress={onPress}
            style={[
                styles.card,
                {
                    width: size,
                    height: size,
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                },
            ]}
        >
            <View style={styles.content}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={[styles.image, { width: size * 0.45, height: size * 0.45 }]}
                        resizeMode="contain"
                    />
                ) : (
                    <View
                        style={[
                            styles.iconContainer,
                            {
                                width: size * 0.45,
                                height: size * 0.45,
                                borderRadius: (size * 0.45) / 2,
                                backgroundColor: theme.colors.surfaceVariant,
                            },
                        ]}
                    >
                        <Icon
                            name={iconName}
                            size={size * 0.22}
                            color={theme.colors.primary}
                        />
                    </View>
                )}
                <Text
                    numberOfLines={2}
                    style={[
                        styles.title,
                        {
                            color: theme.colors.text,
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
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: rs(16),
        gap: rs(12),
    },
    image: {
        borderRadius: rs(8),
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: '600',
        textAlign: 'center',
    },
});
