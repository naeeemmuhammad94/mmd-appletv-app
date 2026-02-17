/**
 * VideoPlayerScreen – Full-screen video player for tvOS
 * Uses react-native-video for native playback with Siri Remote support
 *
 * Falls back to a placeholder UI if react-native-video is not installed
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { rs, hp } from '../../theme/responsive';
import type { StudentStackParamList } from '../../navigation';

type NavProp = NativeStackNavigationProp<StudentStackParamList>;
type RouteProps = RouteProp<StudentStackParamList, 'VideoPlayer'>;

// We try to import react-native-video, but if not installed yet, fallback to placeholder
let Video: any = null;
try {
    Video = require('react-native-video').default;
} catch (e) {
    // react-native-video not installed yet
}

const VideoPlayerScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<NavProp>();
    const route = useRoute<RouteProps>();
    const { videoUrl, title } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [hasError, setHasError] = useState(false);
    const videoRef = useRef<any>(null);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleError = useCallback((err: any) => {
        console.error('Video error:', err);
        setHasError(true);
        setIsLoading(false);
    }, []);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    // ── Fallback if react-native-video is not installed ─────────────────
    if (!Video) {
        return (
            <View style={[styles.container, { backgroundColor: '#000000' }]}>
                {/* Top bar */}
                <View style={styles.topBar}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <Icon name="arrow-back" size={rs(32)} color="#FFFFFF" />
                    </Pressable>
                    {title && (
                        <Text
                            numberOfLines={1}
                            style={[styles.videoTitle, { fontSize: theme.fontSize.h3 }]}
                        >
                            {title}
                        </Text>
                    )}
                </View>

                {/* Placeholder */}
                <View style={styles.placeholderCenter}>
                    <Icon name="play-circle-outline" size={rs(120)} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.placeholderText}>
                        Video Player
                    </Text>
                    <Text style={styles.placeholderSubtext}>
                        Install react-native-video for playback
                    </Text>
                    <Text
                        numberOfLines={2}
                        style={[styles.urlText, { fontSize: theme.fontSize.caption }]}
                    >
                        {videoUrl}
                    </Text>
                </View>

                {/* Controls bar */}
                <View style={styles.controlsBar}>
                    <Pressable onPress={togglePause} style={styles.controlButton}>
                        <Icon
                            name={isPaused ? 'play-arrow' : 'pause'}
                            size={rs(40)}
                            color="#FFFFFF"
                        />
                    </Pressable>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '0%' }]} />
                    </View>
                    <Text style={styles.timeText}>0:00 / 0:00</Text>
                </View>
            </View>
        );
    }

    // ── Real video player ───────────────────────────────────────────────
    return (
        <View style={[styles.container, { backgroundColor: '#000000' }]}>
            <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={styles.video}
                paused={isPaused}
                resizeMode="contain"
                onLoad={handleLoad}
                onError={handleError}
                controls={Platform.isTV}
                fullscreen={true}
                ignoreSilentSwitch="ignore"
            />

            {/* Loading overlay */}
            {isLoading && !hasError && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading video…</Text>
                </View>
            )}

            {/* Error overlay */}
            {hasError && (
                <View style={styles.errorOverlay}>
                    <Icon name="error-outline" size={rs(64)} color={theme.colors.error} />
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                        Unable to play video
                    </Text>
                    <Pressable onPress={handleBack} style={[styles.errorButton, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.errorButtonText, { color: theme.colors.text }]}>
                            Go Back
                        </Text>
                    </Pressable>
                </View>
            )}

            {/* Top overlay (only when not using native controls) */}
            {!Platform.isTV && (
                <View style={styles.topBar}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <Icon name="arrow-back" size={rs(32)} color="#FFFFFF" />
                    </Pressable>
                    {title && (
                        <Text numberOfLines={1} style={[styles.videoTitle, { fontSize: theme.fontSize.h3 }]}>
                            {title}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    // ── Top bar
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rs(40),
        paddingTop: rs(32),
        gap: rs(16),
        zIndex: 10,
    },
    backButton: {
        width: rs(56),
        height: rs(56),
        borderRadius: rs(28),
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoTitle: {
        color: '#FFFFFF',
        fontWeight: '600',
        flex: 1,
    },
    // ── Placeholder
    placeholderCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: rs(16),
    },
    placeholderText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: rs(36),
        fontWeight: '600',
    },
    placeholderSubtext: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: rs(24),
    },
    urlText: {
        color: 'rgba(255,255,255,0.3)',
        maxWidth: '70%',
        textAlign: 'center',
    },
    // ── Controls (placeholder)
    controlsBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rs(40),
        paddingBottom: rs(32),
        gap: rs(16),
    },
    controlButton: {
        width: rs(56),
        height: rs(56),
        borderRadius: rs(28),
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressTrack: {
        flex: 1,
        height: rs(6),
        borderRadius: rs(3),
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    progressFill: {
        height: '100%',
        borderRadius: rs(3),
        backgroundColor: '#4A90E2',
    },
    timeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: rs(20),
    },
    // ── Loading / Error overlays
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        gap: rs(16),
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: rs(24),
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.85)',
        gap: rs(16),
    },
    errorText: {
        fontSize: rs(28),
        fontWeight: '600',
    },
    errorButton: {
        paddingHorizontal: rs(32),
        paddingVertical: rs(14),
        borderRadius: rs(12),
        marginTop: rs(16),
    },
    errorButtonText: {
        fontSize: rs(24),
        fontWeight: '600',
    },
});

export default VideoPlayerScreen;
