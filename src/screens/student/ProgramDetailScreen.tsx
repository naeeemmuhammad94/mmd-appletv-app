import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  BackHandler,
  Pressable,
  findNodeHandle,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { LessonCard } from '../../components/student/LessonCard';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { EmptyState } from '../../components/ui/EmptyState';
import PlayButton from '../../../assets/icons/play_button.svg';
import FileIcon from '../../../assets/icons/file.svg';
import { useStudyStore } from '../../store/useStudyStore';
import { useWatchHistoryStore } from '../../store/useWatchHistoryStore';
import { useStudentSettingsStore } from '../../store/useStudentSettingsStore';
import { StudyContentItem, StudySubCategory } from '../../types/study';
import { useVimeoThumbnails } from '../../hooks/useVimeoThumbnails';
import Video from 'react-native-video';
import {
  resolveVimeoUrl,
  fetchVimeoThumbnail,
} from '../../utils/resolveVimeoUrl';
import { openContent } from '../../utils/openContent';
import { getMediaType } from '../../utils/getMediaType';

type ProgramDetailRouteProp = RouteProp<StudentStackParamList, 'ProgramDetail'>;
type ProgramDetailNavigationProp = NativeStackNavigationProp<
  StudentStackParamList,
  'ProgramDetail'
>;

