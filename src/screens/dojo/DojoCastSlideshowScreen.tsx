import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Animated,
  Image,
  TVFocusGuideView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { rs, wp } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { useDojoCastStore } from '../../store/useDojoCastStore';
import { DojoStackParamList } from '../../navigation';
import Logo from '../../../assets/icons/logo.svg';
import { useDojoSettingsStore } from '../../store/useDojoSettingsStore';
import { useDojoCastSlides } from '../../hooks/useDojoCastSlides';
import { getSlidePreviewUrl } from '../../utils/slideUtils';

type Nav = NativeStackNavigationProp<DojoStackParamList, 'Slideshow'>;

const DojoCastSlideshowScreen = () => {
  const navigation = useNavigation<Nav>();
  const {
    isPlaying,
    currentSlideIndex,
    setPlaying,
    nextSlide,
    prevSlide,
    setConnectionStatus,
  } = useDojoCastStore();

  const { autoAdvance, slideDuration, rotation } = useDojoSettingsStore();
  const { data: slidesResponse, isLoading: slidesLoading } =
    useDojoCastSlides();
  const apiSlides = useMemo(
    () =>
      [...(slidesResponse?.data?.items ?? [])].sort(
        (a, b) => a.order - b.order,
      ),
    [slidesResponse],
  );

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slidesLengthRef = useRef(apiSlides.length);

  useEffect(() => {
    slidesLengthRef.current = apiSlides.length;
  }, [apiSlides.length]);

  const currentSlide = apiSlides[currentSlideIndex] ?? null;
  const currentImageUrl = currentSlide
    ? getSlidePreviewUrl(currentSlide.url)
    : null;

  // Start playing on mount
  useEffect(() => {
    setPlaying(true);
    return () => {
      setPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [setPlaying]);

  const animateTransition = useCallback(
    (callback: () => void) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        callback();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim],
  );

  // Auto-advance slides
  useEffect(() => {
    if (isPlaying && autoAdvance) {
      timerRef.current = setInterval(() => {
        const total = slidesLengthRef.current;
        if (total > 0) {
          animateTransition(() => nextSlide(total));
        }
      }, slideDuration * 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, autoAdvance, slideDuration, nextSlide, animateTransition]);

  const handlePlayPause = () => {
    setPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (slidesLengthRef.current > 0) {
      animateTransition(() => nextSlide(slidesLengthRef.current));
    }
  };

  const handlePrev = () => {
    if (slidesLengthRef.current > 0) {
      animateTransition(() => prevSlide(slidesLengthRef.current));
    }
  };

  const handleExitSetup = () => {
    setConnectionStatus('disconnected');
    setPlaying(false);
    navigation.popToTop();
  };

  const handleChangeProgram = () => {
    setPlaying(false);
    navigation.navigate('Setup');
  };

  // Empty / loading guard — don't show blank controls when no slides
  if (slidesLoading || apiSlides.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        {slidesLoading ? (
          <ActivityIndicator size="large" color="#4A90E2" />
        ) : (
          <>
            <Text style={styles.emptyText}>No slides available</Text>
            <TVFocusGuideView autoFocus style={{ marginTop: rs(24) }}>
              <FocusableCard
                onPress={() => navigation.goBack()}
                style={styles.pausedButton}
                focusedStyle={styles.pausedButtonFocused}
                wrapperStyle={{ flex: 0 }}
                scaleOnFocus={true}
              >
                {() => <Text style={styles.pausedButtonText}>Go Back</Text>}
              </FocusableCard>
            </TVFocusGuideView>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Slide content */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: fadeAnim, transform: [{ rotate: `${rotation}deg` }] },
        ]}
      >
        {currentImageUrl ? (
          <ImageBackground
            source={{ uri: currentImageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          >
            <View style={styles.slideOverlay} />
          </ImageBackground>
        ) : currentSlide?.url.includes('canva.com') ? (
          <View style={[StyleSheet.absoluteFill, styles.canvaPlaceholder]}>
            <Text style={styles.canvaPlaceholderTitle}>
              {currentSlide.label}
            </Text>
            <Text style={styles.canvaPlaceholderSub}>Canva Presentation</Text>
          </View>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.slidePlaceholder]}>
            <Text style={styles.slidePlaceholderText}>
              {currentSlide?.label ?? ''}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Paused overlay — "Exit Dojo Setup" + "Change Program" buttons */}
      {!isPlaying && (
        <View style={styles.pausedOverlay}>
          <View style={styles.pausedContent}>
            <Text style={styles.pausedTitle}>Paused</Text>
            <View style={styles.pausedButtonRow}>
              <FocusableCard
                onPress={handleExitSetup}
                style={styles.pausedButton}
                focusedStyle={styles.pausedButtonFocused}
                wrapperStyle={{ flex: 0 }}
                scaleOnFocus={true}
              >
                {() => (
                  <Text style={styles.pausedButtonText}>Exit Dojo Setup</Text>
                )}
              </FocusableCard>

              <FocusableCard
                onPress={handleChangeProgram}
                style={styles.pausedButtonOutline}
                focusedStyle={styles.pausedButtonOutlineFocused}
                wrapperStyle={{ flex: 0 }}
                scaleOnFocus={true}
              >
                {() => (
                  <Text style={styles.pausedButtonText}>Change Program</Text>
                )}
              </FocusableCard>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Controls Bar */}
      <TVFocusGuideView autoFocus style={styles.controlsBar}>
        <View style={styles.controlsCenter}>
          {/* Previous */}
          <FocusableCard
            onPress={handlePrev}
            style={styles.controlButton}
            focusedStyle={styles.controlButtonFocused}
            wrapperStyle={{
              flex: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            scaleOnFocus={true}
          >
            {() => (
              <Image
                source={require('../../../assets/icons/prev.png')}
                style={styles.controlIcon}
              />
            )}
          </FocusableCard>

          {/* Play / Pause */}
          <FocusableCard
            onPress={handlePlayPause}
            style={styles.playButton}
            focusedStyle={styles.playButtonFocused}
            wrapperStyle={{
              flex: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            scaleOnFocus={true}
          >
            {() =>
              isPlaying ? (
                <Image
                  source={require('../../../assets/icons/pause.png')}
                  style={styles.playIcon}
                />
              ) : (
                <Image
                  source={require('../../../assets/icons/play.png')}
                  style={styles.playIcon}
                />
              )
            }
          </FocusableCard>

          {/* Next */}
          <FocusableCard
            onPress={handleNext}
            style={styles.controlButton}
            focusedStyle={styles.controlButtonFocused}
            wrapperStyle={{
              flex: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            scaleOnFocus={true}
          >
            {() => (
              <Image
                source={require('../../../assets/icons/next.png')}
                style={styles.controlIcon}
              />
            )}
          </FocusableCard>
        </View>

        {/* Dojo logo (bottom-right) */}
        <View style={styles.logoContainer}>
          <Logo width={rs(48)} height={rs(48)} fill="#FFFFFF" />
        </View>
      </TVFocusGuideView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  slidePlaceholder: {
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slidePlaceholderText: {
    fontSize: rs(48),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
  },
  canvaPlaceholder: {
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    gap: rs(16),
  },
  canvaPlaceholderTitle: {
    fontSize: rs(60),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: rs(48),
  },
  canvaPlaceholderSub: {
    fontSize: rs(30),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: rs(120),
  },
  centerText: {
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  slideTitle: {
    fontSize: rs(72),
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: rs(88),
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: rs(3) },
    textShadowRadius: rs(8),
    letterSpacing: 1,
  },
  slideSubtitle: {
    fontSize: rs(36),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: rs(20),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: rs(2) },
    textShadowRadius: rs(6),
  },
  // ── Paused Overlay ──
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingBottom: rs(120),
  },
  pausedContent: {
    alignItems: 'center',
  },
  pausedTitle: {
    fontSize: rs(64),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: rs(40),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: rs(2) },
    textShadowRadius: rs(6),
  },
  pausedButtonRow: {
    flexDirection: 'row',
    gap: rs(24),
  },
  pausedButton: {
    paddingVertical: rs(22),
    paddingHorizontal: rs(44),
    borderRadius: rs(14),
    backgroundColor: '#4A7FD4',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pausedButtonFocused: {
    backgroundColor: '#5A8FE4',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    transform: [{ scale: 1.08 }],
  },
  pausedButtonOutline: {
    paddingVertical: rs(22),
    paddingHorizontal: rs(44),
    borderRadius: rs(14),
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  pausedButtonOutlineFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    transform: [{ scale: 1.08 }],
  },
  pausedButtonText: {
    fontSize: rs(28),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // ── Controls Bar ──
  controlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: rs(120),
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(48),
    zIndex: 20,
  },
  controlsCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(36),
  },
  controlButton: {
    width: rs(64),
    height: rs(64),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: rs(32),
  },
  controlButtonFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  playButton: {
    width: rs(84),
    height: rs(84),
    borderRadius: rs(42),
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonFocused: {
    backgroundColor: '#5A9FF2',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  controlIcon: {
    width: rs(40),
    height: rs(40),
  },
  playIcon: {
    width: rs(48),
    height: rs(48),
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: rs(36),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  logoContainer: {
    position: 'absolute',
    right: rs(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DojoCastSlideshowScreen;
