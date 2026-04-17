import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { FocusableCard } from '../ui/FocusableCard';
import { useAnnouncementStore } from '../../store/useAnnouncementStore';
import { format, parseISO, isValid } from 'date-fns';
import { Announcement } from '../../types/announcement';
import { stripHtml } from '../../utils/stripHtml';
import { StudentStackParamList } from '../../navigation';

type Nav = NativeStackNavigationProp<StudentStackParamList, 'Announcements'>;

const safeFormatDate = (dateString?: string, formatStr: string = 'MMM d') => {
  if (!dateString) return '';
  try {
    const parsed = parseISO(dateString);
    if (isValid(parsed)) return format(parsed, formatStr);
    const fallback = new Date(dateString);
    if (isValid(fallback)) return format(fallback, formatStr);
    return dateString;
  } catch {
    return dateString || '';
  }
};

interface AnnouncementsViewProps {
  /** Focusable (typically the Announcements tab) that the first item's
   * UP press should jump to. Kept for completeness — parent typically
   * uses onFirstItemFocusChange with an imperative requestTVFocus. */
  firstItemNextFocusUp?: any;
  /** Fires true when the first list item receives focus, false when it
   * blurs. Parent wires this to an imperative UP-key handler so UP
   * from the first item jumps to the Announcements tab reliably. */
  onFirstItemFocusChange?: (focused: boolean) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  firstItemNextFocusUp,
  onFirstItemFocusChange,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { announcements, loading, fetchAnnouncements } = useAnnouncementStore();

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleSelect = (item: Announcement) => {
    navigation.navigate('AnnouncementDetail', {
      title: item.title,
      description: item.description,
      createdAt: item.createdAt,
    });
  };

  const AnnouncementItem = ({
    item,
    nextFocusUp,
    onFocusChange,
  }: {
    item: Announcement;
    nextFocusUp?: any;
    onFocusChange?: (focused: boolean) => void;
  }) => (
    <FocusableCard
      onPress={() => handleSelect(item)}
      style={styles.card}
      focusedStyle={styles.cardFocused}
      wrapperStyle={styles.cardWrapper}
      scaleOnFocus={false}
      nextFocusUp={nextFocusUp}
      onFocus={() => onFocusChange?.(true)}
      onBlur={() => onFocusChange?.(false)}
    >
      {({ focused }) => (
        <>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, focused && styles.textFocused]}>
              {item.title}
            </Text>
            <Text style={[styles.date, focused && styles.textFocused]}>
              {safeFormatDate(item.createdAt, 'MMM d')}
            </Text>
          </View>
          <Text
            style={[styles.description, focused && styles.textFocused]}
            numberOfLines={2}
          >
            {stripHtml(item.description)}
          </Text>
        </>
      )}
    </FocusableCard>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: Announcement;
    index: number;
  }) => (
    <AnnouncementItem
      item={item}
      nextFocusUp={index === 0 ? firstItemNextFocusUp : undefined}
      onFocusChange={index === 0 ? onFirstItemFocusChange : undefined}
    />
  );

  if (loading && announcements.length === 0) {
    return (
      <View style={styles.centered}>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: 'white',
    fontSize: rs(32),
    marginBottom: rs(40),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: rs(20),
  },
  listContent: {
    paddingBottom: rs(40),
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
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
  cardFocused: {
    transform: [{ scale: 1.02 }],
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'white',
  },
  textFocused: {
    color: 'white',
  },
});
