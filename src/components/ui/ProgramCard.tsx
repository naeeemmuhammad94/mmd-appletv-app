import React, { useState, useRef, useCallback, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { FocusableCard } from './FocusableCard';
import { rs } from '../../theme/responsive';
import PlayButton from '../../../assets/icons/play_button.svg';
import Video from 'react-native-video';
import { resolveVimeoUrl } from '../../utils/resolveVimeoUrl';
import { useStudentSettingsStore } from '../../store/useStudentSettingsStore';
import { MediaTypeBadge } from '../student/MediaTypeBadge';
import type { MediaType } from '../../utils/getMediaType';

interface ProgramCardProps {
  title: string;
  image?: ImageSourcePropType | string;
  progress?: number;
  showPlayButton?: boolean;
  /** URL for hover-to-play preview (auto-plays on focus) */
  previewUrl?: string;
  variant?: 'default' | 'text-only';
  onPress: () => void;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  /** tvOS spatial navigation — passed through to the inner FocusableCard. */
  nextFocusUp?: any;
  /** Media kind — when 'pdf' or 'image', a corner badge is rendered. */
  mediaType?: MediaType;
}

/** Debounce delay before starting a preview */
const PREVIEW_DELAY_MS = 600;

export const ProgramCard = forwardRef<any, ProgramCardProps>(
  (
    {
      title,
      image,
      progress = 0,
      showPlayButton = true,
      previewUrl,
      variant = 'default',
      onPress,
      width = rs(380),
      height = rs(240),
      style,
      nextFocusUp,
      mediaType,
    },
    ref,
  ) => {
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

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      // Respect the student's autoplay preference for hover previews.
      if (previewUrl && variant !== 'text-only' && autoplayVideos) {
        previewTimer.current = setTimeout(async () => {
          const resolved = await resolveVimeoUrl(previewUrl);
          if (resolved && isMounted.current) {
            setResolvedPreviewUrl(resolved);
            setShowPreview(true);
          }
        }, PREVIEW_DELAY_MS);
      }
    }, [previewUrl, variant, autoplayVideos]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      if (previewTimer.current) {
        clearTimeout(previewTimer.current);
        previewTimer.current = null;
      }
      setShowPreview(false);
    }, []);

    // Resolve image source
    const imageSource =
      typeof image === 'string'
        ? { uri: image }
        : image
        ? image
        : {
            uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          };

    return (
      <FocusableCard
        ref={ref}
        nextFocusUp={nextFocusUp}
        onPress={onPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          styles.container,
          {
            width,
            height,
            borderRadius: rs(10),
            // Reserve a 4px border slot in the layout so focus only changes
            // the color, not the box size — avoids layout reflow.
            borderWidth: rs(4),
            // Color drives the focus visual via the local isFocused state.
            // Pressable's style({focused}) callback was tried first but is
            // unreliable on Android TV inside FlatList; the onFocus / onBlur
            // local-state pattern matches LessonCard which works there.
            borderColor: isFocused
              ? theme.colors.primary
              : 'rgba(100,100,100, 0.5)',
          },
          style,
        ]}
      >
        <View
          style={[
            styles.cardContent,
            {
              borderRadius: rs(10),
              backgroundColor: variant === 'text-only' ? '#1A1D24' : 'black',
            },
          ]}
        >
          {variant === 'text-only' ? (
            <View style={styles.textOnlyContainer}>
              <Text
                style={styles.textOnlyTitle}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {title.toUpperCase()}
              </Text>
            </View>
          ) : (
            /* Default Image Layer */
            <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <Image
                source={imageSource}
                style={[StyleSheet.absoluteFill, { borderRadius: rs(8) }]}
                resizeMode="cover"
              />

              {/* Hover-to-play preview — resolved HLS video on focus. Respects
                 the student's "Play with sound" setting. */}
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
                {/* Center Icon — hidden during preview */}
                {showPlayButton && !showPreview && (
                  <View style={styles.centerIcon}>
                    <PlayButton width={rs(64)} height={rs(64)} />
                  </View>
                )}
                {(showPreview || !showPlayButton) && (
                  <View style={styles.centerIcon} />
                )}

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
                </View>
              </View>
              {mediaType ? <MediaTypeBadge type={mediaType} /> : null}
            </View>
          )}
        </View>
      </FocusableCard>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginRight: rs(24),
    overflow: 'hidden',
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
  cardContent: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  textOnlyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(16),
  },
  textOnlyTitle: {
    fontSize: rs(32),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default ProgramCard;
