import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useTVEventHandler,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

// Components
import { HomeHeader } from '../../components/student/HomeHeader';
import { HeroSection } from '../../components/student/HeroSection';
import { HorizontalRow } from '../../components/ui/HorizontalRow';
import { ProgramCard } from '../../components/ui/ProgramCard';
import { TrainingAreaCard } from '../../components/ui/TrainingAreaCard';
// Data & Types
import { StudyCategory, StudyProgram } from '../../types/study';

import { useNavigation } from '@react-navigation/native';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { useStudyStore } from '../../store/useStudyStore';
import { useWatchHistoryStore } from '../../store/useWatchHistoryStore';
import { StudyContentItem } from '../../types/study';
import { useVimeoThumbnails } from '../../hooks/useVimeoThumbnails';
import { openContent } from '../../utils/openContent';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  StudentStackParamList,
  'Home'
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {
    programs,
    trainingAreas,
    contentItems,
    loadingPrograms,
    loadingTrainingAreas,
    fetchCategories,
    fetchPrograms,
    fetchTrainingAreas,
  } = useStudyStore();
  const { history, loadHistory } = useWatchHistoryStore();
  useTheme();

  useExitConfirmation();

  const [dataReady, setDataReady] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchPrograms(),
      fetchTrainingAreas(),
    ]).finally(() => setDataReady(true));
    loadHistory();
  }, [fetchCategories, fetchPrograms, fetchTrainingAreas, loadHistory]);

  const recentlyWatched = React.useMemo(() => {
    if (!contentItems || contentItems.length === 0) return [];
    return history
      .map(h => contentItems.find(c => c._id === h.contentId))
      .filter(Boolean)
      .slice(0, 10) as StudyContentItem[];
  }, [history, contentItems]);

  // Fetch Vimeo thumbnails for items with no stripeImage
  const vimeoThumbnails = useVimeoThumbnails(recentlyWatched);

  // Hero item: the most recent watched item, or the first playable video
  // from the catalog. recentlyWatched is already video-only — non-video
  // content isn't pushed to history (see VimeoPlayerScreen guard) — so we
  // only need to filter when falling back to contentItems.
  const heroItem = React.useMemo(() => {
    if (recentlyWatched.length > 0) return recentlyWatched[0];
    return (
      contentItems?.find(
        c =>
          !!c.contentLink &&
          (c.contentLink.includes('vimeo') ||
            c.contentLink.includes('.mp4') ||
            c.contentLink.includes('.m3u8')),
      ) || null
    );
  }, [recentlyWatched, contentItems]);

  const handleProgramPress = (item: StudyProgram) => {
    navigation.navigate('ProgramDetail', { id: item._id, type: 'program' });
  };

  const handleTrainingAreaPress = (item: StudyCategory) => {
    navigation.navigate('ProgramDetail', { id: item._id, type: 'category' });
  };

  const handlePlayContent = (item: StudyContentItem) => {
    openContent(navigation, item);
  };

  const handleTabChange = (tab: 'Curriculum' | 'Announcements') => {
    if (tab === 'Announcements') {
      navigation.navigate('Announcements');
    }
  };

  // --- Spatial navigation refs ---
  // curriculumTabRef → the Curriculum tab in the sticky header. We hop
  //   to it imperatively via requestTVFocus when the banner is focused
  //   and UP is pressed; declarative nextFocusUp gets overridden by the
  //   TVFocusGuideView autoFocus wrapping the tabs, which restores the
  //   last-focused tab (often not Curriculum).
  // heroRef → the hero banner. UP target of Programs row card 0.
  // first{Program,Training}CardRef → index-0 card of each row (used by the
  //   row below as its UP target). refsReady forces one re-render after
  //   mount so `.current` is populated before we read it.
  const curriculumTabRef = React.useRef<any>(null);
  const heroRef = React.useRef<any>(null);
  const firstProgramCardRef = React.useRef<any>(null);
  const firstTrainingCardRef = React.useRef<any>(null);
  const [refsReady, setRefsReady] = React.useState(false);
  React.useEffect(() => setRefsReady(true), []);

  // Track banner focus + intercept UP to imperatively focus the Curriculum
  // tab. requestTVFocus bypasses TVFocusGuideView's autoFocus memory, which
  // would otherwise restore whichever header item was last touched.
  // Timestamp of when the banner gained focus. The TV-event handler only
  // jumps to Curriculum if the banner has been focused for >300 ms, which
  // reliably distinguishes a deliberate UP-press from the same UP keypress
  // that moved focus to the banner (the full focus-transition+event sequence
  // completes in <50 ms, so setTimeout(fn,0) is not safe here).
  const bannerFocusedAt = React.useRef<number | null>(null);
  useTVEventHandler(evt => {
    if (
      (evt?.eventType === 'up' || evt?.eventType === 'swipeUp') &&
      bannerFocusedAt.current !== null &&
      Date.now() - bannerFocusedAt.current > 300
    ) {
      curriculumTabRef.current?.requestTVFocus?.();
    }
  });

  return (
    <View style={styles.container}>
      {/* Sticky header — sits above the scroll content so it remains visible
           as the user scrolls down. Previously the header was overlaid on the
           hero inside the ScrollView, which hid it on scroll. */}
      <View style={styles.stickyHeader}>
        <HomeHeader
          onTabChange={handleTabChange}
          activeTab="Curriculum"
          curriculumTabRef={curriculumTabRef}
        />
      </View>

      {/* Curriculum View */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — spinner during initial data load; real hero once ready */}
        {!dataReady ? (
          <View style={styles.heroLoader}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <HeroSection
            ref={heroRef}
            title="Continue Watching"
            subtitle={heroItem ? heroItem.title : 'Start Learning'}
            progressText={heroItem?.category?.name || ''}
            videoUrl={heroItem?.contentLink}
            onContinuePress={() => heroItem && handlePlayContent(heroItem)}
            onFocusChange={focused => {
              bannerFocusedAt.current = focused ? Date.now() : null;
            }}
          />
        )}

        <View style={styles.contentSection}>
          <HorizontalRow
            title="Programs"
            data={programs}
            loading={loadingPrograms}
            emptyMessage="No programs available"
            keyExtractor={(item: StudyProgram) => item._id}
            firstCardRef={firstProgramCardRef}
            renderItem={({
              item,
              index,
              cardRef,
            }: {
              item: StudyProgram;
              index: number;
              cardRef?: React.Ref<any>;
            }) => (
              <ProgramCard
                ref={index === 0 ? cardRef : undefined}
                title={item.name}
                variant="text-only"
                onPress={() => handleProgramPress(item)}
                nextFocusUp={refsReady ? heroRef.current : undefined}
              />
            )}
          />

          <HorizontalRow
            title="Training Area"
            data={trainingAreas}
            loading={loadingTrainingAreas}
            emptyMessage="No training areas available"
            keyExtractor={(item: StudyCategory) => item._id}
            firstCardRef={firstTrainingCardRef}
            renderItem={({
              item,
              index,
              cardRef,
            }: {
              item: StudyCategory;
              index: number;
              cardRef?: React.Ref<any>;
            }) => (
              <TrainingAreaCard
                ref={index === 0 ? cardRef : undefined}
                title={item.name}
                variant="text-only"
                onPress={() => handleTrainingAreaPress(item)}
                nextFocusUp={
                  index === 0 && refsReady
                    ? firstProgramCardRef.current
                    : undefined
                }
              />
            )}
          />

          {recentlyWatched.length > 0 && (
            <HorizontalRow
              title="Recently Watched"
              data={recentlyWatched}
              keyExtractor={(item: StudyContentItem) => item._id}
              renderItem={({
                item,
                index,
                cardRef,
              }: {
                item: StudyContentItem;
                index: number;
                cardRef?: React.Ref<any>;
              }) => {
                const entry = history.find(h => h.contentId === item._id);
                return (
                  <ProgramCard
                    ref={index === 0 ? cardRef : undefined}
                    title={item.title}
                    progress={entry?.progressPercent ?? 0}
                    previewUrl={item.contentLink}
                    image={{
                      uri:
                        vimeoThumbnails[item._id] ||
                        item.ranks?.[0]?.stripeImage ||
                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                    }}
                    onPress={() => handlePlayContent(item)}
                    nextFocusUp={
                      index === 0 && refsReady
                        ? firstTrainingCardRef.current
                        : undefined
                    }
                  />
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  stickyHeader: {
    // Fixed at top above the ScrollView. The glass pill already has its own
    // dark translucent background so the hero image behind the ScrollView
    // remains readable underneath as it scrolls.
    width: '100%',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: rs(50),
  },
  contentSection: {
    paddingTop: rs(20),
  },
  heroLoader: {
    height: rs(600),
    marginBottom: rs(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
