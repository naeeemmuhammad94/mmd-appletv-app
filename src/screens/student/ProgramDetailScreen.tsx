import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ImageBackground,
    TouchableOpacity,
    Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { LessonCard } from '../../components/student/LessonCard';
import BackIcon from '../../../assets/icons/back-icon.svg';
import PlayButton from '../../../assets/icons/play_button.svg';
import { useStudyStore } from '../../store/useStudyStore';
import { StudyContentItem } from '../../types/study';
import { ActivityIndicator } from 'react-native';

type ProgramDetailRouteProp = RouteProp<StudentStackParamList, 'ProgramDetail'>;
type ProgramDetailNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'ProgramDetail'>;

const ProgramDetailScreen: React.FC = () => {
    const navigation = useNavigation<ProgramDetailNavigationProp>();
    const route = useRoute<ProgramDetailRouteProp>();
    const { theme } = useTheme();
    const { programId } = route.params;

    // We'll treat programId as categoryId
    const { categories, fetchStudyContent, clearError } = useStudyStore();
    const [programContent, setProgramContent] = React.useState<StudyContentItem[]>([]);
    const [loading, setLoading] = React.useState(true);

    const category = React.useMemo(() => categories.find(c => c._id === programId), [categories, programId]);

    React.useEffect(() => {
        const loadContent = async () => {
            setLoading(true);
            try {
                // Dojo app fetches by category
                await fetchStudyContent({ categoryIds: [programId], limit: 100, page: 1 });
                // Grab the fresh content
                const { contentItems } = useStudyStore.getState();
                setProgramContent(contentItems);
            } catch (err) {
                console.error("Failed to load program content", err);
            } finally {
                setLoading(false);
            }
        };

        loadContent();

        return () => clearError();
    }, [programId]);

    // Group items by tags to create dynamic tiers
    const tiers = React.useMemo(() => {
        const grouped: Record<string, StudyContentItem[]> = {};
        const noTags: StudyContentItem[] = [];

        programContent.forEach(item => {
            if (item.tags && item.tags.length > 0) {
                // tags is an array of StudyTag objects, so we need to access .name
                const primaryTag = item.tags[0].name || 'Uncategorized';
                if (!grouped[primaryTag]) {
                    grouped[primaryTag] = [];
                }
                grouped[primaryTag].push(item);
            } else {
                noTags.push(item);
            }
        });

        const generatedTiers = Object.keys(grouped).map(tag => ({
            name: tag,
            description: `${grouped[tag].length} Lessons`,
            lessons: grouped[tag],
            locked: false,
        }));

        if (noTags.length > 0) {
            generatedTiers.push({
                name: 'Other Lessons',
                description: `${noTags.length} Lessons`,
                lessons: noTags,
                locked: false,
            });
        }

        // Sort tiers by name (Basic/Beginner usually sorts first alphabetically or by custom order if needed)
        return generatedTiers.sort((a, b) => a.name.localeCompare(b.name));
    }, [programContent]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!category || programContent.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Program content not found</Text>
            </View>
        );
    }

    // Use the first item's image as hero, or fall back to category image
    const heroImage = { uri: programContent[0]?.ranks?.[0]?.stripeImage || category.image || 'https://via.placeholder.com/1000' };

    const handlePlayPress = (item?: StudyContentItem) => {
        // If a specific item is passed, play that
        const targetItem = item || programContent[0];

        // Let's assume contentLink is a video if it's Vimeo or mp4/m3u8
        // For docs like PDFs or other unsupported content, show an alert
        if (targetItem?.contentLink && (targetItem.contentLink.includes('vimeo') || targetItem.contentLink.includes('mp4') || targetItem.contentLink.includes('m3u8'))) {
            navigation.navigate('VideoPlayer', {
                videoUrl: targetItem.contentLink,
                title: targetItem.title,
            });
        } else {
            // Handle PDF or other non-video content unsupported on TVOS
            Alert.alert(
                "Unsupported Content",
                "Documents and interactive WebViews are not natively supported on Apple TV. Please view this content on the mobile app or web portal.",
                [{ text: "OK", style: "cancel" }]
            );
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const renderTierSection = (tier: { name: string, description: string, lessons: StudyContentItem[], locked: boolean }, index: number) => (
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
                        key={lesson._id}
                        title={lesson.title}
                        image={{ uri: lesson.ranks?.[0]?.stripeImage || 'https://via.placeholder.com/380x240' }}
                        locked={tier.locked}
                        lockMessage=""
                        onPress={tier.locked ? undefined : () => handlePlayPress(lesson)}
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
                                onPress={() => handlePlayPress()}
                                style={styles.centerPlay}
                            >
                                <PlayButton width={rs(72)} height={rs(72)} />
                            </TouchableOpacity>

                            {/* Category Title */}
                            <Text style={styles.categoryLabel}>
                                {category.name}
                            </Text>
                        </View>
                    </ImageBackground>
                </View>

                {/* Tier Sections */}
                {tiers.map((tier, index) => renderTierSection(tier, index))}

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
