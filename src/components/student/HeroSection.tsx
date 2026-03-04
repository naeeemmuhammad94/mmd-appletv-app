import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import PlayButton from '../../../assets/icons/play_button.svg';
import BackgroundImage from '../../../assets/images/student-background.png';

interface HeroSectionProps {
    title: string;
    subtitle: string;
    progressText: string;
    image?: ImageSourcePropType | string;
    onContinuePress: () => void;
    withBackground?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    title,
    subtitle,
    progressText,
    image,
    onContinuePress,
    withBackground = true
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Resolve image source
    const imageSource = typeof image === 'string'
        ? { uri: image }
        : image || BackgroundImage;

    const content = (
        <>
            <View style={styles.contentOverlay}>
                {/* Info Column - Left Side */}
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

                {/* Play Button - Absolute Centered (non-focusable to avoid tvOS crash) */}
                <View style={styles.playButtonContainer} pointerEvents="none">
                    <PlayButton width={rs(120)} height={rs(120)} />
                </View>
            </View>

            {/* Gradient Overlay for text readability */}
            <View style={styles.gradientOverlay} />
        </>
    );

    if (withBackground) {
        return (
            <ImageBackground
                source={imageSource}
                style={styles.container}
                imageStyle={styles.backgroundImage}
                resizeMode="cover"
            >
                {content}
            </ImageBackground>
        );
    }

    return (
        <View style={styles.container}>
            {content}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: rs(500),
        marginBottom: rs(40),
        justifyContent: 'center',
        paddingHorizontal: 0,
    },
    backgroundImage: {},
    contentOverlay: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rs(60),
        zIndex: 2,
        position: 'relative',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 1,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: rs(40),
        zIndex: 3,
    },
    playButtonContainer: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: [{ translateX: -rs(60) }, { translateY: -rs(60) }],
        zIndex: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    headerTitle: {
        fontSize: rs(56),
        fontWeight: 'bold',
        color: 'white',
        marginBottom: rs(12),
    },
    subtitle: {
        fontSize: rs(28),
        color: 'rgba(255,255,255,0.95)',
        marginBottom: rs(12),
    },
    progressText: {
        fontSize: rs(22),
        color: 'rgba(255,255,255,0.7)',
        marginBottom: rs(30),
    },
    button: {
        paddingVertical: rs(18),
        paddingHorizontal: rs(40),
        borderRadius: rs(12),
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
        fontSize: rs(26),
        fontWeight: 'bold',
    },
    restartLink: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: rs(20),
    },
});
