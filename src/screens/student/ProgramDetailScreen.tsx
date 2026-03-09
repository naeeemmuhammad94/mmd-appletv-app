import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ImageBackground,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
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
import { StudyContentItem, StudySubCategory } from '../../types/study';

type ProgramDetailRouteProp = RouteProp<StudentStackParamList, 'ProgramDetail'>;
type ProgramDetailNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'ProgramDetail'>;

const ProgramDetailScreen: React.FC = () => {
    const navigation = useNavigation<ProgramDetailNavigationProp>();
    const route = useRoute<ProgramDetailRouteProp>();
    const { theme } = useTheme();
    const { id, type } = route.params;

    const { categories, programs, fetchStudyContent, fetchSubCategories, subCategories, clearError } = useStudyStore();
    const [programContent, setProgramContent] = React.useState<StudyContentItem[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Default to the first program if viewing a category
    const [selectedProgramId, setSelectedProgramId] = React.useState<string | null>(
        type === 'category' && programs.length > 0 ? programs[0]._id : null
    );

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

    // Get the category image when type is 'category'
    const categoryImage = React.useMemo(() => {
        if (type === 'category') {
            const cat = categories.find(c => c._id === id);
            return cat?.image;
        }
        return undefined;
    }, [type, id, categories]);

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
            if (type === 'category' && programs.length > 0 && !selectedProgramId) return;

            setLoading(true);
            try {
                if (type === 'category') {
                    // Fetch content for this category filtered by the selected program
                    await Promise.all([
                        fetchStudyContent({
                            categoryIds: [id],
                            programIds: selectedProgramId ? [selectedProgramId] : undefined
                        }),
                        fetchSubCategories(id),
                    ]);
                } else {
                    // Fetch content for this program
                    await fetchStudyContent({ programIds: [id] });
                }
                const { contentItems, subCategories: allSubCats } = useStudyStore.getState();
                setProgramContent(contentItems);

                // Debug logging
                console.log('[ProgramDetail] type:', type, 'id:', id, 'selectedProgram:', selectedProgramId);
                console.log('[ProgramDetail] contentItems loaded:', contentItems.length);
                if (contentItems.length > 0) {
                    console.log('[ProgramDetail] First item programs:', JSON.stringify(contentItems[0].programs?.map(p => p.name)));
                }
            } catch (err) {
                console.error("Failed to load program content", err);
            } finally {
                setLoading(false);
            }
        };

        loadContent();

        return () => clearError();
    }, [id, type, selectedProgramId, programs.length]);

    // Group content into sections
    const sections = React.useMemo(() => {
        if (programContent.length === 0) return [];

        if (type === 'category' && currentSubCategories.length > 0) {
            // Group by sub-category
            const grouped: Record<string, { name: string; items: StudyContentItem[] }> = {};
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

                return Object.keys(tagGrouped).sort().map(tag => ({
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
    const useFlatGrid = type === 'category' && sections.length === 0 && programContent.length > 0;

    // Hero Title: use the first video's title if available, otherwise fallback to the category/program name
    const heroTitle = programContent[0]?.title || displayName;

    // Hero image: first item's stripe image, category image, or fallback
    const heroImage = {
        uri: programContent[0]?.ranks?.[0]?.stripeImage
            || categoryImage
            || 'https://via.placeholder.com/1000'
    };

    const handlePlayPress = (item?: StudyContentItem) => {
        const targetItem = item || programContent[0];

        if (targetItem?.contentLink && (targetItem.contentLink.includes('vimeo') || targetItem.contentLink.includes('mp4') || targetItem.contentLink.includes('m3u8'))) {
            navigation.navigate('VideoPlayer', {
                videoUrl: targetItem.contentLink,
                title: targetItem.title,
                contentId: targetItem._id,
            });
        } else {
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

    const renderTierSection = (tier: { name: string; description: string; lessons: StudyContentItem[]; locked: boolean }, index: number) => (
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

    const renderFlatGrid = () => (
        <View style={styles.flatGridContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.lessonRow}
            >
                {programContent.map((lesson) => (
                    <LessonCard
                        key={lesson._id}
                        title={lesson.title}
                        image={{ uri: lesson.ranks?.[0]?.stripeImage || 'https://via.placeholder.com/380x240' }}
                        locked={false}
                        lockMessage=""
                        onPress={() => handlePlayPress(lesson)}
                    />
                ))}
            </ScrollView>
        </View>
    );

    const renderProgramChips = () => {
        if (type !== 'category' || programs.length === 0) return null;

        return (
            <View style={styles.chipsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsContainer}
                >
                    {programs.map(program => {
                        const isSelected = program._id === selectedProgramId;
                        return (
                            <TouchableOpacity
                                key={program._id}
                                onPress={() => setSelectedProgramId(program._id)}
                                style={[
                                    styles.chip,
                                    isSelected && styles.chipSelected
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.chipText,
                                    isSelected && styles.chipTextSelected
                                ]}>
                                    {program.name.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

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

                            {/* Title */}
                            <Text style={styles.categoryLabel}>
                                {heroTitle}
                            </Text>
                        </View>
                    </ImageBackground>
                </View>

                {/* Program Filter Chips (Category View Only) */}
                {renderProgramChips()}

                {/* Content Sections */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : programContent.length === 0 ? (
                    <View style={styles.emptyContentContainer}>
                        <Text style={styles.emptyContentText}>
                            {type === 'category'
                                ? "No lessons found for this program in this training area."
                                : "No lessons found."}
                        </Text>
                    </View>
                ) : (
                    useFlatGrid
                        ? renderFlatGrid()
                        : sections.map((tier, index) => renderTierSection(tier, index))
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
    emptyContentContainer: {
        padding: rs(60),
        alignItems: 'center',
    },
    loadingContainer: {
        padding: rs(60),
        alignItems: 'center',
    },
    emptyContentText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: rs(24),
        textAlign: 'center',
    },
    // Program Chips
    chipsWrapper: {
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
    chipSelected: {
        backgroundColor: '#007AFF', // Standard iOS/tvOS blue highlight
        borderColor: '#007AFF',
    },
    chipText: {
        color: 'white',
        fontSize: rs(20),
        fontWeight: '600',
    },
    chipTextSelected: {
        color: 'white',
    },
    // Hero
    heroWrapper: {
        marginHorizontal: 0,
        borderRadius: 0,
        overflow: 'hidden',
        height: rs(480),
        marginBottom: rs(40),
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
    // Flat grid fallback
    flatGridContainer: {
        marginTop: rs(20),
        paddingHorizontal: rs(60),
    },
});

export default ProgramDetailScreen;
