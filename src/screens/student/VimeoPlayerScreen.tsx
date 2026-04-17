import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { rs } from '../../theme/responsive';
import { useWatchHistoryStore } from '../../store/useWatchHistoryStore';
import Video, { OnProgressData, OnLoadData } from 'react-native-video';
import { resolveVimeoUrl } from '../../utils/resolveVimeoUrl';

type VimeoPlayerRouteProp = RouteProp<StudentStackParamList, 'VideoPlayer'>;
type VimeoPlayerNavigationProp = NativeStackNavigationProp<
  StudentStackParamList,
  'VideoPlayer'
>;

/**
 * Cross-platform video player screen using react-native-video.
 * Works on both Apple TV (AVPlayer) and Android TV (ExoPlayer).
 *
 * Navigation: Press Menu (Apple TV remote) or Back (Android TV remote)
 * to return to the previous screen.
 */
const VimeoPlayerScreen: React.FC = () => {
  const navigation = useNavigation<VimeoPlayerNavigationProp>();
  const route = useRoute<VimeoPlayerRouteProp>();
  const { videoUrl, title, contentId } = route.params;
  const { addToHistory, updateProgress } = useWatchHistoryStore();

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoDuration = useRef<number>(0);
  const lastProgress = useRef<number>(0);

  // Resolve the video URL using the shared utility
  const loadVideo = useCallback(async (url: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const resolved = await resolveVimeoUrl(url);

      if (!resolved) {
        setError('Could not extract video stream URL');
        setIsLoading(false);
        return;
      }

      setResolvedUrl(resolved);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load video';
      setError(message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only record video content in watch history. The upstream callers
    // already gate on contentLink type, but guard here too so history
    // stays strictly video-only regardless of navigation path.
    const isVideoUrl =
      !!videoUrl &&
      (videoUrl.includes('vimeo') ||
        videoUrl.includes('.mp4') ||
        videoUrl.includes('.m3u8'));
    if (contentId && isVideoUrl) {
      addToHistory({ contentId, title: title || 'Unknown Video' });
    }

    loadVideo(videoUrl);

    // Save progress when leaving the screen
    return () => {
      if (contentId && videoDuration.current > 0) {
        const percent = Math.round(
          (lastProgress.current / videoDuration.current) * 100,
        );
        updateProgress(contentId, Math.min(percent, 100));
      }
    };
  }, [videoUrl, contentId, title, addToHistory, updateProgress, loadVideo]);

  const handleLoad = (data: OnLoadData) => {
    videoDuration.current = data.duration;
    setIsLoading(false);
  };

  const handleProgress = (data: OnProgressData) => {
    lastProgress.current = data.currentTime;
  };

  const handleError = () => {
    setError('Video playback failed. The stream may be unavailable.');
    setIsLoading(false);
  };

  const handleEnd = () => {
    // Mark as 100% watched
    if (contentId) {
      updateProgress(contentId, 100);
    }
    navigation.goBack();
  };

  // ── Error state ──
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => loadVideo(videoUrl)}
            style={styles.retryBtn}
            hasTVPreferredFocus={true}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Loading + Video ──
  return (
    <View style={styles.container}>
      {/* Loading indicator (shown until onLoad fires) */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingTitle}>
            {title ? `Loading ${title}...` : 'Loading video...'}
          </Text>
        </View>
      )}

      {/* react-native-video — native controls, back via remote Menu/Back button */}
      {resolvedUrl && (
        <Video
          source={{ uri: resolvedUrl }}
          style={styles.video}
          controls={true}
          fullscreen={true}
          resizeMode="contain"
          onLoad={handleLoad}
          onProgress={handleProgress}
          onError={handleError}
          onEnd={handleEnd}
          progressUpdateInterval={5000}
          ignoreSilentSwitch="ignore"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 10,
  },
  loadingTitle: {
    color: 'white',
    fontSize: rs(24),
    marginTop: rs(20),
    opacity: 0.8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: rs(24),
    marginBottom: rs(20),
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
  backBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: rs(22),
  },
});

export default VimeoPlayerScreen;
