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
import { SearchView } from '../../components/student/SearchView';

// Data & Types
import { StudyCategory } from '../../types/study';

// Assets
const BackgroundImage = require('../../../assets/images/student-background.png');

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { useStudyStore } from '../../store/useStudyStore';

type HomeScreenNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { logout } = useAuthStore();
    const { categories, trainingAreas, contentItems, fetchCategories, fetchTrainingAreas, error: studyError, loadingCategories } = useStudyStore();
    const { theme } = useTheme();

    React.useEffect(() => {
        fetchCategories();
        fetchTrainingAreas();
    }, []);

    React.useEffect(() => {
        console.log('[HomeScreen] categories:', categories.length, 'trainingAreas:', trainingAreas.length, 'contentItems:', contentItems.length, 'error:', studyError);
    }, [categories, trainingAreas, contentItems, studyError]);

    // State for View Switching
    const [currentTab, setCurrentTab] = React.useState<'Curriculum' | 'Announcements' | 'Search'>('Curriculum');

    // Search State
    const [isSearchActive, setIsSearchActive] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    // Filtered Data
    const filteredPrograms = React.useMemo(() => {
        if (!searchQuery) return categories;
        return categories.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, categories]);

    // Unique Training Area Tags from Content Items
    const uniqueTags = React.useMemo(() => {
        const tagsMap = new Map<string, any>();
        contentItems.forEach(item => {
            if (item.tags) {
                item.tags.forEach(tag => {
                    if (!tagsMap.has(tag._id) && tag.name) {
                        tagsMap.set(tag._id, {
                            id: tag._id,
                            title: tag.name,
                            image: require('../../../assets/dummy/training-area/1.png') // Fallback image
                        });
                    }
                });
            }
        });
        return Array.from(tagsMap.values());
    }, [contentItems]);

    const handleSearchToggle = () => {
        setIsSearchActive(prev => !prev);
        if (!isSearchActive) {
            setCurrentTab('Search');
        } else {
            setCurrentTab('Curriculum');
            setSearchQuery('');
        }
    };

    const handleProgramPress = (item: StudyCategory) => {
        navigation.navigate('ProgramDetail', { programId: item._id });
    };

    const handleTrainingAreaPress = (item: any) => {
        console.log('Training Area pressed:', item.title);
    };

    // Shared Header Component
    const renderHeader = () => (
        <View style={styles.headerWrapper}>
            <HomeHeader
                onSearchPress={() => { }} // Handled via toggle now
                onTabChange={(tab) => {
                    setCurrentTab(tab);
                    if (tab !== 'Search') {
                        setIsSearchActive(false); // Close search if navigating away
                    } else {
                        // If clicking Search tab explicitly (if even possible via tabs), open drawer?
                        // Tabs are hidden when search is active, so this is only if we are on Search tab but drawer is closed.
                        setIsSearchActive(true);
                    }
                }}
                onLogout={logout}
                activeTab={currentTab}
                isSearchExpanded={isSearchActive}
                onSearchToggle={handleSearchToggle}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Absolute Background - Fixed - REMOVED per user request to not overlap sliders */}
            {/* The HeroSection handles its own background now */}

            {/* View Content */}
            {currentTab === 'Search' ? (
                <SearchView
                    ListHeaderComponent={renderHeader()}
                    data={filteredPrograms as any}
                    searchQuery={searchQuery}
                />
            ) : currentTab === 'Announcements' ? (
                <AnnouncementsView ListHeaderComponent={renderHeader()} />
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
                                title="Today's Training"
                                subtitle="Fundamental Balance & Control"
                                progressText="Videos 2 of 6"
                                onContinuePress={() => console.log('Continue Training pressed')}
                                withBackground={false}
                            />
                        </View>
                    </ImageBackground>

                    <View style={styles.contentSection}>
                        <HorizontalRow
                            title="Programs"
                            data={categories}
                            keyExtractor={(item: StudyCategory) => item._id}
                            renderItem={({ item }: { item: StudyCategory }) => (
                                <ProgramCard
                                    title={item.name}
                                    progress={0} // Can calculate this later if needed
                                    image={item.image ? { uri: item.image } : require('../../../assets/dummy/programs/1.png')}
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
                                    image={item.image ? { uri: item.image } : require('../../../assets/dummy/training-area/1.png')}
                                    onPress={() => handleTrainingAreaPress(item)}
                                />
                            )}
                        />

                        {contentItems && contentItems.length > 0 && (
                            <HorizontalRow
                                title="Recently Watched"
                                data={contentItems.slice(0, 10)}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                    <ProgramCard
                                        title={item.title}
                                        progress={0}
                                        image={item.ranks && item.ranks[0]?.stripeImage ? { uri: item.ranks[0].stripeImage } : require('../../../assets/dummy/programs/2.png')}
                                        onPress={() => console.log('Recent play')}
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

