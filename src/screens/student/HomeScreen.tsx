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

    // Keep hooks running to verify API integration
    // const { isLoading: studyLoading } = useStudyContent({ limit: 1 });
    // const { isLoading: categoriesLoading } = useStudyCategories({ limit: 1 });

    const handleProgramPress = (item: any) => {
        console.log('Program pressed:', item.title);
    };

    const handleTrainingAreaPress = (item: any) => {
        console.log('Training Area pressed:', item.title);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <ImageBackground source={BackgroundImage} style={styles.headerBackground}>
                <View style={styles.headerOverlay}>
                    <HomeHeader
                        onSearchPress={() => navigation.navigate('Search')}
                        onTabChange={(tab) => console.log('Tab changed:', tab)}
                        onLogout={logout}
                    />

                    <HeroSection
                        title="Today's Training"
                        subtitle="Fundamental Balance & Control"
                        progressText="Videos 2 of 6"
                        onContinuePress={() => console.log('Continue Training pressed')}
                    />
                </View>
            </ImageBackground>

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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        paddingBottom: rs(50),
    },
    headerBackground: {
        width: '100%',
        // Height will be determined by content, or we can set a minHeight
    },
    headerOverlay: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingBottom: rs(40),
    },
    contentSection: {
        paddingTop: rs(20),
    },
});

export default HomeScreen;

