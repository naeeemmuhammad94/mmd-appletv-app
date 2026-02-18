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
    ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import LinearGradient from 'react-native-linear-gradient';
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

// ─── Imports ─────────────────────────────────────────────────────────────────
import { MOCK_PROGRAMS, MOCK_CATEGORIES } from '../../data/mockData';
import { getImageUrl, getCategoryIcon } from '../../utils/imageUtils';

// ── Tab definitions ──────────────────────────────────────────────────────────

const TABS: TabItem[] = [
    { key: 'search', label: '', icon: 'search' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'announcements', label: 'Announcements' },
];

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
                        <ImageBackground
                            source={{ uri: getImageUrl(heroItem) }}
                            style={styles.heroBg}
                            imageStyle={{ borderRadius: theme.borderRadius.lg }}
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                                style={styles.heroGradient}
                            >
                                <View style={styles.heroContent}>
                                    <Text style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>
                                        Today's Training
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.heroTitle, { color: theme.colors.text }]}
                                    >
                                        {heroItem.title}
                                    </Text>
                                    <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
                                        {heroItem.category.name}
                                        {heroItem.tags?.length > 0 && ` · ${heroItem.tags[0].name}`}
                                    </Text>

                                    <View style={styles.heroActions}>
                                        <FocusableCard
                                            onPress={handleHeroPlay}
                                            style={[styles.heroButtonPrimary, { backgroundColor: theme.colors.primary }]}
                                        >
                                            <Icon name="play-arrow" size={rs(32)} color="#FFFFFF" />
                                            <Text style={styles.heroButtonTextPrimary}>Continue Training</Text>
                                        </FocusableCard>

                                        <FocusableCard
                                            onPress={handleHeroPlay}
                                            style={styles.heroButtonSecondary}
                                        >
                                            <Icon name="replay" size={rs(28)} color={theme.colors.textSecondary} />
                                            <Text style={[styles.heroButtonTextSecondary, { color: theme.colors.textSecondary }]}>
                                                Restart
                                            </Text>
                                        </FocusableCard>
                                    </View>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
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
                                imageUrl={getImageUrl(item)}
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
                                    imageUrl={getImageUrl(item)}
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
        marginBottom: rs(40),
        height: hp(55), // Taller hero
    },
    heroBg: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
    },
    heroGradient: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: rs(50),
        borderRadius: rs(16),
    },
    heroContent: {
        width: '50%', // Content takes left half
        gap: rs(10),
    },
    heroLabel: {
        fontSize: rs(48), // "Today's Training"
        fontWeight: 'bold',
        fontFamily: 'SF Pro Display',
    },
    heroTitle: {
        fontSize: rs(32), // "Fundamental Balance..."
        fontWeight: '600',
        marginBottom: rs(4),
    },
    heroSubtitle: {
        fontSize: rs(28), // "Videos 2 of 6"
        fontWeight: '500',
        marginBottom: rs(20),
    },
    heroActions: {
        flexDirection: 'row',
        gap: rs(24),
        alignItems: 'center',
    },
    heroButtonPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(10),
        paddingHorizontal: rs(40),
        paddingVertical: rs(16),
        borderRadius: rs(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    heroButtonTextPrimary: {
        color: '#FFFFFF',
        fontSize: rs(26),
        fontWeight: '600',
    },
    heroButtonSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(10),
        paddingHorizontal: rs(20),
        paddingVertical: rs(14),
    },
    heroButtonTextSecondary: {
        fontSize: rs(26),
        fontWeight: '500',
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
