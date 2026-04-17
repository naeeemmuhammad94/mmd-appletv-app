import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { rs } from '../../theme/responsive';
import PlayButton from '../../../assets/icons/play_button.svg';
import FileIcon from '../../../assets/icons/file.svg';
import Video from 'react-native-video';
import {
  resolveVimeoUrl,
  fetchVimeoThumbnail,
} from '../../utils/resolveVimeoUrl';
import { useStudentSettingsStore } from '../../store/useStudentSettingsStore';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  progressText: string;
  image?: ImageSourcePropType | string;
  /** Vimeo/direct URL — used to auto-resolve thumbnail and play preview on focus */
  videoUrl?: string;
  onContinuePress: () => void;
  withBackground?: boolean;
  /** Focusable (e.g. Curriculum tab) that UP should target from the banner. */
  nextFocusUp?: any;
  /** Fires true on focus, false on blur — parent uses it to wire imperative
   * UP-key handling (e.g. jump to the Curriculum tab). */
  onFocusChange?: (focused: boolean) => void;
}

const PREVIEW_DELAY_MS = 600;

const isPlayableVideo = (url?: string) =>
  !!url &&
  (url.includes('vimeo') || url.includes('.mp4') || url.includes('.m3u8'));

export const HeroSection = forwardRef<any, HeroSectionProps>(
  (
    {
      title,
      subtitle,
      progressText,
      image,
      videoUrl,
      onContinuePress,
      nextFocusUp,
      onFocusChange,
    },
    ref,
  ) => {
    const autoplayVideos = useStudentSettingsStore(s => s.autoplayVideos);
    const autoplaySound = useStudentSettingsStore(s => s.autoplaySound);
    const [isFocused, setIsFocused] = useState(false);
    const [resolvedThumb, setResolvedThumb] = useState<string | null>(null);
    const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(
      null,
    );
    const [showPreview, setShowPreview] = useState(false);
    const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMounted = useRef(true);

    const isVideo = isPlayableVideo(videoUrl);

    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    useEffect(() => {
      if (!isVideo || !videoUrl) return;
      fetchVimeoThumbnail(videoUrl).then(thumb => {
        if (thumb && isMounted.current) {
          setResolvedThumb(thumb);
        }
      });
    }, [isVideo, videoUrl]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      onFocusChange?.(true);
      if (isVideo && videoUrl && autoplayVideos) {
        previewTimer.current = setTimeout(async () => {
          let previewUrl = resolvedVideoUrl;
          if (!previewUrl) {
            previewUrl = await resolveVimeoUrl(videoUrl);
            if (previewUrl && isMounted.current) {
              setResolvedVideoUrl(previewUrl);
            }
          }
          if (previewUrl && isMounted.current) {
            setShowPreview(true);
          }
        }, PREVIEW_DELAY_MS);
      }
    }, [isVideo, videoUrl, resolvedVideoUrl, autoplayVideos, onFocusChange]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      onFocusChange?.(false);
      if (previewTimer.current) {
        clearTimeout(previewTimer.current);
        previewTimer.current = null;
      }
    }, [onFocusChange]);

    const imageSource: ImageSourcePropType | null = resolvedThumb
      ? { uri: resolvedThumb }
      : typeof image === 'string'
      ? { uri: image }
      : image ?? null;

    return (
      <Pressable
        ref={ref}
        onPress={onContinuePress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        nextFocusUp={nextFocusUp}
        style={[styles.container, isFocused && styles.containerFocused]}
      >
        <View style={styles.inner}>
          {/* Static thumbnail — full width, top-aligned, 16:9 aspect.
              Overflows bottom of the container (height rs(600)) and gets
              clipped by overflow:hidden on styles.container. */}
          {imageSource && (
            <Image
              source={imageSource}
              style={styles.heroMedia}
              resizeMode="cover"
            />
          )}

          {/* Hover-to-play preview replaces the thumbnail at the same size. */}
          {showPreview && resolvedVideoUrl && (
            <Video
              source={{ uri: resolvedVideoUrl }}
              style={styles.heroMedia}
              muted={!autoplaySound}
              repeat={true}
              resizeMode="cover"
              controls={false}
            />
          )}

          <View style={styles.contentOverlay}>
            <View style={styles.infoContainer}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
              <Text style={styles.progressText}>{progressText}</Text>

              {/* Continue Training — visual-only cue (not a separate focus
                 target). Mirrors the banner's focus state so users see
                 "pressing OK continues training" without splitting focus. */}
              <View
                style={[
                  styles.continueBtn,
                  isFocused && styles.continueBtnFocused,
                ]}
                pointerEvents="none"
              >
                <Text style={styles.continueBtnText}>Continue Training</Text>
              </View>
              <Text style={styles.restartLink}>Restart Learning</Text>
            </View>

            {!showPreview && (
              <View style={styles.playButtonContainer} pointerEvents="none">
                {isVideo ? (
                  <PlayButton width={rs(120)} height={rs(120)} />
                ) : (
                  <FileIcon width={rs(120)} height={rs(120)} />
                )}
              </View>
            )}
          </View>

          <View style={styles.gradientOverlay} />
        </View>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: rs(600),
    marginBottom: rs(40),
    overflow: 'hidden',
  },
  containerFocused: {
    borderWidth: 4,
    borderColor: '#4A90E2',
  },
  inner: {
    flex: 1,
  },
  heroMedia: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    aspectRatio: 16 / 9,
  },
  contentOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(60),
    paddingTop: rs(120),
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
    shadowColor: '#000',
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
  continueBtn: {
    paddingVertical: rs(18),
    paddingHorizontal: rs(40),
    borderRadius: rs(12),
    alignSelf: 'flex-start',
    marginBottom: rs(20),
    backgroundColor: '#4A90E2',
    borderWidth: 4,
    borderColor: 'transparent',
  },
  continueBtnFocused: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: rs(26),
    fontWeight: 'bold',
  },
  restartLink: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: rs(20),
  },
});
