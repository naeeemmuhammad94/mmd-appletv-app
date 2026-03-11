import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
} from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { FocusableCard } from '../ui/FocusableCard';
import { StudyCategory } from '../../types/study';

interface SearchViewProps {
  data: StudyCategory[];
  searchQuery: string;
  onProgramPress?: (item: StudyCategory) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  data,
  searchQuery,
  onProgramPress,
}) => {
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
        {data.map(item => {
          const progress = 0; // Categories don't have progress currently
          return (
            <FocusableCard
              key={item._id}
              onPress={() => onProgramPress?.(item)}
              style={styles.card}
              focusedStyle={styles.focusedCard}
            >
              <ImageBackground
                source={
                  item.image
                    ? { uri: item.image }
                    : {
                        uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                      }
                }
                style={styles.cardImage}
                resizeMode="cover"
              >
                <View style={styles.overlay} />

                {/* Removed play-circle-outline per user request to remove "bot icon" (which looked like a train/bot in their screenshot due to some fallback image) or the play icon itself. The Figma shows no play icon in the center. */}

                <View style={styles.cardBottom}>
                  <View style={styles.textRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.name.toUpperCase()}
                    </Text>
                    <Text style={styles.progressText}>{progress}%</Text>
                  </View>
                  <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBar}>
                      <View
                        style={[styles.progressFill, { width: `${progress}%` }]}
                      />
                    </View>
                    {/* Diamond indicator at the end of progress */}
                    <View
                      style={[styles.progressDiamond, { left: `${progress}%` }]}
                    />
                  </View>
                </View>
              </ImageBackground>
            </FocusableCard>
          );
        })}
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
    justifyContent: 'flex-start',
  },
  card: {
    // Adjust width to fit exactly 4 columns with reasonable gaps on a 1920 TV screen
    // (1920 - 120 side margins - 120 gaps) / 4 = 420
    width: rs(400),
    height: rs(225), // 16:9 ratio
    backgroundColor: '#1E1E1E',
    borderRadius: rs(12),
    overflow: 'hidden',
  },
  focusedCard: {
    transform: [{ scale: 1.05 }],
    borderColor: '#3B82F6',
    borderWidth: 3, // Thicker border on focus for TV
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dimmed quite a bit based on Figma
  },
  cardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: rs(24),
    // Removed the black overlay background per user request
    backgroundColor: 'transparent',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(12),
  },
  cardTitle: {
    color: '#fff',
    fontSize: rs(26), // Larger title
    fontWeight: 'bold',
    fontFamily: 'SF Pro Display',
    flex: 1,
    letterSpacing: rs(1), // Match ALL CAPS look from Figma
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: rs(22),
    fontFamily: 'SF Pro Display',
    marginLeft: rs(10),
  },
  progressBarWrapper: {
    position: 'relative',
    height: rs(20), // Wrapper gives room for the diamond to overflow
    justifyContent: 'center',
  },
  progressBar: {
    height: rs(4), // Thin line
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: rs(2),
    width: '100%',
    // Removed shadow
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)', // White-ish fill in the mock instead of bright blue
    borderRadius: rs(2),
  },
  progressDiamond: {
    position: 'absolute',
    width: rs(16),
    height: rs(16),
    backgroundColor: 'rgba(255,255,255,0.4)', // Dimmed diamond
    transform: [{ rotate: '45deg' }, { translateX: rs(-8) }], // Rotate to diamond, shift to center
    top: rs(2), // Align vertically with line
  },
});
