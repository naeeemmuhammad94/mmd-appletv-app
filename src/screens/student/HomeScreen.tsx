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

// Hooks
import { useStudyContent, useStudyCategories } from '../../hooks/useStudy';

// Assets
const BackgroundImage = require('../../../assets/images/student-background.png');

import { PROGRAMS_DATA, TRAINING_AREA_DATA, RECENTLY_WATCHED_DATA } from '../../data/dummyHomeData';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { logout } = useAuthStore();
    const { theme } = useTheme();

    // State for View Switching
    const [currentTab, setCurrentTab] = React.useState<'Curriculum' | 'Announcements' | 'Search'>('Curriculum');

    // Search State
    const [isSearchActive, setIsSearchActive] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    // Filtered Data
    const filteredPrograms = React.useMemo(() => {
        if (!searchQuery) return PROGRAMS_DATA;
        return PROGRAMS_DATA.filter(program =>
            program.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const handleSearchToggle = () => {
        setIsSearchActive(prev => !prev);
        if (!isSearchActive) {
            // Opening search
            setCurrentTab('Search');
        } else {
            // Closing search - User requested to go back to Curriculum
            setCurrentTab('Curriculum');
            setSearchQuery(''); // Clear query when closing
        }
    };

    const handleProgramPress = (item: any) => {
        console.log('Program pressed:', item.title);
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
                    data={filteredPrograms}
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
                    {renderHeader()}

                    <View style={styles.heroContainer}>
                        <HeroSection
                            title="Today's Training"
                            subtitle="Fundamental Balance & Control"
                            progressText="Videos 2 of 6"
                            onContinuePress={() => console.log('Continue Training pressed')}
                        />
                    </View>

                    <View style={styles.contentSection}>
                        <HorizontalRow
                            title="Programs"
                            data={PROGRAMS_DATA}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ProgramCard
                                    title={item.title}
                                    progress={item.progress}
                                    image={item.image}
                                    onPress={() => handleProgramPress(item)}
                                />
                            )}
                        />

                        <HorizontalRow
                            title="Training Area"
                            data={TRAINING_AREA_DATA}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TrainingAreaCard
                                    title={item.title}
                                    image={item.image}
                                    onPress={() => handleTrainingAreaPress(item)}
                                />
                            )}
                        />

                        <HorizontalRow
                            title="Recently Watched"
                            data={RECENTLY_WATCHED_DATA}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ProgramCard
                                    title={item.title}
                                    progress={item.progress}
                                    image={item.image}
                                    onPress={() => handleProgramPress(item)}
                                />
                            )}
                        />
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
});

export default HomeScreen;

