import React from 'react';
import { View, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

// Components
import { HomeHeader } from '../../components/student/HomeHeader';
import { HeroSection } from '../../components/student/HeroSection';
import { HorizontalRow } from '../../components/ui/HorizontalRow';
import { ProgramCard } from '../../components/ui/ProgramCard';
import { TrainingAreaCard } from '../../components/ui/TrainingAreaCard';
import { AnnouncementsView } from '../../components/student/AnnouncementsView';
// Data & Types
import { StudyCategory, StudyProgram } from '../../types/study';

// Assets
const BackgroundImage = require('../../../assets/images/student-background.png');

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { useStudyStore } from '../../store/useStudyStore';
import { useWatchHistoryStore } from '../../store/useWatchHistoryStore';
import { StudyContentItem } from '../../types/study';

type HomeScreenNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { logout } = useAuthStore();
    const { categories, programs, trainingAreas, contentItems, fetchCategories, fetchPrograms, fetchTrainingAreas, error: studyError, loadingCategories } = useStudyStore();
    const { history, loadHistory } = useWatchHistoryStore();
    const { theme } = useTheme();

    React.useEffect(() => {
        fetchCategories();
        fetchPrograms();
        fetchTrainingAreas();
        loadHistory();
    }, []);

    React.useEffect(() => {
        // Removed debug logging
    }, [categories, trainingAreas, contentItems, studyError]);

    // State for View Switching
    const [currentTab, setCurrentTab] = React.useState<'Curriculum' | 'Announcements'>('Curriculum');

    // Filtered Data
    const filteredPrograms = React.useMemo(() => {
        return categories;
    }, [categories]);

    const recentlyWatched = React.useMemo(() => {
        if (!contentItems || contentItems.length === 0) return [];
        return history
            .map(h => contentItems.find(c => c._id === h.contentId))
            .filter(Boolean)
            .slice(0, 10) as StudyContentItem[];
    }, [history, contentItems]);

    // Hero item logic: most recent watched OR first available content
    const heroItem = React.useMemo(() => {
        if (recentlyWatched.length > 0) {
            return recentlyWatched[0];
        }
        return contentItems && contentItems.length > 0 ? contentItems[0] : null;
    }, [recentlyWatched, contentItems]);

    const handleProgramPress = (item: StudyProgram) => {
        navigation.navigate('ProgramDetail', { id: item._id, type: 'program' });
    };

    const handleTrainingAreaPress = (item: StudyCategory) => {
        navigation.navigate('ProgramDetail', { id: item._id, type: 'category' });
    };

    const handlePlayContent = (item: StudyContentItem) => {
        if (item?.contentLink && (item.contentLink.includes('vimeo') || item.contentLink.includes('mp4') || item.contentLink.includes('m3u8'))) {
            navigation.navigate('VideoPlayer', {
                videoUrl: item.contentLink,
                title: item.title,
                contentId: item._id,
            });
        }
    };

    // Shared Header Component
    const renderHeader = () => (
        <View style={styles.headerWrapper}>
            <HomeHeader
                onTabChange={(tab) => setCurrentTab(tab)}
                onLogout={logout}
                activeTab={currentTab}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Absolute Background - Fixed - REMOVED per user request to not overlap sliders */}
            {/* The HeroSection handles its own background now */}

            {/* View Content */}
            {currentTab === 'Announcements' ? (
                <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                    {renderHeader()}
                    <View style={{ flex: 1 }}>
                        <AnnouncementsView />
                    </View>
                </View>
            ) : (
                /* Curriculum View */
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ImageBackground
                        source={BackgroundImage}
                        style={styles.headerBackground}
                        resizeMode="cover"
                    >
                        <View style={styles.backgroundOverlay} />
                        {renderHeader()}

                        <View style={styles.heroContainer}>
                            <HeroSection
                                title="Continue Watching"
                                subtitle={heroItem ? heroItem.title : "Start Learning"}
                                progressText={heroItem?.category?.name || ""}
                                onContinuePress={() => heroItem && handlePlayContent(heroItem)}
                                withBackground={false}
                            />
                        </View>
                    </ImageBackground>

                    <View style={styles.contentSection}>
                        <HorizontalRow
                            title="Programs"
                            data={programs}
                            keyExtractor={(item: StudyProgram) => item._id}
                            renderItem={({ item }: { item: StudyProgram }) => (
                                <ProgramCard
                                    title={item.name}
                                    variant="text-only"
                                    onPress={() => handleProgramPress(item)}
                                />
                            )}
                        />

                        <HorizontalRow
                            title="Training Area"
                            data={trainingAreas}
                            keyExtractor={(item: StudyCategory) => item._id}
                            renderItem={({ item }: { item: StudyCategory }) => (
                                <TrainingAreaCard
                                    title={item.name}
                                    variant="text-only"
                                    onPress={() => handleTrainingAreaPress(item)}
                                />
                            )}
                        />

                        {recentlyWatched.length > 0 && (
                            <HorizontalRow
                                title="Recently Watched"
                                data={recentlyWatched}
                                keyExtractor={(item: StudyContentItem) => item._id}
                                renderItem={({ item }: { item: StudyContentItem }) => (
                                    <ProgramCard
                                        title={item.title}
                                        progress={0}
                                        image={item.ranks && item.ranks[0]?.stripeImage ? { uri: item.ranks[0].stripeImage } : require('../../../assets/dummy/programs/2.png')}
                                        onPress={() => handlePlayContent(item)}
                                    />
                                )}
                            />
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: rs(50),
    },
    headerWrapper: {
        paddingBottom: rs(20), // Spacing below header in all views
    },
    heroContainer: {
        marginBottom: rs(20),
    },
    contentSection: {
        paddingTop: rs(20),
    },
    headerBackground: {
        width: '100%',
        // Remove fixed height, let content define it? 
        // Or set minHeight to ensure it covers enough
    },
});

export default HomeScreen;

