import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { FocusableCard } from '../ui/FocusableCard';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import PlayButton from '../../../assets/icons/play_button.svg';
import FileIcon from '../../../assets/icons/file.svg';
import LockIcon from '../../../assets/icons/lock.svg';
import Video from 'react-native-video';
import { resolveVimeoUrl } from '../../utils/resolveVimeoUrl';
import { useStudentSettingsStore } from '../../store/useStudentSettingsStore';

interface LessonCardProps {
  title?: string;
  duration?: string;
  image?: ImageSourcePropType;
  locked: boolean;
  lockMessage?: string;
  /** Watch progress 0–100 */
  progress?: number;
  /** URL for hover-to-play preview (auto-plays on focus) */
  previewUrl?: string;
  onPress?: () => void;
  width?: number;
  height?: number;
}

/** Debounce delay before starting a preview (avoids loading during fast scrolling) */
const PREVIEW_DELAY_MS = 600;

const isPlayableVideo = (url?: string) =>
  !!url &&
  (url.includes('vimeo') || url.includes('.mp4') || url.includes('.m3u8'));

export const LessonCard: React.FC<LessonCardProps> = ({
  title,
  duration,
  image,
  locked,
  lockMessage = 'Complete Beginner level',
  progress = 0,
  previewUrl,
  onPress,
  width = rs(380),
  height = rs(240),
}) => {
  const { theme } = useTheme();
  const autoplayVideos = useStudentSettingsStore(s => s.autoplayVideos);
  const autoplaySound = useStudentSettingsStore(s => s.autoplaySound);
  const [isFocused, setIsFocused] = useState(false);
  const [resolvedPreviewUrl, setResolvedPreviewUrl] = useState<string | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const isVideo = isPlayableVideo(previewUrl);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (isVideo && previewUrl && !locked && autoplayVideos) {
      previewTimer.current = setTimeout(async () => {
        // Resolve the Vimeo URL to an HLS stream
        const resolved = await resolveVimeoUrl(previewUrl);
        if (resolved && isMounted.current) {
          setResolvedPreviewUrl(resolved);
          setShowPreview(true);
        }
      }, PREVIEW_DELAY_MS);
    }
  }, [isVideo, previewUrl, locked, autoplayVideos]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (previewTimer.current) {
      clearTimeout(previewTimer.current);
      previewTimer.current = null;
    }
    setShowPreview(false);
  }, []);

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
            borderColor: isFocused
              ? theme.colors.primary
              : 'rgba(59, 130, 246, 0.4)',
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

  // Unlocked card
  const imageSource = image || { uri: '' };
  const hasProgress = progress > 0;

  return (
    <FocusableCard
      onPress={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius: rs(10),
          borderWidth: isFocused ? rs(4) : rs(2),
          borderColor: isFocused
            ? theme.colors.primary
            : 'rgba(100,100,100, 0.5)',
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
        {/* Image / Preview Layer */}
        <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
          <Image
            source={imageSource}
            style={[StyleSheet.absoluteFill, { borderRadius: rs(8) }]}
            resizeMode="cover"
          />

          {/* Hover-to-play preview — resolved HLS video on focus */}
          {showPreview && resolvedPreviewUrl && (
            <Video
              source={{ uri: resolvedPreviewUrl }}
              style={[StyleSheet.absoluteFill, { borderRadius: rs(8) }]}
              muted={!autoplaySound}
              repeat={true}
              resizeMode="cover"
              controls={false}
            />
          )}

          {/* Overlay Layer */}
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: isFocused
                  ? 'rgba(0,0,0,0.1)'
                  : 'rgba(0,0,0,0.4)',
              },
            ]}
          >
            {/* Center icon — play for videos, file icon for non-video
               content (PDF/other); hidden during preview playback. */}
            {!showPreview && (
              <View style={styles.centerIcon}>
                {isVideo ? (
                  <PlayButton width={rs(64)} height={rs(64)} />
                ) : (
                  <FileIcon width={rs(64)} height={rs(64)} />
                )}
              </View>
            )}
            {showPreview && <View style={styles.centerIcon} />}

            {/* Bottom Info */}
            <View style={styles.footer}>
              <View style={styles.textRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                {hasProgress ? (
                  <Text style={styles.percentageText}>
                    {Math.round(progress)}%
                  </Text>
                ) : duration ? (
                  <Text style={styles.durationText}>{duration}</Text>
                ) : null}
              </View>

              {/* Progress Bar */}
              {hasProgress && (
                <View
                  style={[
                    styles.progressBarTrack,
                    { backgroundColor: theme.colors.border },
                  ]}
                >
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
              )}
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
  percentageText: {
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
