/**
 * AnnouncementsScreen – List of announcements
 * Uses real API data from notice-board endpoint
 */

import React, { useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { rs, wp } from '../../theme/responsive';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { TabBar, TabItem } from '../../components/ui/TabBar';
import type { StudentStackParamList } from '../../navigation';
import type { Announcement } from '../../types/announcement';

type NavProp = NativeStackNavigationProp<StudentStackParamList>;

const TABS: TabItem[] = [
    { key: 'search', label: '', icon: 'search' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'announcements', label: 'Announcements' },
];

function formatDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function stripHtmlTags(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
}

const AnnouncementsScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<NavProp>();
    const { data, isLoading } = useAnnouncements({ limit: 30 });

    const items = data?.data?.items ?? [];

    const handleTabPress = useCallback(
        (key: string) => {
            if (key === 'search') {
                navigation.navigate('SearchProgram');
            } else if (key === 'curriculum') {
                navigation.navigate('Home');
            }
        },
        [navigation]
    );

    const handleAnnouncementPress = useCallback(
        (item: Announcement) => {
            navigation.navigate('AnnouncementDetail', {
                announcementId: item._id,
                title: item.title,
                description: item.description,
                createdAt: item.createdAt,
                authorName: `${item.createdBy?.user?.firstName ?? ''} ${item.createdBy?.user?.lastName ?? ''}`.trim(),
            });
        },
        [navigation]
    );

    const renderItem = ({ item }: { item: Announcement }) => (
        <FocusableCard
            onPress={() => handleAnnouncementPress(item)}
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.md,
                },
            ]}
        >
            <View style={styles.cardContent}>
                {/* Icon */}
                <View
                    style={[
                        styles.iconCircle,
                        { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                >
                    <Icon name="campaign" size={rs(32)} color={theme.colors.primary} />
                </View>

                {/* Text */}
                <View style={styles.textContent}>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.cardTitle,
                            { color: theme.colors.text, fontSize: theme.fontSize.h3 },
                        ]}
                    >
                        {item.title}
                    </Text>
                    <Text
                        numberOfLines={2}
                        style={[
                            styles.cardDescription,
                            { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
                        ]}
                    >
                        {stripHtmlTags(item.description)}
                    </Text>
                </View>

                {/* Date */}
                <Text
                    style={[
                        styles.dateText,
                        { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
                    ]}
                >
                    {formatDate(item.createdAt)}
                </Text>
            </View>
        </FocusableCard>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Tab Bar */}
            <TabBar
                tabs={TABS}
                activeTab="announcements"
                onTabPress={handleTabPress}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text
                    style={[
                        styles.headerTitle,
                        { color: theme.colors.text, fontSize: theme.fontSize.h2 },
                    ]}
                >
                    Announcements
                </Text>
                <Text
                    style={[
                        styles.headerSubtitle,
                        { color: theme.colors.textSecondary, fontSize: theme.fontSize.body },
                    ]}
                >
                    Stay updated with the latest notices
                </Text>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : items.length > 0 ? (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centered}>
                    <Icon name="notifications-none" size={rs(64)} color={theme.colors.textSecondary} />
                    <Text
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textSecondary, fontSize: theme.fontSize.body },
                        ]}
                    >
                        No announcements yet
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: rs(60),
        paddingBottom: rs(24),
    },
    headerTitle: {
        fontWeight: '700',
        marginBottom: rs(4),
    },
    headerSubtitle: {
        fontWeight: '400',
    },
    list: {
        paddingHorizontal: rs(60),
        paddingBottom: rs(80),
        gap: rs(16),
    },
    card: {
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: rs(24),
        gap: rs(20),
    },
    iconCircle: {
        width: rs(60),
        height: rs(60),
        borderRadius: rs(30),
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContent: {
        flex: 1,
        gap: rs(4),
    },
    cardTitle: {
        fontWeight: '600',
    },
    cardDescription: {
        fontWeight: '400',
    },
    dateText: {
        fontWeight: '400',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: rs(16),
    },
    emptyText: {
        fontWeight: '400',
    },
});

export default AnnouncementsScreen;