const ProgramDetailScreen: React.FC = () => {
  const navigation = useNavigation<ProgramDetailNavigationProp>();
  const route = useRoute<ProgramDetailRouteProp>();
  const { theme } = useTheme();
  const { id, type } = route.params;

  const {
    categories,
    programs,
    fetchStudyContent,
    fetchSubCategories,
    subCategories,
    clearError,
  } = useStudyStore();
  const { history, loadHistory } = useWatchHistoryStore();
  const autoplayVideos = useStudentSettingsStore(s => s.autoplayVideos);
  const autoplaySound = useStudentSettingsStore(s => s.autoplaySound);
  const [programContent, setProgramContent] = React.useState<
    StudyContentItem[]
  >([]);
  const vimeoThumbnails = useVimeoThumbnails(programContent);
  const [loading, setLoading] = React.useState(true);

  // Hero preview state
  const [heroThumb, setHeroThumb] = React.useState<string | null>(null);
  const [heroResolvedUrl, setHeroResolvedUrl] = React.useState<string | null>(
    null,
  );
  const [showHeroPreview, setShowHeroPreview] = React.useState(false);
  const [heroFocused, setHeroFocused] = React.useState(false);
  const heroPreviewTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const heroIsMounted = React.useRef(true);

  React.useEffect(() => {
    heroIsMounted.current = true;
    return () => {
      heroIsMounted.current = false;
    };
  }, []);

  // Fetch hero thumbnail when first content item changes
  const heroContentLink = programContent[0]?.contentLink;
  const heroIsVideo =
    !!heroContentLink &&
    (heroContentLink.includes('vimeo') ||
      heroContentLink.includes('.mp4') ||
      heroContentLink.includes('.m3u8'));

  React.useEffect(() => {
    if (!heroIsVideo || !heroContentLink) return;
    fetchVimeoThumbnail(heroContentLink).then(thumb => {
      if (thumb && heroIsMounted.current) setHeroThumb(thumb);
    });
  }, [heroIsVideo, heroContentLink]);

  const handleHeroFocus = React.useCallback(() => {
    setHeroFocused(true);
    if (!heroIsVideo || !heroContentLink) return;
    // Respect the student's autoplay preference — if disabled, never trigger
    // the hover-to-play preview.
    if (!autoplayVideos) return;
    heroPreviewTimer.current = setTimeout(async () => {
      let url = heroResolvedUrl;
      if (!url) {
        url = await resolveVimeoUrl(heroContentLink);
        if (url && heroIsMounted.current) setHeroResolvedUrl(url);
      }
      if (url && heroIsMounted.current) setShowHeroPreview(true);
    }, 600);
  }, [heroIsVideo, heroContentLink, heroResolvedUrl, autoplayVideos]);

  const handleHeroBlur = React.useCallback(() => {
    setHeroFocused(false);
    if (heroPreviewTimer.current) {
      clearTimeout(heroPreviewTimer.current);
      heroPreviewTimer.current = null;
    }
    setShowHeroPreview(false);
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Spatial-navigation handles. Using callback refs + findNodeHandle so the
  // numeric reactTag is captured the moment the view attaches — avoids
  // timing races where .current isn't populated when a sibling re-renders.
  const [backHandle, setBackHandle] = React.useState<number | null>(null);
  const [firstChipHandle, setFirstChipHandle] = React.useState<number | null>(
    null,
  );
  const [goBackHandle, setGoBackHandle] = React.useState<number | null>(null);
  // State (not ref) so changing the focused chip re-renders Go Back with an
  // updated nextFocusUp — a ref mutation would never propagate to the native
  // prop after the initial render.
  const [focusedChipHandle, setFocusedChipHandle] = React.useState<
    number | null
  >(null);
  const setBackRef = React.useCallback((node: any) => {
    setBackHandle(node ? findNodeHandle(node) : null);
  }, []);
  const setFirstChipRef = React.useCallback((node: any) => {
    setFirstChipHandle(node ? findNodeHandle(node) : null);
  }, []);
  const setGoBackRef = React.useCallback((node: any) => {
    setGoBackHandle(node ? findNodeHandle(node) : null);
  }, []);

  // If programs reload mid-session, chips remount with new reactTags — the
  // captured focusedChipHandle would be stale and Go Back's nextFocusUp
  // would resolve to nothing. Reset to fall back on firstChipHandle.
  React.useEffect(() => {
    setFocusedChipHandle(null);
  }, [programs]);

  // Default to the first program if viewing a category
  const [selectedProgramId, setSelectedProgramId] = React.useState<
    string | null
  >(type === 'category' && programs.length > 0 ? programs[0]._id : null);

  // Resolve display name from the relevant store list
  const displayName = React.useMemo(() => {
    if (type === 'category') {
      const cat = categories.find(c => c._id === id);
      return cat?.name || 'Category';
    } else {
      const prog = programs.find(p => p._id === id);
      return prog?.name || 'Program';
    }
  }, [type, id, categories, programs]);

  // Sub-categories for this category (only relevant when type === 'category')
  const currentSubCategories: StudySubCategory[] = React.useMemo(() => {
    if (type === 'category' && subCategories[id]) {
      return Array.isArray(subCategories[id]) ? subCategories[id] : [];
    }
    return [];
  }, [type, id, subCategories]);

  // Make sure we have a selected program if programs lazy-load or update
  React.useEffect(() => {
    if (type === 'category' && programs.length > 0 && !selectedProgramId) {
      setSelectedProgramId(programs[0]._id);
    }
  }, [type, programs, selectedProgramId]);

  React.useEffect(() => {
    const loadContent = async () => {
      // Wait for a program to be selected if we are in category mode and have programs
      if (type === 'category' && programs.length > 0 && !selectedProgramId)
        return;

      setLoading(true);
      try {
        if (type === 'category') {
          // Fetch content for this category filtered by the selected program
          await Promise.all([
            fetchStudyContent({
              categoryIds: [id],
              programIds: selectedProgramId ? [selectedProgramId] : undefined,
            }),
            fetchSubCategories(id),
          ]);
        } else {
          // Fetch content for this program
          await fetchStudyContent({ programIds: [id] });
        }
        const { contentItems } = useStudyStore.getState();
        setProgramContent(contentItems);
      } catch (err) {
        console.error('Failed to load program content', err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();

    return () => clearError();
  }, [
    id,
    type,
    selectedProgramId,
    programs.length,
    fetchStudyContent,
    fetchSubCategories,
    clearError,
  ]);

  // Group content into sections
  const sections = React.useMemo(() => {
    if (programContent.length === 0) return [];

    if (type === 'category' && currentSubCategories.length > 0) {
      // Group by sub-category
      const grouped: Record<
        string,
        { name: string; items: StudyContentItem[] }
      > = {};
      const ungrouped: StudyContentItem[] = [];

      // Pre-fill groups in order
      currentSubCategories.forEach(sc => {
        grouped[sc._id] = { name: sc.name, items: [] };
      });

      programContent.forEach(item => {
        if (item.subCategoryId && grouped[item.subCategoryId]) {
          grouped[item.subCategoryId].items.push(item);
        } else {
          ungrouped.push(item);
        }
      });

      const result = currentSubCategories
        .filter(sc => grouped[sc._id].items.length > 0)
        .map(sc => ({
          name: grouped[sc._id].name,
          description: `${grouped[sc._id].items.length} Lessons`,
          lessons: grouped[sc._id].items,
          locked: false,
        }));

      // Append ungrouped items
      if (ungrouped.length > 0) {
        result.push({
          name: 'Other',
          description: `${ungrouped.length} Lessons`,
          lessons: ungrouped,
          locked: false,
        });
      }

      return result;
    } else if (type === 'program') {
      // Group by category name
      const grouped: Record<string, StudyContentItem[]> = {};

      programContent.forEach(item => {
        const key = item.category?.name || 'Uncategorized';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });

      const keys = Object.keys(grouped);
      if (keys.length <= 1) {
        // Only one category — try grouping by tags instead
        const tagGrouped: Record<string, StudyContentItem[]> = {};
        programContent.forEach(item => {
          const tagName = item.tags?.[0]?.name || 'Uncategorized';
          if (!tagGrouped[tagName]) tagGrouped[tagName] = [];
          tagGrouped[tagName].push(item);
        });

        return Object.keys(tagGrouped)
          .sort()
          .map(tag => ({
            name: tag,
            description: `${tagGrouped[tag].length} Lessons`,
            lessons: tagGrouped[tag],
            locked: false,
          }));
      }

      return keys.sort().map(key => ({
        name: key,
        description: `${grouped[key].length} Lessons`,
        lessons: grouped[key],
        locked: false,
      }));
    } else {
      // Category with no sub-categories — return empty to trigger flat grid
      return [];
    }
  }, [programContent, type, currentSubCategories]);

  // Use flat grid when type === 'category' and no sections could be formed
  const useFlatGrid =
    type === 'category' && sections.length === 0 && programContent.length > 0;

  // When the active filter (program × training-area) yields no lessons, skip
  // the hero entirely — it's a large olive/category-colored band with no
  // meaningful content. A slim top strip takes over to keep the back button
  // reachable and the empty-state visible below.
  const hasContent = loading || programContent.length > 0;

  // Hero image: Vimeo thumbnail > first item's stripe image. No category-image
  // or base64 fallback — those render as an olive/colored band while data is
  // loading (mirrors HomeScreen, which also returns null until a real thumb
  // resolves and conditionally renders <Image>).
  const heroImageUri =
    heroThumb || programContent[0]?.ranks?.[0]?.stripeImage || null;

  const heroImage = heroImageUri ? { uri: heroImageUri } : null;

  const handlePlayPress = (item?: StudyContentItem) => {
    const targetItem = item || programContent[0];
    if (targetItem) {
      openContent(navigation, targetItem);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Intercept Apple TV remote Menu/Back button
  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  const renderTierSection = (
    tier: {
      name: string;
      description: string;
      lessons: StudyContentItem[];
      locked: boolean;
    },
    index: number,
  ) => (
    <View key={`${tier.name}-${index}`} style={styles.tierContainer}>
      <View style={styles.tierHeader}>
        <View>
          <Text style={styles.tierTitle}>{tier.name}</Text>
          <Text style={styles.tierDescription}>{tier.description}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lessonRow}
      >
        {tier.lessons.map(lesson => {
          const entry = history.find(h => h.contentId === lesson._id);
          return (
            <LessonCard
              key={lesson._id}
              title={lesson.title}
              image={{
                uri:
                  vimeoThumbnails[lesson._id] ||
                  lesson.ranks?.[0]?.stripeImage ||
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
              }}
              locked={tier.locked}
              lockMessage=""
              progress={entry?.progressPercent ?? 0}
              previewUrl={lesson.contentLink}
              mediaType={getMediaType(lesson.contentLink)}
              onPress={tier.locked ? undefined : () => handlePlayPress(lesson)}
            />
          );
        })}
      </ScrollView>
    </View>
  );

  const renderFlatGrid = () => (
    <View style={styles.flatGridContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lessonRow}
      >
        {programContent.map(lesson => {
          const entry = history.find(h => h.contentId === lesson._id);
          return (
            <LessonCard
              key={lesson._id}
              title={lesson.title}
              image={{
                uri:
                  vimeoThumbnails[lesson._id] ||
                  lesson.ranks?.[0]?.stripeImage ||
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
              }}
              locked={false}
              lockMessage=""
              progress={entry?.progressPercent ?? 0}
              previewUrl={lesson.contentLink}
              mediaType={getMediaType(lesson.contentLink)}
              onPress={() => handlePlayPress(lesson)}
            />
          );
        })}
      </ScrollView>
    </View>
  );

  const renderProgramChips = () => {
    if (type !== 'category' || programs.length === 0) return null;

    // When the hero is hidden (empty state), chips are the first focusable
    // row in the ScrollView — wire UP to the header back button so users
    // can always escape back out.
    const chipUpOverride = !hasContent && backHandle ? backHandle : undefined;

    return (
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {programs.map((program, index) => {
            const isSelected = program._id === selectedProgramId;
            return (
              <Pressable
                key={program._id}
                ref={index === 0 ? setFirstChipRef : undefined}
                onPress={() => setSelectedProgramId(program._id)}
                onFocus={e => {
                  setFocusedChipHandle(e.nativeEvent.target);
                }}
                style={({ focused }) => [
                  styles.chip,
                  isSelected && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                  focused && styles.chipFocused,
                ]}
                nextFocusUp={chipUpOverride}
                nextFocusDown={
                  !hasContent && goBackHandle ? goBackHandle : undefined
                }
              >
                <Text style={styles.chipText}>
                  {program.name.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top header — matches the Student Settings screen: bold title on the
           left, square back button on the right, dark bar, thin divider. Lives
           outside the ScrollView so it's always visible. */}
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayName}
        </Text>
        <FocusableCard
          ref={setBackRef}
          onPress={handleBackPress}
          style={styles.backButton}
          focusedStyle={styles.backButtonFocused}
          wrapperStyle={styles.backWrapper}
          scaleOnFocus={false}
          nextFocusDown={
            !hasContent && firstChipHandle ? firstChipHandle : undefined
          }
        >
          {() => <Text style={styles.backIcon}>{'\u2190'}</Text>}
        </FocusableCard>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner — only rendered when there is content. Back button and
             title live in the dedicated header above, so the banner is a clean
             single-pressable with just the preview + play/file icon. */}
        {hasContent && (
          <Pressable
            onPress={() => handlePlayPress()}
            onFocus={handleHeroFocus}
            onBlur={handleHeroBlur}
            hasTVPreferredFocus={true}
            style={[
              styles.heroWrapper,
              heroFocused && styles.heroWrapperFocused,
            ]}
          >
            {/* Thumbnail and preview video are positioned at full width with
               a 16:9 aspect — the container is shorter, so the bottom spills
               over and gets clipped by overflow:hidden. Result: full width
               + top of frame visible (no pillar bars, no head cropped). */}
            {heroImage && (
              <Image
                source={heroImage}
                style={styles.heroMedia}
                resizeMode="cover"
              />
            )}
            {showHeroPreview && heroResolvedUrl && (
              <Video
                source={{ uri: heroResolvedUrl }}
                style={styles.heroMedia}
                muted={!autoplaySound}
                repeat={true}
                resizeMode="cover"
                controls={false}
              />
            )}

            {!showHeroPreview && !loading && (
              <View style={styles.centerIcon} pointerEvents="none">
                {heroIsVideo ? (
                  <PlayButton width={rs(72)} height={rs(72)} />
                ) : (
                  <FileIcon width={rs(72)} height={rs(72)} />
                )}
              </View>
            )}

            {loading && (
              <View style={styles.centerIcon} pointerEvents="none">
                <ActivityIndicator size="large" color="#4A90E2" />
              </View>
            )}
          </Pressable>
        )}

        {/* Program Filter Chips (Category View Only) */}
        {renderProgramChips()}

        {/* Content Sections */}
        {loading ? (
          <EmptyState
            message="Loading lessons..."
            variant="loading"
            onGoBack={() => navigation.goBack()}
            goBackLabel="Cancel"
          />
        ) : programContent.length === 0 ? (
          <View style={styles.goBackContainer}>
            <Text style={styles.emptyContentText}>
              {type === 'category'
                ? 'No lessons found for this program in this training area.'
                : 'No lessons found.'}
            </Text>
            <Pressable
              ref={setGoBackRef}
              onPress={handleBackPress}
              nextFocusUp={focusedChipHandle ?? firstChipHandle ?? undefined}
              style={styles.goBackTextWrap}
            >
              {({ focused }) => (
                <Text
                  style={[
                    styles.goBackText,
                    focused && styles.goBackTextFocused,
                  ]}
                >
                  Go Back
                </Text>
              )}
            </Pressable>
          </View>
        ) : useFlatGrid ? (
          renderFlatGrid()
        ) : (
          sections.map((tier, index) => renderTierSection(tier, index))
        )}

        {/* Bottom spacing */}
        <View style={{ height: rs(60) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: rs(40),
  },
  errorText: {
    color: 'white',
    fontSize: rs(24),
    textAlign: 'center',
    marginTop: rs(100),
  },
  emptyContentText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: rs(24),
    textAlign: 'center',
    marginBottom: rs(40),
  },
  goBackContainer: {
    padding: rs(60),
    alignItems: 'center',
  },
  goBackTextWrap: {
    paddingVertical: rs(8),
    paddingHorizontal: rs(12),
  },
  goBackText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: rs(24),
    fontWeight: '500',
  },
  goBackTextFocused: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  // Program Chips
  chipsWrapper: {
    marginTop: rs(40),
    marginBottom: rs(20),
  },
  chipsContainer: {
    paddingHorizontal: rs(60),
    gap: rs(16),
  },
  chip: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
    borderRadius: rs(40),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  // Matches homepage nav focus ring (HomeHeader.focusedItem):
  // translucent blue tint + solid blue border.
  chipFocused: {
    backgroundColor: 'rgba(74,144,226,0.5)',
    borderColor: '#4A90E2',
  },
  chipText: {
    color: 'white',
    fontSize: rs(20),
    fontWeight: '600',
  },
  // Top header — mirrors StudentSettingsScreen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(48),
    paddingVertical: rs(28),
    backgroundColor: '#0C101E',
  },
  headerTitle: {
    flex: 1,
    fontSize: rs(42),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: rs(24),
  },
  backButton: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(12),
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonFocused: {
    backgroundColor: '#4A90E2',
  },
  backWrapper: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: rs(32),
    color: '#FFFFFF',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  // Hero
  heroWrapper: {
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: 'hidden',
    height: rs(480),
    marginBottom: rs(40),
    backgroundColor: '#000',
    position: 'relative',
  },
  heroWrapperFocused: {
    borderWidth: 4,
    borderColor: '#4A90E2',
  },
  heroMedia: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    aspectRatio: 16 / 9,
  },
  centerIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: rs(-36),
    marginLeft: rs(-36),
  },
  // Tier sections
  tierContainer: {
    marginTop: rs(40),
    paddingHorizontal: rs(60),
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(16),
  },
  tierTitle: {
    color: 'white',
    fontSize: rs(30),
    fontWeight: 'bold',
    marginBottom: rs(6),
  },
  tierDescription: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: rs(20),
  },
  lessonRow: {
    paddingRight: rs(40),
  },
  // Flat grid fallback
  flatGridContainer: {
    marginTop: rs(20),
    paddingHorizontal: rs(60),
  },
});

export default ProgramDetailScreen;
