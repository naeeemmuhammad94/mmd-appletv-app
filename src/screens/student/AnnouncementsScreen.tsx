import React from 'react';
import { View, StyleSheet, useTVEventHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { HomeHeader } from '../../components/student/HomeHeader';
import { AnnouncementsView } from '../../components/student/AnnouncementsView';
import { StudentStackParamList } from '../../navigation';

type Nav = NativeStackNavigationProp<StudentStackParamList, 'Announcements'>;

const AnnouncementsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();

  // Hop to the Announcements tab imperatively via requestTVFocus when UP
  // is pressed while the first list item is focused. Declarative
  // nextFocusUp gets overridden by TVFocusGuideView autoFocus inside
  // HomeHeader, which restores whichever header item was last touched.
  const announcementsTabRef = React.useRef<any>(null);
  const firstItemFocusedAt = React.useRef<number | null>(null);

  useTVEventHandler(evt => {
    if (
      (evt?.eventType === 'up' || evt?.eventType === 'swipeUp') &&
      firstItemFocusedAt.current !== null &&
      Date.now() - firstItemFocusedAt.current > 300
    ) {
      announcementsTabRef.current?.requestTVFocus?.();
    }
  });

  const handleTabChange = (tab: 'Curriculum' | 'Announcements') => {
    if (tab === 'Curriculum') {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HomeHeader
        onTabChange={handleTabChange}
        activeTab="Announcements"
        announcementsTabRef={announcementsTabRef}
      />
      <View style={styles.content}>
        <AnnouncementsView
          onFirstItemFocusChange={focused => {
            firstItemFocusedAt.current = focused ? Date.now() : null;
          }}
        />
      </View>
    </View>
  );
};

export default AnnouncementsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
