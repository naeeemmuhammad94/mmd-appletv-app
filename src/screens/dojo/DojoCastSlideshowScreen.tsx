import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TVFocusGuideView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { rs } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { useDojoCastStore } from '../../store/useDojoCastStore';
import { DojoStackParamList } from '../../navigation';
import Logo from '../../../assets/icons/logo.svg';
import { useDojoSettingsStore } from '../../store/useDojoSettingsStore';
import { useDojoCastPlaylist } from '../../hooks/useDojoCastPlaylist';
import { useAuthStore } from '../../store/useAuthStore';
import { selectDojoId } from '../../utils/authHelpers';
import { filterAndSortDecks } from '../../utils/dojoCastFilters';

type Nav = NativeStackNavigationProp<DojoStackParamList, 'Slideshow'>;

const DojoCastSlideshowScreen = () => {
  const navigation = useNavigation<Nav>();
  const {
    isPlaying,
    currentSlideIndex,
    selectedDeckId,
    setPlaying,
    nextSlide,
    prevSlide,
    setConnectionStatus,
  } = useDojoCastStore();

  const { autoAdvance, slideDuration, rotation } = useDojoSettingsStore();

  const dojoId = useAuthStore(s => selectDojoId(s.user));
  const { data: playlist, isLoading: slidesLoading } =
    useDojoCastPlaylist(dojoId);

  const sortedSlides = useMemo(() => {
    const decks = filterAndSortDecks(playlist?.data?.decks ?? []);
    const deck = decks.find(d => d._id === selectedDeckId);
    if (!deck) return [];
    return [...deck.slides].sort((a, b) => a.slideIndex - b.slideIndex);
  }, [playlist, selectedDeckId]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slidesLengthRef = useRef(sortedSlides.length);
  const consecutiveErrorsRef = useRef(0);

  useEffect(() => {
    slidesLengthRef.current = sortedSlides.length;
  }, [sortedSlides.length]);

  const currentSlide = sortedSlides[currentSlideIndex] ?? null;

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

  // Auto-advance slides. No transition animation — slides swap instantly
  // on URI change (stock <Image> + S3 cache). A 400ms double-fade was
  // previously wrapped around every advance and (a) looked like a blink-
  // to-black and (b) required a lock that silently dropped Next clicks
  // during the 800ms window. Both issues vanish with a hard cut.
  useEffect(() => {
    if (isPlaying && autoAdvance) {
      timerRef.current = setInterval(() => {
        const total = slidesLengthRef.current;
        if (total > 0) nextSlide(total);
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
  }, [isPlaying, autoAdvance, slideDuration, nextSlide]);

  const handlePlayPause = () => {
    // TEMP DEBUG — remove before ship.

    console.log('[DojoCast] handlePlayPause fired; isPlaying was', isPlaying);
    setPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (slidesLengthRef.current > 0) {
      nextSlide(slidesLengthRef.current);
    }
  };

  const handlePrev = () => {
    if (slidesLengthRef.current > 0) {
      prevSlide(slidesLengthRef.current);
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
  if (slidesLoading || sortedSlides.length === 0) {
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
      {/* Slide content — hard cut between slides, no fade. */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ rotate: `${rotation}deg` }] },
        ]}
      >
        {currentSlide ? (
          <Image
            source={{ uri: currentSlide.imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            onLoad={() => {
              consecutiveErrorsRef.current = 0;
            }}
            onError={() => {
              consecutiveErrorsRef.current += 1;
              if (
                slidesLengthRef.current > 0 &&
                consecutiveErrorsRef.current < slidesLengthRef.current
              ) {
                nextSlide(slidesLengthRef.current);
              }
              // else: every slide errored once this cycle. We stop the
              // onError-triggered self-advance so we don't infinite-recurse; the
              // autoplay timer will keep ticking normally through broken images
              // and the operator can press Back to exit.
            }}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.slidePlaceholder]}>
            <Text style={styles.slidePlaceholderText}>No slide</Text>
          </View>
        )}
      </View>

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
      {/* NOTE: dropped `autoFocus` on this guide view — it re-asserted after
          re-renders (every slide change), causing focus to jump back to the
          center button. First FocusableCard still receives focus on mount. */}
      <TVFocusGuideView style={styles.controlsBar}>
        <View style={styles.controlsCenter}>
          {/* Previous — reuses next.png flipped horizontally because the
              repo's prev.png is literally a copy of next.png. Replace with a
              proper prev asset when available and remove the transform. */}
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
                source={require('../../../assets/icons/next.png')}
                style={[styles.controlIcon, { transform: [{ scaleX: -1 }] }]}
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
