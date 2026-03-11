import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import BackIcon from '../../../assets/icons/back-icon.svg';
import { useAnnouncementStore } from '../../store/useAnnouncementStore';
import { format, parseISO, isValid } from 'date-fns';
import { Announcement } from '../../types/announcement';

interface AnnouncementsViewProps {}

const safeFormatDate = (dateString?: string, formatStr: string = 'MMM d') => {
  if (!dateString) return '';
  try {
    const parsed = parseISO(dateString);
    if (isValid(parsed)) {
      return format(parsed, formatStr);
    }
    return '';
  } catch {
    return '';
  }
};

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = () => {
  const { theme } = useTheme();
  const { announcements, loading, fetchAnnouncements } = useAnnouncementStore();

  const [selectedAnnouncement, setSelectedAnnouncement] =
    React.useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleBackPress = () => {
    setSelectedAnnouncement(null);
  };

  const renderDetailView = () => {
    if (!selectedAnnouncement) return null;

    return (
      <View style={styles.detailContainer}>
        {/* ListHeaderComponent removed as per request */}

        <View style={styles.detailHeaderContainer}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButtonIcon}
            hasTVPreferredFocus={true}
          >
            <BackIcon width={rs(30)} height={rs(30)} fill="white" />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>Announcements</Text>
          {/* Placeholder to balance the header */}
          <View style={{ width: rs(50) }} />
        </View>

        <View style={styles.detailContent}>
          {/* Title Section */}
          <Text style={styles.label}>Announcement Title</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{selectedAnnouncement.title}</Text>
          </View>

          {/* Message Section */}
          <Text style={styles.label}>Message</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>
              {selectedAnnouncement.description}
            </Text>
          </View>

          {/* Date Section */}
          <Text style={styles.label}>Date</Text>
          <View style={[styles.valueContainer, styles.dateContainer]}>
            <Text style={styles.valueText}>
              {safeFormatDate(selectedAnnouncement.createdAt, 'MMM d, yyyy')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const AnnouncementItem = ({
    item,
    theme,
    onSelect,
  }: {
    item: Announcement;
    theme: any;
    onSelect: (item: Announcement) => void;
  }) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isFocused && styles.cardFocused,
          {
            borderColor: isFocused
              ? theme?.colors?.primary || '#3b82f6'
              : 'rgba(59, 130, 246, 0.3)',
          },
        ]}
        onPress={() => onSelect(item)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.title, isFocused && styles.textFocused]}>
            {item.title}
          </Text>
          <Text style={[styles.date, isFocused && styles.textFocused]}>
            {safeFormatDate(item.createdAt, 'MMM d')}
          </Text>
        </View>
        <Text
          style={[styles.description, isFocused && styles.textFocused]}
          numberOfLines={2}
        >
          {/* Stripping potential HTML from description if necessary, though simple text is assumed */}
          {item.description?.replace(/<[^>]*>?/gm, '')}
        </Text>
      </TouchableOpacity>
    );
  };

  // ... existing code ...

  const renderItem = ({ item }: { item: Announcement }) => {
    return (
      <AnnouncementItem
        item={item}
        theme={theme}
        onSelect={setSelectedAnnouncement}
      />
    );
  };

  if (selectedAnnouncement) {
    return renderDetailView();
  }

  if (loading && announcements.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={announcements}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        ListHeaderComponent={<Text style={styles.header}>Announcements</Text>}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  detailContainer: {
    flex: 1,
  },
  detailContent: {
    paddingHorizontal: rs(60),
  },
  header: {
    color: 'white',
    fontSize: rs(32),
    marginBottom: rs(40),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: rs(20),
  },
  detailHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(60),
    marginTop: rs(20),
    marginBottom: rs(40),
  },
  detailHeaderTitle: {
    color: 'white',
    fontSize: rs(32),
    fontWeight: '600',
    textAlign: 'center',
  },
  backButtonIcon: {
    padding: rs(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: rs(40),
  },
  card: {
    backgroundColor: 'rgba(20, 20, 20, 0.6)', // Dark glass
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)', // Blue-ish border
    padding: rs(30),
    marginBottom: rs(20),
    marginHorizontal: rs(60),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(10),
  },
  title: {
    color: 'white',
    fontSize: rs(24),
    fontWeight: 'bold',
  },
  date: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: rs(18),
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: rs(20),
  },
  // Detail View Styles
  label: {
    color: 'white',
    fontSize: rs(28),
    marginBottom: rs(16),
    fontWeight: '500',
  },
  valueContainer: {
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: rs(20),
    marginBottom: rs(40),
    width: '100%',
  },
  dateContainer: {
    width: rs(300), // Smaller width for date as per usual design patterns
  },
  valueText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: rs(22),
  },
  cardFocused: {
    transform: [{ scale: 1.02 }],
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slightly lighter
    borderColor: 'white',
  },
  textFocused: {
    color: 'white',
  },
});
