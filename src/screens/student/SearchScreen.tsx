import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { useForm, Controller } from 'react-hook-form';

// Components
import { ProgramCard } from '../../components/ui/ProgramCard';
import { EmptyState } from '../../components/ui/EmptyState';

// Assets
import SearchIcon from '../../../assets/icons/search-icon.svg';

// Services
import { studyService } from '../../services/studyService';
import { StudyContentItem } from '../../types/study';
import { useVimeoThumbnails } from '../../hooks/useVimeoThumbnails';

type SearchScreenNavigationProp = NativeStackNavigationProp<
  StudentStackParamList,
  'Search'
>;

interface SearchFormData {
  query: string;
}

const SearchScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const [submittedQuery, setSubmittedQuery] = useState('');
  const [iconFocused, setIconFocused] = useState(false);

  // Data state
  const [allData, setAllData] = useState<StudyContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const vimeoThumbnails = useVimeoThumbnails(allData);

  const { control, handleSubmit } = useForm<SearchFormData>({
    defaultValues: {
      query: '',
    },
  });

  useEffect(() => {
    // Fetch original dataset on mount
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const response = await studyService.getStudyContentForContact({
          limit: 500,
          page: 1,
          pagination: true,
        });
        if (response.success && response.data) {
          const items = Array.isArray(response.data)
            ? response.data
            : response.data.items || [];
          setAllData(items);
        } else {
          setError('Failed to load programs.');
        }
      } catch {
        setError('An error occurred while loading data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Filter locally based on the submitted query
  const filteredData = React.useMemo(() => {
    if (!submittedQuery) return allData;
    const lowerQuery = submittedQuery.toLowerCase();
    return allData.filter(
      item =>
        item.title?.toLowerCase().includes(lowerQuery) ||
        item.category?.name?.toLowerCase().includes(lowerQuery),
    );
  }, [allData, submittedQuery]);

  const onSubmit = (data: SearchFormData) => {
    setSubmittedQuery(data.query);
    // This fires when "Done" is pressed on the tvOS keyboard due to onSubmitEditing
  };

  const handlePlayContent = (item: StudyContentItem) => {
    if (
      item?.contentLink &&
      (item.contentLink.includes('vimeo') ||
        item.contentLink.includes('mp4') ||
        item.contentLink.includes('m3u8'))
    ) {
      navigation.navigate('VideoPlayer', {
        videoUrl: item.contentLink,
        title: item.title,
        contentId: item._id,
      });
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header Area Single Wide Pill Layout */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContentContainer}>
          <View style={styles.pillContainer}>
            {/* Search Input Area */}
            <View style={styles.searchContainer}>
              {/* Native TVOS Spatial Navigation Toggle */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                onFocus={() => setIconFocused(true)}
                onBlur={() => setIconFocused(false)}
                style={[
                  styles.backIconButton,
                  iconFocused && styles.backIconButtonFocused,
                ]}
              >
                <SearchIcon
                  width={rs(36)}
                  height={rs(36)}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
              <Controller
                control={control}
                name="query"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.searchInput,
                      { backgroundColor: 'transparent' },
                    ]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Search program"
                    placeholderTextColor="#A0A0A0"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    blurOnSubmit={true}
                    returnKeyType="search"
                  />
                )}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {isLoading ? (
          <EmptyState
            message="Loading programs..."
            variant="loading"
            onGoBack={() => navigation.goBack()}
            goBackLabel="Cancel"
          />
        ) : error ? (
          <EmptyState
            message={error}
            variant="error"
            onRetry={() => {
              setError(null);
              setIsLoading(true);
              studyService
                .getStudyContentForContact({
                  limit: 500,
                  page: 1,
                  pagination: true,
                })
                .then(response => {
                  if (response.success && response.data) {
                    const items = Array.isArray(response.data)
                      ? response.data
                      : response.data.items || [];
                    setAllData(items);
                  } else {
                    setError('Failed to load programs.');
                  }
                })
                .catch(() => setError('An error occurred while loading data.'))
                .finally(() => setIsLoading(false));
            }}
            onGoBack={() => navigation.goBack()}
          />
        ) : (
          <>
            {filteredData.length === 0 ? (
              <EmptyState
                message="No results found."
                variant="empty"
                onGoBack={() => navigation.goBack()}
                goBackLabel="Go Back"
              />
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={item => item._id}
                numColumns={4}
                columnWrapperStyle={styles.rowWrapper}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.cardWrapper}>
                    <ProgramCard
                      title={item.title}
                      progress={0}
                      image={{
                        uri:
                          vimeoThumbnails[item._id] ||
                          (item.ranks && item.ranks[0]?.stripeImage) ||
                          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                      }}
                      previewUrl={item.contentLink}
                      onPress={() => handlePlayContent(item)}
                      style={styles.cardOverride}
                    />
                  </View>
                )}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header styling Single Wide Pill
  headerContainer: {
    width: '100%',
    paddingTop: rs(40),
    paddingHorizontal: rs(60),
    marginBottom: rs(40),
    zIndex: 10,
  },
  headerContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: rs(80),
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.6)', // Dark glass
    borderRadius: rs(40),
    paddingHorizontal: rs(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', // Thin light outline
    alignSelf: 'center',
    width: rs(1000), // Single wide pill
    height: rs(80),
  },
  backIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(10),
    marginRight: rs(10),
    borderRadius: rs(25),
  },
  backIconButtonFocused: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'white',
    transform: [{ scale: 1.1 }],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: rs(15),
    marginLeft: rs(10),
  },
  searchInput: {
    flex: 1,
    height: rs(56), // Smaller than the rs(80) container
    borderRadius: rs(28), // Pill shape for the focus background
    marginLeft: rs(10), // Space from icon
    marginRight: rs(10), // Space from right edge
    paddingHorizontal: rs(20), // Inner text padding
    fontSize: rs(28), // Slightly smaller to fit rs(56) height comfortably
    color: '#FFFFFF',
    fontWeight: 'normal',
    textAlign: 'left', // Strictly left-aligned
  },
  content: {
    flex: 1,
    paddingHorizontal: rs(60), // Matched HomeHeader paddingHorizontal
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: rs(28),
    fontWeight: 'bold',
    marginBottom: rs(20),
    fontFamily: 'SF Pro Display',
  },
  errorText: {
    fontSize: rs(24),
    fontFamily: 'SF Pro Display',
  },
  rowWrapper: {
    justifyContent: 'flex-start',
    gap: rs(40),
    marginBottom: rs(40),
  },
  cardWrapper: {
    // Handled by width override
  },
  cardOverride: {
    // (1920 - 120 sides - 120 gaps) / 4 = 420
    width: rs(400),
  },
});

export default SearchScreen;
