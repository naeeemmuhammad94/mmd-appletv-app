import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Text,
    NativeModules,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { rs } from '../../theme/responsive';
import BackIcon from '../../../assets/icons/back-icon.svg';

type VimeoPlayerRouteProp = RouteProp<StudentStackParamList, 'VideoPlayer'>;
type VimeoPlayerNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'VideoPlayer'>;

/**
 * Extract HLS .m3u8 URL from a Vimeo embed page HTML.
 */
function extractHLSUrl(html: string): string | null {
    const marker = 'window.playerConfig = ';
    const idx = html.indexOf(marker);
    if (idx === -1) return null;

    const jsonStart = idx + marker.length;
    const scriptEnd = html.indexOf('</script>', jsonStart);
    if (scriptEnd === -1) return null;

    try {
        const config = JSON.parse(html.substring(jsonStart, scriptEnd));
        const hls = config?.request?.files?.hls;
        if (!hls) return null;

        const defaultCdn = hls.default_cdn;
        const cdnData = hls.cdns?.[defaultCdn];
        if (!cdnData) return null;

        const url = cdnData.avc_url || cdnData.url || '';
        return url.replace(/\\u0026/g, '&');
    } catch (e) {
        console.warn('[VimeoPlayer] JSON parse error:', e);
        return null;
    }
}

/**
 * Video player screen that:
 * 1. Fetches the Vimeo embed page
 * 2. Extracts the HLS stream URL
 * 3. Calls the native VimeoPlayerModule to play with AVPlayerViewController
 */
const VimeoPlayerScreen: React.FC = () => {
    const navigation = useNavigation<VimeoPlayerNavigationProp>();
    const route = useRoute<VimeoPlayerRouteProp>();
    const { videoUrl, title } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>('');

    const playVideo = async (url: string) => {
        try {
            setIsLoading(true);
            setError(null);
            setDebugInfo('Fetching video page...');

            // Step 1: Fetch the Vimeo embed HTML
            const response = await fetch(url);
            const html = await response.text();
            setDebugInfo('Parsing video config...');

            // Step 2: Extract HLS URL from playerConfig
            const hlsUrl = extractHLSUrl(html);
            if (!hlsUrl) {
                setError('Could not extract video stream URL');
                setDebugInfo('HLS extraction failed');
                setIsLoading(false);
                return;
            }

            setDebugInfo('Launching native player...');

            // Step 3: Call native module to play the direct HLS URL
            const playerModule = NativeModules.VimeoPlayerModule;
            if (playerModule && typeof playerModule.playHLS === 'function') {
                playerModule.playHLS(hlsUrl, title || '');
                setTimeout(() => setIsLoading(false), 2000);
            } else {
                // Debug: show available modules
                const moduleNames = Object.keys(NativeModules).sort();
                setDebugInfo(`Module not found. Available: ${moduleNames.join(', ')}`);
                setError('Video player module not available');
                setIsLoading(false);
            }
        } catch (e: any) {
            setError(e.message || 'Failed to load video');
            setDebugInfo(`Error: ${e.message}`);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        playVideo(videoUrl);
    }, [videoUrl]);

    const handleBackPress = () => {
        navigation.goBack();
    };

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={styles.debugText}>{debugInfo}</Text>
                    <TouchableOpacity
                        onPress={() => playVideo(videoUrl)}
                        style={styles.retryBtn}
                        hasTVPreferredFocus={true}
                    >
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleBackPress}
                        style={styles.backBtn}
                    >
                        <Text style={styles.backBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingTitle}>
                        {title ? `Loading ${title}...` : 'Loading video...'}
                    </Text>
                    <Text style={styles.debugText}>{debugInfo}</Text>
                </View>
            ) : (
                <View style={styles.centerContent}>
                    <Text style={styles.infoText}>
                        Video player is open. Press Menu on the remote to return.
                    </Text>
                    <TouchableOpacity
                        onPress={() => playVideo(videoUrl)}
                        style={styles.retryBtn}
                        hasTVPreferredFocus={true}
                    >
                        <Text style={styles.retryBtnText}>Play Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleBackPress}
                        style={styles.backBtn}
                    >
                        <View style={styles.backBtnInner}>
                            <BackIcon width={rs(24)} height={rs(24)} fill="white" />
                            <Text style={styles.backBtnText}>Back to Program</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingTitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: rs(24),
        marginTop: rs(16),
    },
    infoText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: rs(22),
        marginBottom: rs(32),
    },
    errorText: {
        color: '#EF4444',
        fontSize: rs(28),
        fontWeight: 'bold',
        marginBottom: rs(12),
    },
    debugText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: rs(16),
        marginTop: rs(8),
        marginBottom: rs(16),
        textAlign: 'center',
        paddingHorizontal: rs(40),
    },
    retryBtn: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: rs(40),
        paddingVertical: rs(14),
        borderRadius: rs(12),
        marginBottom: rs(20),
    },
    retryBtnText: {
        color: 'white',
        fontSize: rs(22),
        fontWeight: '600',
    },
    backBtn: {
        paddingHorizontal: rs(32),
        paddingVertical: rs(14),
        borderRadius: rs(12),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    backBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtnText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: rs(22),
        marginLeft: rs(12),
    },
});

export default VimeoPlayerScreen;
