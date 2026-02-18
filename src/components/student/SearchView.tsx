import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FocusableCard } from '../ui/FocusableCard';

interface Program {
    id: string;
    title: string;
    progress: number;
    image: any;
}

interface SearchViewProps {
    ListHeaderComponent?: React.ReactElement;
    data: Program[];
    searchQuery: string;
}

export const SearchView: React.FC<SearchViewProps> = ({ ListHeaderComponent, data, searchQuery }) => {
    const { theme } = useTheme();

    // Removed renderEmptyState since we now want to show all programs initially

    const renderResults = () => {
        if (data.length === 0) {
            return (
                <View style={styles.noResultsContainer}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: rs(24) }}>
                        No results found for "{searchQuery}"
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.gridContainer}>
                {data.map((item) => (
                    <FocusableCard
                        key={item.id}
                        onPress={() => console.log('Pressed', item.title)}
                        style={styles.card}
                        focusedStyle={styles.focusedCard}
                    >
                        <View style={styles.imageContainer}>
                            <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                            <View style={styles.overlay} />
                            <Icon name="play-circle-outline" size={rs(60)} color="#fff" style={styles.playIcon} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{Math.round(item.progress * 100)}%</Text>
                        </View>
                    </FocusableCard>
                ))}
            </View>
        );
    };

    return (
        <FlatList
            // Use key to force refresh if query flips between empty/non-empty if needed, 
            // but just re-rendering content is fine.
            data={[{ key: 'content' }]}
            renderItem={() => (
                <View style={styles.contentContainer}>
                    {/* Always show results (which will be filtered or full list) */}
                    {renderResults()}
                </View>
            )}
            ListHeaderComponent={ListHeaderComponent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: rs(50),
    },
    contentContainer: {
        paddingHorizontal: rs(60),
        paddingTop: rs(20),
    },
    resultsContainer: {
        width: '100%',
    },
    noResultsContainer: {
        alignItems: 'center',
        marginTop: rs(50),
    },
    sectionTitle: {
        fontSize: rs(28),
        fontWeight: 'bold',
        marginBottom: rs(20),
        fontFamily: 'SF Pro Display',
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: rs(16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    resultText: {
        fontSize: rs(24),
        marginLeft: rs(20),
        fontFamily: 'SF Pro Display',
    },
    // Grid Styles
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: rs(40),
    },
    card: {
        width: rs(400),
        height: rs(260),
        backgroundColor: '#1E1E1E',
        borderRadius: rs(12),
        overflow: 'hidden',
    },
    focusedCard: {
        transform: [{ scale: 1.05 }],
        borderColor: '#fff',
        borderWidth: 2,
    },
    imageContainer: {
        height: rs(180),
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    playIcon: {
        position: 'absolute',
    },
    cardContent: {
        padding: rs(16),
    },
    cardTitle: {
        color: '#fff',
        fontSize: rs(20),
        fontWeight: '600',
        marginBottom: rs(8),
        fontFamily: 'SF Pro Display',
    },
    progressBar: {
        height: rs(4),
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: rs(2),
        width: '100%',
        marginBottom: rs(4),
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: rs(2),
    },
    progressText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: rs(14),
        textAlign: 'right',
        fontFamily: 'SF Pro Display',
    },
});
