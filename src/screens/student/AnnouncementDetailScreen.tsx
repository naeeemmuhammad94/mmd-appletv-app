/**
 * AnnouncementDetailScreen – Full announcement view
 * Shows title, message body, author, and date
 */

import React, { useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import type { StudentStackParamList } from '../../navigation';

type NavProp = NativeStackNavigationProp<StudentStackParamList>;
type RouteProps = RouteProp<StudentStackParamList, 'AnnouncementDetail'>;

function formatDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

const AnnouncementDetailScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<NavProp>();
    const route = useRoute<RouteProps>();
    const { title, description, createdAt, authorName } = route.params;

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const cleanDescription = description ? description.replace(/<[^>]*>/g, '').trim() : '';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with back button */}
                <View style={styles.header}>
                    <Pressable
                        onPress={handleBack}
                        style={({ focused }) => [
                            styles.backButton,
                            {
                                backgroundColor: theme.colors.surface,
                                borderColor: focused ? theme.colors.focusBorder : 'transparent',
                            },
                        ]}
                    >
                        <Icon name="arrow-back" size={rs(28)} color={theme.colors.text} />
                    </Pressable>
                </View>

                {/* Announcement card */}
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.colors.surface,
                            borderRadius: theme.borderRadius.lg,
                        },
                    ]}
                >
                    {/* Icon */}
                    <View
                        style={[
                            styles.iconCircle,
                            { backgroundColor: theme.colors.surfaceVariant },
                        ]}
                    >
                        <Icon name="campaign" size={rs(40)} color={theme.colors.primary} />
                    </View>

                    {/* Title */}
                    <Text
                        style={[
                            styles.title,
                            { color: theme.colors.text, fontSize: theme.fontSize.h2 },
                        ]}
                    >
                        {title}
                    </Text>

                    {/* Meta */}
                    <View style={styles.meta}>
                        {authorName ? (
                            <View style={styles.metaItem}>
                                <Icon name="person" size={rs(22)} color={theme.colors.textSecondary} />
                                <Text
                                    style={[
                                        styles.metaText,
                                        { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
                                    ]}
                                >
                                    {authorName}
                                </Text>
                            </View>
                        ) : null}
                        {createdAt ? (
                            <View style={styles.metaItem}>
                                <Icon name="schedule" size={rs(22)} color={theme.colors.textSecondary} />
                                <Text
                                    style={[
                                        styles.metaText,
                                        { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
                                    ]}
                                >
                                    {formatDate(createdAt)}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Divider */}
                    <View
                        style={[
                            styles.divider,
                            { backgroundColor: theme.colors.border },
                        ]}
                    />

                    {/* Message body */}
                    <Text
                        style={[
                            styles.body,
                            { color: theme.colors.text, fontSize: theme.fontSize.body },
                        ]}
                    >
                        {cleanDescription}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: rs(60),
        paddingBottom: rs(80),
    },
    header: {
        paddingTop: rs(32),
        paddingBottom: rs(24),
    },
    backButton: {
        width: rs(56),
        height: rs(56),
        borderRadius: rs(28),
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        padding: rs(48),
        gap: rs(20),
    },
    iconCircle: {
        width: rs(72),
        height: rs(72),
        borderRadius: rs(36),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    title: {
        fontWeight: '700',
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(24),
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(8),
    },
    metaText: {
        fontWeight: '400',
    },
    divider: {
        height: 1,
        width: '100%',
    },
    body: {
        fontWeight: '400',
        lineHeight: rs(40),
    },
});

export default AnnouncementDetailScreen;
