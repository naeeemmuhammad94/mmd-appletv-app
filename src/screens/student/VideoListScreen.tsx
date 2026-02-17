/**
 * VideoListScreen → ProgramDetailScreen
 * "Continue Training / Program Detail" Figma screen
 *
 * Shows:
 * - Hero with play button
 * - Category + program name
 * - Beginner / Intermediate / Advanced sections (sub-categories)
 * - VideoCards for each lesson, with lock state for gated levels
 */

import React, { useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { rs, wp, hp } from '../../theme/responsive';
import { useStudyContent, useSubCategories } from '../../hooks/useStudy';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { VideoCard } from '../../components/ui/VideoCard';
import type { StudentStackParamList } from '../../navigation';
import type { StudyContentItem } from '../../types/study';

type NavProp = NativeStackNavigationProp<StudentStackParamList>;
type RouteProps = RouteProp<StudentStackParamList, 'ProgramDetail'>;

const VideoListScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<NavProp>();
    const route = useRoute<RouteProps>();
    const { categoryId, programName, categoryName } = route.params;

    // Fetch study content filtered by category
    const { data: contentData, isLoading: contentLoading } = useStudyContent({
        categoryIds: [categoryId],
        limit: 50,
    });

    // Fetch sub-categories (levels) for this category
    const { data: subCatData, isLoading: subCatLoading } = useSubCategories(categoryId);

    const allItems = useMemo(
        () => contentData?.data?.items ?? [],
        [contentData]
    );
    const subCategories = useMemo(
        () => {
            if (!subCatData?.data) return [];
            if (Array.isArray(subCatData.data)) return subCatData.data;
            if ((subCatData.data as any)?.items) return (subCatData.data as any).items;
            return [];
        },
        [subCatData]
    );

    // Hero: first item
    const heroItem = allItems[0] as StudyContentItem | undefined;

    // Group items by sub-category; ungrouped go to a "General" bucket
    const grouped = useMemo(() => {
        if (subCategories.length === 0) {
            return [{ name: 'All Videos', items: allItems, isLocked: false }];
        }

        const groups = subCategories.map((sc: any, idx: number) => ({
            name: sc.name,
            items: allItems.filter(it => it.subCategoryId === sc._id),
            isLocked: idx > 0, // Lock beyond first level
        }));

        // Add ungrouped items
        const groupedIds = new Set(subCategories.map((sc: any) => sc._id));
        const ungrouped = allItems.filter(it => !it.subCategoryId || !groupedIds.has(it.subCategoryId));
        if (ungrouped.length > 0) {
            groups.unshift({ name: 'General', items: ungrouped, isLocked: false });
        }

        return groups;
    }, [allItems, subCategories]);

    // ─ Handlers
    const handleVideoPress = useCallback(
        (item: StudyContentItem) => {
            navigation.navigate('VideoPlayer', {
                videoUrl: item.contentLink,
                title: item.title,
            });
        },
        [navigation]
    );

    const handleHeroPlay = useCallback(() => {
        if (heroItem) {
            navigation.navigate('VideoPlayer', {
                videoUrl: heroItem.contentLink,
                title: heroItem.title,
            });
        }
    }, [heroItem, navigation]);

    // ─ Loading
    if (contentLoading && subCatLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const displayTitle = programName || categoryName || 'Program';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Hero ──────────────────────────────────────────── */}
                {heroItem && (
                    <View style={styles.heroSection}>
                        <ImageBackground
                            source={
                                heroItem.event?.imageUrl
                                    ? { uri: heroItem.event.imageUrl }
                                    : undefined
                            }
                            style={[
                                styles.heroBg,
                                { backgroundColor: theme.colors.surfaceVariant },
                            ]}
                            imageStyle={{ borderRadius: theme.borderRadius.lg }}
                        >
                            <View style={styles.heroOverlay}>
                                <Text
                                    style={[
                                        styles.heroCategory,
                                        { color: theme.colors.textSecondary, fontSize: theme.fontSize.body },
                                    ]}
                                >
                                    {categoryName}
                                    {programName && categoryName ? ' • ' : ''}
                                    {programName && programName !== categoryName ? programName : ''}
                                </Text>
                                <Text
                                    numberOfLines={2}
                                    style={[
                                        styles.heroTitle,
                                        { color: theme.colors.text, fontSize: theme.fontSize.h2 },
                                    ]}
                                >
                                    {heroItem.title}
                                </Text>

                                <FocusableCard
                                    onPress={handleHeroPlay}
                                    style={[
                                        styles.playButton,
                                        { backgroundColor: theme.colors.primary },
                                    ]}
                                >
                                    <Icon name="play-arrow" size={rs(32)} color="#FFFFFF" />
                                    <Text style={styles.playText}>Play</Text>
                                </FocusableCard>
                            </View>
                        </ImageBackground>
                    </View>
                )}

                {/* ── Title ─────────────────────────────────────────── */}
                <Text
                    style={[
                        styles.screenTitle,
                        { color: theme.colors.text, fontSize: theme.fontSize.h2 },
                    ]}
                >
                    {displayTitle}
                </Text>

                {/* ── Level Sections ────────────────────────────────── */}
                {grouped.map((group: { name: string; items: StudyContentItem[]; isLocked: boolean }, idx: number) => (
                    <View key={group.name} style={styles.levelSection}>
                        <View style={styles.levelHeader}>
                            <Text
                                style={[
                                    styles.levelTitle,
                                    { color: theme.colors.text, fontSize: theme.fontSize.h3 },
                                ]}
                            >
                                {group.name}
                            </Text>
                            {group.isLocked && (
                                <View style={styles.lockBadge}>
                                    <Icon name="lock" size={rs(20)} color={theme.colors.textSecondary} />
                                    <Text
                                        style={[
                                            styles.lockText,
                                            { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
                                        ]}
                                    >
                                        Complete {grouped[idx - 1]?.name ?? 'previous'} level
                                    </Text>
                                </View>
                            )}
                        </View>

                        {group.items.length > 0 ? (
                            <FlatList
                                horizontal
                                data={group.items}
                                renderItem={({ item }: { item: StudyContentItem }) => (
                                    <VideoCard
                                        title={item.title}
                                        imageUrl={item.event?.imageUrl}
                                        isLocked={group.isLocked}
                                        lockMessage={`Complete ${grouped[idx - 1]?.name ?? 'Beginner'} level`}
                                        onPress={() => handleVideoPress(item)}
                                    />
                                )}
                                keyExtractor={(item: StudyContentItem) => item._id}
                                contentContainerStyle={styles.rowContent}
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={false}
                            />
                        ) : (
                            <Text
                                style={[
                                    styles.emptyLevel,
                                    { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
                                ]}
                            >
                                No videos available
                            </Text>
                        )}
                    </View>
                ))}

                {/* Empty state */}
                {allItems.length === 0 && !contentLoading && (
                    <View style={styles.emptyState}>
                        <Icon name="video-library" size={rs(64)} color={theme.colors.textSecondary} />
                        <Text
                            style={[
                                styles.emptyText,
                                { color: theme.colors.textSecondary, fontSize: theme.fontSize.body },
                            ]}
                        >
                            No videos found for this program.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: rs(80),
    },
    // ── Hero
    heroSection: {
        paddingHorizontal: rs(60),
        marginTop: rs(24),
        marginBottom: rs(24),
    },
    heroBg: {
        width: '100%',
        height: hp(42),
        justifyContent: 'flex-end',
    },
    heroOverlay: {
        padding: rs(36),
        borderRadius: rs(16),
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    heroCategory: {
        fontWeight: '500',
        marginBottom: rs(8),
    },
    heroTitle: {
        fontWeight: '700',
        marginBottom: rs(20),
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: rs(8),
        paddingHorizontal: rs(28),
        paddingVertical: rs(14),
        borderRadius: rs(12),
    },
    playText: {
        color: '#FFFFFF',
        fontSize: rs(24),
        fontWeight: '600',
    },
    // ── Title
    screenTitle: {
        fontWeight: '700',
        paddingHorizontal: rs(60),
        marginBottom: rs(24),
    },
    // ── Level sections
    levelSection: {
        marginBottom: rs(32),
    },
    levelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(16),
        paddingHorizontal: rs(60),
        marginBottom: rs(16),
    },
    levelTitle: {
        fontWeight: '600',
    },
    lockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(6),
    },
    lockText: {
        fontWeight: '400',
    },
    emptyLevel: {
        paddingHorizontal: rs(60),
        fontWeight: '400',
    },
    // ── Empty
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: rs(80),
        gap: rs(16),
    },
    emptyText: {
        fontWeight: '400',
    },
    rowContent: {
        paddingHorizontal: rs(60),
    },
});

export default VideoListScreen;
