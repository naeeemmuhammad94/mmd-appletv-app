import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ImageBackground,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { PROGRAMS_DATA, PROGRAM_LESSONS_DATA, LessonTier } from '../../data/dummyHomeData';
import { LessonCard } from '../../components/student/LessonCard';
import BackIcon from '../../../assets/icons/back-icon.svg';
import PlayButton from '../../../assets/icons/play_button.svg';

type ProgramDetailRouteProp = RouteProp<StudentStackParamList, 'ProgramDetail'>;
type ProgramDetailNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'ProgramDetail'>;

const ProgramDetailScreen: React.FC = () => {
    const navigation = useNavigation<ProgramDetailNavigationProp>();
    const route = useRoute<ProgramDetailRouteProp>();
    const { theme } = useTheme();
    const { programId } = route.params;

    // Look up program data
    const program = PROGRAMS_DATA.find((p) => p.id === programId);
    const lessonData = PROGRAM_LESSONS_DATA[programId];

    if (!program || !lessonData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Program not found</Text>
            </View>
        );
    }

    // Use the first unlocked lesson image as hero, or fall back to program image
    const heroImage =
        lessonData.tiers[0]?.lessons[0]?.image || program.image;

    const handlePlayPress = () => {
        if (program.videoUrl) {
            navigation.navigate('VideoPlayer', {
                videoUrl: program.videoUrl,
                title: program.title,
            });
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const renderTierSection = (tier: LessonTier, index: number) => (
        <View key={`${tier.name}-${index}`} style={styles.tierContainer}>
            {/* Tier Header */}
            <View style={styles.tierHeader}>
                <View>
                    <Text style={styles.tierTitle}>{tier.name}</Text>
                    <Text style={styles.tierDescription}>{tier.description}</Text>
                </View>
            </View>

            {/* Lesson Cards Row */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.lessonRow}
            >
                {tier.lessons.map((lesson) => (
                    <LessonCard
                        key={lesson.id}
                        title={lesson.title}
                        duration={lesson.duration}
                        image={lesson.image}
                        locked={tier.locked}
                        lockMessage={tier.lockMessage}
                        onPress={tier.locked ? undefined : handlePlayPress}
                    />
                ))}
            </ScrollView>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.heroWrapper}>
                    <ImageBackground
                        source={heroImage}
                        style={styles.heroImage}
                        imageStyle={styles.heroImageStyle}
                        resizeMode="cover"
                    >
                        {/* Dark overlay */}
                        <View style={styles.heroOverlay}>
                            {/* Back Button */}
                            <TouchableOpacity
                                onPress={handleBackPress}
                                style={styles.backButton}
                                hasTVPreferredFocus={true}
                            >
                                <BackIcon
                                    width={rs(28)}
                                    height={rs(28)}
                                    fill="white"
                                />
                            </TouchableOpacity>

                            {/* Center Play Button */}
                            <TouchableOpacity
                                onPress={handlePlayPress}
                                style={styles.centerPlay}
                            >
                                <PlayButton width={rs(72)} height={rs(72)} />
                            </TouchableOpacity>

                            {/* Category • Subcategory */}
                            <Text style={styles.categoryLabel}>
                                {lessonData.category} • {lessonData.subcategory}
                            </Text>
                        </View>
                    </ImageBackground>
                </View>

                {/* Tier Sections */}
                {lessonData.tiers.map((tier, index) => renderTierSection(tier, index))}

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
    // Hero
    heroWrapper: {
        marginHorizontal: 0,
        borderRadius: 0,
        overflow: 'hidden',
        height: rs(480),
    },
    heroImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    heroImageStyle: {
        borderRadius: 0,
    },
    heroOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
        padding: rs(24),
    },
    backButton: {
        position: 'absolute',
        top: rs(20),
        left: rs(20),
        padding: rs(8),
        zIndex: 10,
    },
    centerPlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: rs(-36),
        marginLeft: rs(-36),
    },
    categoryLabel: {
        color: 'white',
        fontSize: rs(28),
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
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
});

export default ProgramDetailScreen;
