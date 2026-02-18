import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ImageSourcePropType } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import PlayButton from '../../../assets/icons/play_button.svg';

interface HeroSectionProps {
    title: string;
    subtitle: string;
    progressText: string;
    image?: ImageSourcePropType | string;
    onContinuePress: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    title,
    subtitle,
    progressText,
    image,
    onContinuePress
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Resolve image source
    const imageSource = typeof image === 'string'
        ? { uri: image }
        : image
            ? image
            : { uri: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' };

    return (
        <View style={styles.container}>
            {/* Info Column */}
            <View style={styles.infoContainer}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
                <Text style={styles.progressText}>{progressText}</Text>

                <TouchableOpacity
                    onPress={onContinuePress}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={[
                        styles.button,
                        { backgroundColor: theme.colors.primary },
                        isFocused && styles.buttonFocused
                    ]}
                >
                    <Text style={styles.buttonText}>Continue Training</Text>
                </TouchableOpacity>

                <Text style={styles.restartLink}>Restart Learning</Text>
            </View>

            {/* Image Column */}
            <View style={styles.imageContainer}>
                <View style={styles.overlay}>
                    <PlayButton width={rs(80)} height={rs(80)} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: rs(60),
        height: rs(400),
        marginBottom: rs(40),
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: rs(40),
    },
    imageContainer: {
        flex: 1.5,
        height: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    headerTitle: {
        fontSize: rs(48),
        fontWeight: 'bold',
        color: 'white',
        marginBottom: rs(8),
    },
    subtitle: {
        fontSize: rs(24),
        color: 'rgba(255,255,255,0.9)',
        marginBottom: rs(8),
    },
    progressText: {
        fontSize: rs(20),
        color: 'rgba(255,255,255,0.6)',
        marginBottom: rs(30),
    },
    button: {
        paddingVertical: rs(16),
        paddingHorizontal: rs(32),
        borderRadius: rs(8),
        alignSelf: 'flex-start',
        marginBottom: rs(20),
        borderWidth: 4,
        borderColor: 'transparent',
    },
    buttonFocused: {
        borderColor: 'white',
        transform: [{ scale: 1.05 }],
    },
    buttonText: {
        color: 'white',
        fontSize: rs(24),
        fontWeight: 'bold',
    },
    restartLink: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: rs(18),
    },
    image: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: rs(80),
        height: rs(80),
        borderRadius: rs(40),
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#3B82F6',
    },
});
