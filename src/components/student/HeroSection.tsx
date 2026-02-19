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

    const Container = withBackground ? ImageBackground : View;
    const containerProps = withBackground ? {
        source: imageSource,
        style: styles.container,
        imageStyle: styles.backgroundImage,
        resizeMode: "cover" as const
    } : {
        style: styles.container
    };

    return (
        <Container {...containerProps}>
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

                {/* Play Button - Absolute Centered */}
                <View style={styles.playButtonContainer}>
                    <PlayButton width={rs(120)} height={rs(120)} />
                </View>
            </View>

            {/* Gradient Overlay for text readability */}
            <View style={styles.gradientOverlay} />
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: rs(500), // Increased height for better look
        marginBottom: rs(40),
        justifyContent: 'center',
        paddingHorizontal: 0, // Reset padding
    },
    backgroundImage: {
        // No border radius needed for full bleed? Or maybe just simple cover
    },
    contentOverlay: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rs(60), // Add padding here
        zIndex: 2,
        position: 'relative',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // Darken background for text
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
        transform: [{ translateX: -rs(60) }, { translateY: -rs(60) }], // Center based on size
        zIndex: 3,
        // Shadow for play button
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    headerTitle: {
        fontSize: rs(56), // Larger title
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
