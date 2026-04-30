import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TVFocusGuideView,
} from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchIcon from '../../../assets/icons/search-icon.svg';

// Shared glass background (matches Figma)
const GLASS_BG = 'rgba(20, 20, 20, 0.6)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.1)';
// Mirrors theme.colors.primary — kept as a constant so it can be referenced
// from styles defined outside the component.
const FOCUS_BLUE = '#4A90E2';
// Tint for focused (non-active) items — kept light (~30%) so the blue
// border carries the focus signal cleanly without competing with it.
// The previous 50% tint felt heavy and washed out the border.
const FOCUS_BLUE_TINT = 'rgba(74,144,226,0.3)';
// Soft drop-shadow color for focused items — gives a subtle "lift" effect
// for tvOS-native focus depth. Matches the blue accent.
const FOCUS_GLOW = 'rgba(74,144,226,0.6)';

interface HomeHeaderProps {
  onTabChange?: (tab: 'Curriculum' | 'Announcements') => void;
  activeTab?: 'Curriculum' | 'Announcements';
  /** Optional refs so parents can target tabs from below (UP into header). */
  curriculumTabRef?: React.Ref<any>;
  announcementsTabRef?: React.Ref<any>;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onTabChange,
  activeTab = 'Curriculum',
  curriculumTabRef,
  announcementsTabRef,
}) => {
  useTheme();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<Record<string, object | undefined>>
    >();
  const route = useRoute();

  const [focusedTab, setFocusedTab] = React.useState<
    'Curriculum' | 'Announcements' | null
  >(null);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [settingsFocused, setSettingsFocused] = React.useState(false);

  const handleSearchPress = () => {
    if (route.name === 'Search') {
      navigation.goBack();
    } else {
      navigation.navigate('Search');
    }
  };

  const handleTabPress = (tab: 'Curriculum' | 'Announcements') => {
    if (onTabChange) onTabChange(tab);
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <TVFocusGuideView autoFocus style={styles.container}>
      <View style={styles.contentContainer}>
        {/* ── Navigation Pill ── */}
        <View style={styles.pillContainer}>
          {/* Search Button — inside pill */}
          <TouchableOpacity
            onPress={handleSearchPress}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={[
              styles.searchButton,
              (searchFocused || route.name === 'Search') &&
                styles.focusedSearch,
            ]}
          >
            <SearchIcon width={rs(24)} height={rs(24)} color="white" />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Curriculum Tab */}
          <TouchableOpacity
            ref={curriculumTabRef}
            onPress={() => handleTabPress('Curriculum')}
            onFocus={() => setFocusedTab('Curriculum')}
            // Guard blur: only clear if we're still the focused tab. Prevents
            // a stale onBlur firing AFTER the sibling's onFocus from wiping
            // out the new focus state (tvOS does not guarantee onBlur runs
            // before the next onFocus — see Curriculum → Announcements bug).
            onBlur={() =>
              setFocusedTab(prev => (prev === 'Curriculum' ? null : prev))
            }
            style={[
              styles.tab,
              activeTab === 'Curriculum' && styles.activeTab,
              focusedTab === 'Curriculum' &&
                activeTab !== 'Curriculum' &&
                styles.focusedItem,
              focusedTab === 'Curriculum' &&
                activeTab === 'Curriculum' &&
                styles.activeFocusedTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Curriculum'
                  ? styles.activeTabText
                  : styles.inactiveTabText,
                focusedTab === 'Curriculum' && styles.focusedItemText,
              ]}
            >
              Curriculum
            </Text>
          </TouchableOpacity>

          {/* Announcements Tab */}
          <TouchableOpacity
            ref={announcementsTabRef}
            onPress={() => handleTabPress('Announcements')}
            onFocus={() => setFocusedTab('Announcements')}
            // Same guard as Curriculum — see note above.
            onBlur={() =>
              setFocusedTab(prev => (prev === 'Announcements' ? null : prev))
            }
            style={[
              styles.tab,
              activeTab === 'Announcements' && styles.activeTab,
              focusedTab === 'Announcements' &&
                activeTab !== 'Announcements' &&
                styles.focusedItem,
              focusedTab === 'Announcements' &&
                activeTab === 'Announcements' &&
                styles.activeFocusedTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Announcements'
                  ? styles.activeTabText
                  : styles.inactiveTabText,
                focusedTab === 'Announcements' && styles.focusedItemText,
              ]}
            >
              Announcements
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Settings Button — navigates to StudentSettingsScreen.
             Replaces the previous profile dropdown (logout now lives inside
             Settings, matching the Dojo Cast pattern). ── */}
        <View style={styles.settingsArea}>
          <TouchableOpacity
            onPress={handleSettingsPress}
            onFocus={() => setSettingsFocused(true)}
            onBlur={() => setSettingsFocused(false)}
            style={[
              styles.settingsBtn,
              settingsFocused && styles.settingsBtnFocused,
            ]}
            accessibilityLabel="Settings"
          >
            <Text
              style={[
                styles.settingsIcon,
                settingsFocused && styles.settingsIconFocused,
              ]}
            >
              {'\u2699'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TVFocusGuideView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: rs(30),
    paddingHorizontal: rs(60),
    paddingBottom: rs(10),
    zIndex: 20,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── Pill ──
  pillContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: GLASS_BG,
    borderRadius: rs(50),
    paddingVertical: rs(10),
    paddingHorizontal: rs(30),
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    marginRight: rs(16),
  },
  divider: {
    width: 1,
    height: rs(32),
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: rs(16),
  },
  searchButton: {
    width: rs(50),
    height: rs(50),
    borderRadius: rs(25),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  focusedSearch: {
    borderWidth: 3,
    borderColor: FOCUS_BLUE,
    backgroundColor: FOCUS_BLUE_TINT,
    transform: [{ scale: 1.1 }],
    shadowColor: FOCUS_GLOW,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  // Tabs — hug content with padding. 3px transparent border keeps layout
  // stable when the focused state swaps to a colored border.
  tab: {
    paddingVertical: rs(16),
    paddingHorizontal: rs(40),
    borderRadius: rs(40),
    borderWidth: 3,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: FOCUS_BLUE,
  },
  // Active tab + focused — bright white ring on top of the blue fill so it
  // stands out clearly against the blue.
  // NOTE: No transform/scale here — scaling a tab inside the pill shifts its
  // visual bounds and confuses the tvOS spatial-navigation engine when
  // navigating between adjacent sibling tabs (e.g. Curriculum → Announcements).
  activeFocusedTab: {
    borderColor: '#FFFFFF',
  },
  // Inactive tab focused — strong blue ring + tinted background.
  // Same reasoning: no scale transform on sibling tabs.
  focusedItem: {
    backgroundColor: FOCUS_BLUE_TINT,
    borderColor: FOCUS_BLUE,
  },
  focusedItemText: {
    color: '#FFFFFF',
  },
  tabText: {
    fontSize: rs(22),
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inactiveTabText: {
    color: 'rgba(255,255,255,0.7)',
  },

  // ── Settings ──
  settingsArea: {
    alignItems: 'flex-end',
    zIndex: 50,
  },
  settingsBtn: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 3,
    borderColor: GLASS_BORDER,
    flexShrink: 0,
  },
  settingsBtnFocused: {
    backgroundColor: FOCUS_BLUE_TINT,
    borderColor: FOCUS_BLUE,
    transform: [{ scale: 1.08 }],
    shadowColor: FOCUS_GLOW,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  settingsIcon: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: rs(32),
  },
  settingsIconFocused: {
    color: '#FFFFFF',
  },
});
