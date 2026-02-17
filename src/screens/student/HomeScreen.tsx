/**
 * HomeScreen – Student Curriculum Dashboard
 * Matching the "Student Curriculum" Figma screen
 *
 * Sections:
 * - Top TabBar (Search, Curriculum, Announcements)
 * - Today's Training Hero
 * - Programs Row (horizontal scroll)
 * - Training Area Row (categories)
 * - Recently Watched Row
 *
 * Uses API data with mock fallback when no data is available.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { rs, wp, hp } from '../../theme/responsive';
import { useStudyContent, useStudyCategories } from '../../hooks/useStudy';
import { useAuthStore } from '../../store/useAuthStore';
import { TabBar, TabItem } from '../../components/ui/TabBar';
import { ProgramCard } from '../../components/ui/ProgramCard';
import { TrainingAreaCard } from '../../components/ui/TrainingAreaCard';
import { FocusableCard } from '../../components/ui/FocusableCard';
import type { StudentStackParamList } from '../../navigation';
import type { StudyContentItem, StudyCategory } from '../../types/study';

type NavProp = NativeStackNavigationProp<StudentStackParamList>;

// ── Tab definitions ──────────────────────────────────────────────────────────

const TABS: TabItem[] = [
    { key: 'search', label: '', icon: 'search' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'announcements', label: 'Announcements' },
];

// ── Mock / Fallback Data ─────────────────────────────────────────────────────

const MOCK_PROGRAMS: StudyContentItem[] = [
    {
        _id: 'mock-1',
        title: 'Karate Basics',
        contentLink: 'https://example.com/video1.mp4',
        category: { _id: 'cat-1', dojo: 'd1', name: 'Karate' },
        order: 1,
        tags: [{ _id: 't1', name: 'Beginner', type: 'level' }],
    },
    {
        _id: 'mock-2',
        title: 'Advanced Forms',
        contentLink: 'https://example.com/video2.mp4',
        category: { _id: 'cat-2', dojo: 'd1', name: 'Forms' },
        order: 2,
        tags: [{ _id: 't2', name: 'Advanced', type: 'level' }],
    },
    {
        _id: 'mock-3',
        title: 'Sparring Techniques',
        contentLink: 'https://example.com/video3.mp4',
        category: { _id: 'cat-3', dojo: 'd1', name: 'Sparring' },
        order: 3,
        tags: [{ _id: 't3', name: 'Intermediate', type: 'level' }],
    },
    {
        _id: 'mock-4',
        title: 'Weapons Training',
        contentLink: 'https://example.com/video4.mp4',
        category: { _id: 'cat-4', dojo: 'd1', name: 'Weapons' },
        order: 4,
        tags: [{ _id: 't4', name: 'Advanced', type: 'level' }],
    },
    {
        _id: 'mock-5',
        title: 'Fitness Conditioning',
        contentLink: 'https://example.com/video5.mp4',
        category: { _id: 'cat-5', dojo: 'd1', name: 'Fitness' },
        order: 5,
        tags: [{ _id: 't5', name: 'All Levels', type: 'level' }],
    },
];

const MOCK_CATEGORIES: StudyCategory[] = [
    { _id: 'cat-1', dojo: 'd1', name: 'Karate' },
    { _id: 'cat-2', dojo: 'd1', name: 'Forms' },
    { _id: 'cat-3', dojo: 'd1', name: 'Sparring' },
    { _id: 'cat-4', dojo: 'd1', name: 'Weapons' },
    { _id: 'cat-5', dojo: 'd1', name: 'Fitness' },
];

// ── Category icon fallbacks ──────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
    'karate': 'sports-martial-arts',
    'forms': 'self-improvement',
    'sparring': 'sports-kabaddi',
    'weapons': 'gavel',
    'fitness': 'fitness-center',
    'default': 'school',
};

function getCategoryIcon(name: string): string {
    const key = name.toLowerCase();
    return (
        Object.entries(CATEGORY_ICONS).find(([k]) => key.includes(k))?.[1] ||
        CATEGORY_ICONS.default
    );
}

// ── Component ────────────────────────────────────────────────────────────────

const HomeScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<NavProp>();
    const user = useAuthStore(s => s.user);
    const logout = useAuthStore(s => s.logout);

    // ─ Logout animation
    const [logoutScale] = useState(new Animated.Value(1));

    const handleLogoutFocus = useCallback(() => {
        Animated.spring(logoutScale, {
            toValue: 1.15,
            friction: 3,
            useNativeDriver: true,
        }).start();
    }, [logoutScale]);

    const handleLogoutBlur = useCallback(() => {
        Animated.spring(logoutScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    }, [logoutScale]);

    const handleLogout = useCallback(async () => {
        await logout();
    }, [logout]);

    // ─ API data
    const { data: studyData, isLoading: studyLoading } = useStudyContent({ limit: 20 });
    const { data: categoriesData, isLoading: categoriesLoading } = useStudyCategories({ limit: 20 });

    // Use API data, fall back to mock data when empty
    const apiItems = studyData?.data?.items ?? [];
    const apiCategories = categoriesData?.data?.items ?? [];

    const items = apiItems.length > 0 ? apiItems : MOCK_PROGRAMS;
    const categories = apiCategories.length > 0 ? apiCategories : MOCK_CATEGORIES;
    const usingMockData = apiItems.length === 0 && !studyLoading;

    const heroItem = items[0] as StudyContentItem | undefined;

    // ─ Handlers
    const handleTabPress = useCallback(
        (key: string) => {
            if (key === 'search') navigation.navigate('SearchProgram');
            else if (key === 'announcements') navigation.navigate('Announcements');
        },
        [navigation]
    );

    const handleProgramPress = useCallback(
        (item: StudyContentItem) => {
            navigation.navigate('ProgramDetail', {
                categoryId: item.category._id,
                programName: item.title,
                categoryName: item.category.name,
            });
        },
        [navigation]
    );

    const handleCategoryPress = useCallback(
        (cat: StudyCategory) => {
            navigation.navigate('ProgramDetail', {
                categoryId: cat._id,
                categoryName: cat.name,
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

    // ─ Loading state
    if (studyLoading && categoriesLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    Loading curriculum…
                </Text>
            </View>
        );
    }

    const firstName = user?.user?.firstName ?? 'Student';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Tab Bar + Logout */}
            <View style={styles.topBar}>
                <TabBar tabs={TABS} activeTab="curriculum" onTabPress={handleTabPress} />
                <Pressable
                    onPress={handleLogout}
                    onFocus={handleLogoutFocus}
                    onBlur={handleLogoutBlur}
                    style={({ focused }) => [
                        styles.logoutButton,
                        {
                            backgroundColor: focused
                                ? theme.colors.error || '#E53935'
                                : theme.colors.surface,
                            borderColor: focused
                                ? theme.colors.focusBorder
                                : 'transparent',
                        },
                    ]}
                >
                    <Animated.View style={[styles.logoutInner, { transform: [{ scale: logoutScale }] }]}>
                        <Icon name="power-settings-new" size={rs(26)} color={theme.colors.text} />
                        <Text style={[styles.logoutLabel, { color: theme.colors.text, fontSize: theme.fontSize.caption }]}>
                            Logout
                        </Text>
                    </Animated.View>
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Mock data banner */}
                {usingMockData && (
                    <View style={[styles.mockBanner, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Icon name="info-outline" size={rs(22)} color={theme.colors.textSecondary} />
                        <Text style={[styles.mockBannerText, { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption }]}>
                            Showing sample data — connect to your backend for live content
                        </Text>
                    </View>
                )}

                {/* ── Hero Section ─────────────────────────────────── */}
                {heroItem && (
                    <View style={styles.heroSection}>
                        <View
                            style={[
                                styles.heroBg,
                                { backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.borderRadius.lg },
                            ]}
                        >
                            <View style={styles.heroOverlay}>
                                <Text style={[styles.heroGreeting, { color: theme.colors.text, fontSize: theme.fontSize.h3 }]}>
                                    Welcome back, {firstName}
                                </Text>
                                <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary, fontSize: theme.fontSize.body }]}>
                                    Today's Training
                                </Text>
                                <Text numberOfLines={2} style={[styles.heroTitle, { color: theme.colors.text, fontSize: theme.fontSize.h2 }]}>
                                    {heroItem.title}
                                </Text>
                                <Text style={[styles.heroCategory, { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption }]}>
                                    {heroItem.category.name}
                                    {heroItem.tags?.length > 0 && ` · ${heroItem.tags[0].name}`}
                                </Text>

                                <View style={styles.heroActions}>
                                    <FocusableCard
                                        onPress={handleHeroPlay}
                                        style={[styles.heroButton, { backgroundColor: theme.colors.primary }]}
                                    >
                                        <Icon name="play-arrow" size={rs(28)} color="#FFFFFF" />
                                        <Text style={styles.heroButtonText}>Continue Training</Text>
                                    </FocusableCard>

                                    <FocusableCard
                                        onPress={handleHeroPlay}
                                        style={[styles.heroButtonSecondary, { backgroundColor: 'transparent', borderColor: theme.colors.border }]}
                                    >
                                        <Icon name="replay" size={rs(24)} color={theme.colors.text} />
                                        <Text style={[styles.heroButtonText, { color: theme.colors.text }]}>Restart</Text>
                                    </FocusableCard>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* ── Programs Row ─────────────────────────────────── */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: theme.fontSize.h3 }]}>
                        Programs
                    </Text>
                    <FlatList
                        horizontal
                        data={items}
                        renderItem={({ item }) => (
                            <ProgramCard
                                title={item.title}
                                imageUrl={item.event?.imageUrl}
                                progress={0}
                                onPress={() => handleProgramPress(item)}
                            />
                        )}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.rowContent}
                        showsHorizontalScrollIndicator={false}
                        removeClippedSubviews={false}
                    />
                </View>

                {/* ── Training Area Row ───────────────────────────── */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: theme.fontSize.h3 }]}>
                        Training Area
                    </Text>
                    <FlatList
                        horizontal
                        data={categories}
                        renderItem={({ item: cat }) => (
                            <TrainingAreaCard
                                title={cat.name}
                                imageUrl={cat.image}
                                iconName={getCategoryIcon(cat.name)}
                                onPress={() => handleCategoryPress(cat)}
                            />
                        )}
                        keyExtractor={cat => cat._id}
                        contentContainerStyle={styles.rowContent}
                        showsHorizontalScrollIndicator={false}
                        removeClippedSubviews={false}
                    />
                </View>

                {/* ── Recently Watched ─────────────────────────────── */}
                {items.length > 1 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: theme.fontSize.h3 }]}>
                            Recently Watched
                        </Text>
                        <FlatList
                            horizontal
                            data={items.slice(0, 10)}
                            renderItem={({ item }) => (
                                <ProgramCard
                                    title={item.title}
                                    imageUrl={item.event?.imageUrl}
                                    progress={0}
                                    onPress={() => handleProgramPress(item)}
                                />
                            )}
                            keyExtractor={item => `rw-${item._id}`}
                            contentContainerStyle={styles.rowContent}
                            showsHorizontalScrollIndicator={false}
                            removeClippedSubviews={false}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: rs(24),
        borderWidth: 2,
        paddingHorizontal: rs(20),
        paddingVertical: rs(10),
        marginRight: rs(60),
    },
    logoutInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(8),
    },
    logoutLabel: {
        fontWeight: '600',
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: rs(16),
    },
    loadingText: {
        fontWeight: '500',
    },
    scrollContent: {
        paddingBottom: rs(80),
    },
    // ── Mock banner
    mockBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(10),
        marginHorizontal: rs(60),
        marginBottom: rs(16),
        paddingHorizontal: rs(20),
        paddingVertical: rs(10),
        borderRadius: rs(10),
    },
    mockBannerText: {
        fontWeight: '400',
    },
    // ── Hero
    heroSection: {
        paddingHorizontal: rs(60),
        marginBottom: rs(32),
    },
    heroBg: {
        width: '100%',
        height: hp(42),
        justifyContent: 'flex-end',
    },
    heroOverlay: {
        padding: rs(40),
    },
    heroGreeting: {
        fontWeight: '600',
        marginBottom: rs(16),
    },
    heroSubtitle: {
        fontWeight: '500',
        marginBottom: rs(8),
    },
    heroTitle: {
        fontWeight: '700',
        marginBottom: rs(8),
    },
    heroCategory: {
        fontWeight: '400',
        marginBottom: rs(24),
    },
    heroActions: {
        flexDirection: 'row',
        gap: rs(16),
    },
    heroButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(8),
        paddingHorizontal: rs(28),
        paddingVertical: rs(14),
        borderRadius: rs(12),
    },
    heroButtonSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(8),
        paddingHorizontal: rs(28),
        paddingVertical: rs(14),
        borderRadius: rs(12),
        borderWidth: 1,
    },
    heroButtonText: {
        color: '#FFFFFF',
        fontSize: rs(24),
        fontWeight: '600',
    },
    // ── Sections
    section: {
        marginBottom: rs(32),
    },
    sectionTitle: {
        fontWeight: '700',
        paddingHorizontal: rs(60),
        marginBottom: rs(16),
    },
    rowContent: {
        paddingHorizontal: rs(60),
    },
});

export default HomeScreen;
