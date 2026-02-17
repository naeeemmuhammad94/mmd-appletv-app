/**
 * SearchProgramScreen – Full-width search with program results grid
 * Matches the "Search Program" Figma screen
 */

import React, { useState, useCallback } from 'react';
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
import { useStudyContent } from '../../hooks/useStudy';
import { SearchBar } from '../../components/ui/SearchBar';
import { ProgramCard } from '../../components/ui/ProgramCard';
import type { StudentStackParamList } from '../../navigation';
import type { StudyContentItem } from '../../types/study';

type NavProp = NativeStackNavigationProp<StudentStackParamList>;

const NUM_COLUMNS = 4;

const SearchProgramScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<NavProp>();
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = useStudyContent(
        { search: searchQuery || undefined, limit: 30 },
        true
    );

    const items = data?.data?.items ?? [];

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleItemPress = useCallback(
        (item: StudyContentItem) => {
            navigation.navigate('ProgramDetail', {
                categoryId: item.category._id,
                programName: item.title,
                categoryName: item.category.name,
            });
        },
        [navigation]
    );

    const cardWidth = (wp(100) - rs(60) * 2 - rs(16) * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

    const renderItem = ({ item }: { item: StudyContentItem }) => (
        <ProgramCard
            title={item.title}
            imageUrl={item.event?.imageUrl}
            progress={0}
            onPress={() => handleItemPress(item)}
            width={cardWidth}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.fontSize.h2 }]}>
                    Search Programs
                </Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
                <SearchBar
                    placeholder="Search programs, categories, tags…"
                    onSearch={handleSearch}
                    initialValue={searchQuery}
                />
            </View>

            {/* Results */}
            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : items.length > 0 ? (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    numColumns={NUM_COLUMNS}
                    contentContainerStyle={styles.grid}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centered}>
                    <Icon name="search-off" size={rs(64)} color={theme.colors.textSecondary} />
                    <Text
                        style={[
                            styles.emptyText,
                            { color: theme.colors.textSecondary, fontSize: theme.fontSize.body },
                        ]}
                    >
                        {searchQuery
                            ? `No results for "${searchQuery}"`
                            : 'Start typing to search programs'}
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
        paddingTop: rs(32),
        paddingBottom: rs(16),
    },
    title: {
        fontWeight: '700',
    },
    searchWrapper: {
        paddingHorizontal: rs(60),
        marginBottom: rs(24),
    },
    grid: {
        paddingHorizontal: rs(60),
        paddingBottom: rs(80),
    },
    row: {
        gap: rs(16),
        marginBottom: rs(16),
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

export default SearchProgramScreen;
