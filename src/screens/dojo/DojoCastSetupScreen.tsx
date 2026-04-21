import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TVFocusGuideView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { useDojoCastStore } from '../../store/useDojoCastStore';
import { DOJO_ACCOUNT } from '../../data/dojoCastData';
import { DojoStackParamList } from '../../navigation';
import { useDojoCastPlaylist } from '../../hooks/useDojoCastPlaylist';
import { useAuthStore } from '../../store/useAuthStore';
import { selectDojoId } from '../../utils/authHelpers';
import { filterAndSortDecks } from '../../utils/dojoCastFilters';

type Nav = NativeStackNavigationProp<DojoStackParamList, 'Setup'>;

// Dark karate dojo background — matches Figma's dark tone
const KARATE_BG =
  'https://images.unsplash.com/photo-1514050566906-8d077bae7046?w=1920&q=80';

const DojoCastSetupScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { selectDeck, selectedDeckId, setCurrentSlideIndex } =
    useDojoCastStore();
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const user = useAuthStore(s => s.user);
  const dojoId = useAuthStore(s => selectDojoId(s.user));
  const {
    data: playlist,
    isLoading: slidesLoading,
    isError: slidesError,
    error: slidesErrorObj,
  } = useDojoCastPlaylist(dojoId);

  const decks = useMemo(
    () => filterAndSortDecks(playlist?.data?.decks ?? []),
    [playlist],
  );
  const hasSlides = decks.length > 0;

  // TEMP DEBUG — remove before ship. Prints at every render.
  const u = user as any;

  console.log(
    '[DojoCast debug]',
    JSON.stringify(
      {
        dojoId,
        userKeys:
          user && typeof user === 'object' ? Object.keys(user).join(',') : user,
        user_dojo_id: u?.dojo?._id,
        user_dojoDetail_id: u?.dojoDetail?._id,
        user_user_dojo_id: u?.user?.dojo?._id,
        user_dojoId: u?.dojoId,
        user_id: u?._id,
        slidesLoading,
        slidesError,
        errorMsg: (slidesErrorObj as any)?.message,
        rawDeckCount: playlist?.data?.decks?.length ?? 'no-playlist',
        filteredDeckCount: decks.length,
      },
      null,
      2,
    ),
  );

  const handleDeckSelect = (deckId: string) => {
    selectDeck(deckId);
  };

  const handleStartLobby = () => {
    if (selectedDeckId) {
      setCurrentSlideIndex(0);
      navigation.navigate('Slideshow');
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      {/* Background image with dark overlay */}
      <ImageBackground
        source={{ uri: KARATE_BG }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={styles.bgOverlay} />
      </ImageBackground>

      {/* Header Bar — wrapped in TVFocusGuideView for spatial navigation */}
      <TVFocusGuideView autoFocus style={styles.header}>
        <Text style={styles.headerTitle}>Dojo Cast Setup</Text>
        <FocusableCard
          onPress={handleSettings}
          style={styles.settingsButton}
          focusedStyle={styles.settingsButtonFocused}
          wrapperStyle={{
            flex: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          scaleOnFocus={true}
        >
          {() => <Text style={styles.settingsIcon}>{'\u2699'}</Text>}
        </FocusableCard>
      </TVFocusGuideView>

      {/* Account Info */}
      <View style={styles.accountSection}>
        <Text style={styles.accountLabel}>Dojo Account</Text>
        <Text style={styles.accountName}>
          {DOJO_ACCOUNT.name} {'\u2014'} {DOJO_ACCOUNT.displayName}
        </Text>
        <View style={styles.connectionRow}>
          <View style={styles.connectionDot} />
          <Text style={styles.connectionText}>Slides connected</Text>
        </View>
      </View>

      {/* Program Selection */}
      <Text style={styles.sectionTitle}>Select Today's Lobby Program</Text>

      {/* Loading state */}
      {slidesLoading && (
        <Text style={styles.loadingText}>Loading presentations...</Text>
      )}

      {/* Error state */}
      {!slidesLoading && slidesError && (
        <Text style={styles.emptyText}>
          Could not load slides. Check connection.
        </Text>
      )}

      {/* No slides configured */}
      {!slidesLoading && !slidesError && !hasSlides && (
        <Text style={styles.emptyText}>
          No presentations available — check CRM to add or activate a deck.
        </Text>
      )}

      {/* API Slides */}
      {hasSlides && (
        <TVFocusGuideView autoFocus>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.programsRow}
            style={styles.programsScroll}
          >
            {decks.map(deck => {
              const isSelected = selectedDeckId === deck._id;
              const isFocused = focusedCardId === deck._id;
              const thumb = deck.slides[0]?.thumbnailUrl;
              const sourceLabel =
                deck.source === 'google_slides' ? 'Google Slides' : 'Canva';

              return (
                <FocusableCard
                  key={deck._id}
                  onPress={() => handleDeckSelect(deck._id)}
                  onFocus={() => setFocusedCardId(deck._id)}
                  onBlur={() =>
                    setFocusedCardId(prev => (prev === deck._id ? null : prev))
                  }
                  style={[
                    styles.programCard,
                    {
                      borderColor:
                        isSelected || isFocused
                          ? theme.colors.primary
                          : 'rgba(100, 120, 180, 0.4)',
                      borderWidth: isSelected || isFocused ? rs(3) : rs(2),
                    },
                  ]}
                  focusedStyle={{
                    borderColor: theme.colors.primary,
                    borderWidth: rs(3),
                  }}
                  wrapperStyle={{ flex: 1 }}
                  scaleOnFocus={true}
                >
                  {() => (
                    <View style={styles.programCardInner}>
                      <View style={styles.programImageArea}>
                        {thumb ? (
                          <Image
                            source={{ uri: thumb }}
                            style={StyleSheet.absoluteFill}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={[
                              StyleSheet.absoluteFill,
                              styles.thumbPlaceholder,
                            ]}
                          >
                            <Text style={styles.thumbPlaceholderText}>
                              {deck.label}
                            </Text>
                          </View>
                        )}
                        <View style={styles.programImageOverlay} />
                      </View>
                      <View style={styles.programInfo}>
                        <Text style={styles.programTitle} numberOfLines={2}>
                          {deck.label}
                        </Text>
                        <Text style={styles.programSubtitle}>
                          {sourceLabel}
                        </Text>
                        <View style={styles.programMeta}>
                          <View
                            style={[
                              styles.metaDot,
                              { backgroundColor: theme.colors.primary },
                            ]}
                          />
                          <Text style={styles.metaText}>
                            {deck.slides.length} slide
                            {deck.slides.length !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </FocusableCard>
              );
            })}
          </ScrollView>
        </TVFocusGuideView>
      )}

      {/* Start Button — only shown when slides are available */}
      {hasSlides && (
        <TVFocusGuideView autoFocus style={styles.startButtonArea}>
          <FocusableCard
            onPress={handleStartLobby}
            disabled={!selectedDeckId}
            style={[
              styles.startButton,
              {
                backgroundColor: selectedDeckId
                  ? theme.colors.primary
                  : 'rgba(74, 144, 226, 0.3)',
              },
            ]}
            focusedStyle={[
              styles.startButtonFocused,
              { backgroundColor: theme.colors.primary },
            ]}
            wrapperStyle={{ flex: 0 }}
            scaleOnFocus={true}
          >
            {() => (
              <Text style={styles.startButtonText}>Start Lobby Display</Text>
            )}
          </FocusableCard>
        </TVFocusGuideView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080C18',
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 20, 0.88)',
  },
  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(60),
    paddingTop: rs(36),
    paddingBottom: rs(24),
    backgroundColor: 'rgba(12, 16, 30, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontSize: rs(42),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  settingsButton: {
    width: rs(60),
    height: rs(60),
    borderRadius: rs(14),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  settingsIcon: {
    fontSize: rs(32),
    color: '#FFFFFF',
  },
  // ── Account Info ──
  accountSection: {
    paddingHorizontal: rs(48),
    paddingTop: rs(32),
    paddingBottom: rs(24),
    marginLeft: rs(56),
    marginTop: rs(20),
  },
  accountLabel: {
    fontSize: rs(26),
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
    marginBottom: rs(8),
  },
  accountName: {
    fontSize: rs(48),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: rs(12),
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  connectionDot: {
    width: rs(18),
    height: rs(18),
    borderRadius: rs(9),
    backgroundColor: '#4A90E2',
  },
  connectionText: {
    fontSize: rs(26),
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
  // ── Section Title ──
  sectionTitle: {
    fontSize: rs(52),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: rs(36),
    marginBottom: rs(32),
  },
  // ── Program Cards ──
  programsScroll: {
    maxHeight: rs(400),
    flexGrow: 0,
  },
  programsRow: {
    paddingHorizontal: rs(60),
    gap: rs(28),
  },
  programCard: {
    width: rs(380),
    height: rs(360),
    borderRadius: rs(16),
    overflow: 'hidden',
    backgroundColor: 'rgba(12, 18, 36, 0.85)',
  },
  programCardInner: {
    flex: 1,
  },
  programImageArea: {
    height: rs(180),
    overflow: 'hidden',
  },
  thumbPlaceholder: {
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(16),
  },
  thumbPlaceholderText: {
    fontSize: rs(28),
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
  },
  programImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  programInfo: {
    flex: 1,
    padding: rs(20),
    justifyContent: 'space-between',
  },
  programTitle: {
    fontSize: rs(28),
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: rs(36),
  },
  programSubtitle: {
    fontSize: rs(24),
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '400',
  },
  programLevel: {
    fontSize: rs(22),
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '400',
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },
  metaDot: {
    width: rs(14),
    height: rs(14),
    borderRadius: rs(7),
  },
  metaText: {
    fontSize: rs(22),
    color: 'rgba(255, 255, 255, 0.45)',
  },
  loadingText: {
    fontSize: rs(28),
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginVertical: rs(40),
  },
  emptyText: {
    fontSize: rs(28),
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginVertical: rs(40),
  },
  // ── Start Button ──
  startButtonArea: {
    paddingHorizontal: rs(60),
    paddingTop: rs(32),
    paddingBottom: rs(40),
    alignItems: 'flex-start',
  },
  startButton: {
    paddingVertical: rs(24),
    paddingHorizontal: rs(56),
    borderRadius: rs(16),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  startButtonFocused: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  startButtonText: {
    fontSize: rs(34),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DojoCastSetupScreen;
