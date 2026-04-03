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
import ProfileIcon from '../../../assets/icons/profile.svg';
import LogoutIcon from '../../../assets/icons/logout.svg';

// Shared glass background (matches Figma)
const GLASS_BG = 'rgba(20, 20, 20, 0.6)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.1)';

interface HomeHeaderProps {
  onTabChange?: (tab: 'Curriculum' | 'Announcements') => void;
  onLogout: () => void;
  activeTab?: 'Curriculum' | 'Announcements';
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onTabChange,
  onLogout,
  activeTab = 'Curriculum',
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();

  const [focusedTab, setFocusedTab] = React.useState<
    'Curriculum' | 'Announcements' | null
  >(null);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [profileFocused, setProfileFocused] = React.useState(false);
  const [logoutFocused, setLogoutFocused] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

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

  const handleProfilePress = () => {
    setShowDropdown(prev => !prev);
  };

  const handleProfileFocus = () => {
    setProfileFocused(true);
    setShowDropdown(true);
  };

  const handleProfileBlur = () => {
    setProfileFocused(false);
    setTimeout(() => {
      if (!logoutFocused) setShowDropdown(false);
    }, 150);
  };

  const handleLogoutPress = () => {
    setShowDropdown(false);
    onLogout();
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

          {/* Curriculum Tab — hug content, no flex */}
          <TouchableOpacity
            onPress={() => handleTabPress('Curriculum')}
            onFocus={() => setFocusedTab('Curriculum')}
            onBlur={() => setFocusedTab(null)}
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
                focusedTab === 'Curriculum' &&
                  activeTab !== 'Curriculum' && {
                    color: theme.colors.background,
                  },
              ]}
            >
              Curriculum
            </Text>
          </TouchableOpacity>

          {/* Announcements Tab — hug content, no flex */}
          <TouchableOpacity
            onPress={() => handleTabPress('Announcements')}
            onFocus={() => setFocusedTab('Announcements')}
            onBlur={() => setFocusedTab(null)}
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
                focusedTab === 'Announcements' &&
                  activeTab !== 'Announcements' && {
                    color: theme.colors.background,
                  },
              ]}
            >
              Announcements
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Profile Button + Dropdown ── */}
        <View style={styles.profileArea}>
          <TouchableOpacity
            onPress={handleProfilePress}
            onFocus={handleProfileFocus}
            onBlur={handleProfileBlur}
            style={[
              styles.profileBtn,
              profileFocused && styles.profileBtnFocused,
            ]}
          >
            <ProfileIcon width={rs(28)} height={rs(28)} />
          </TouchableOpacity>

          {/* Dropdown — glass bg, below profile button */}
          {showDropdown && (
            <View style={styles.dropdown}>
              <Text style={styles.dropdownTitle}>Return to Main Screen</Text>
              <TouchableOpacity
                onFocus={() => setLogoutFocused(true)}
                onBlur={() => {
                  setLogoutFocused(false);
                  setTimeout(() => {
                    if (!profileFocused) setShowDropdown(false);
                  }, 150);
                }}
                onPress={handleLogoutPress}
                style={[
                  styles.logoutRow,
                  logoutFocused && styles.logoutRowFocused,
                ]}
              >
                <LogoutIcon width={rs(22)} height={rs(22)} />
                <Text style={styles.logoutRowText}>Log out</Text>
              </TouchableOpacity>
            </View>
          )}
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
  },
  focusedSearch: {
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ scale: 1.05 }],
  },
  // Tabs — NO flex:1, hug content with padding
  tab: {
    paddingVertical: rs(16),
    paddingHorizontal: rs(40),
    borderRadius: rs(40),
    borderWidth: 3,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  activeFocusedTab: {
    borderColor: 'white',
    transform: [{ scale: 1.05 }],
  },
  focusedItem: {
    backgroundColor: 'white',
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
    color: 'rgba(255,255,255,0.6)',
  },

  // ── Profile + Dropdown ──
  profileArea: {
    position: 'relative',
    alignItems: 'flex-end',
    zIndex: 50,
  },
  profileBtn: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    flexShrink: 0,
  },
  profileBtnFocused: {
    backgroundColor: 'rgba(60,60,60,0.8)',
    borderColor: 'rgba(255,255,255,0.35)',
    transform: [{ scale: 1.06 }],
  },
  dropdown: {
    position: 'absolute',
    top: rs(72),
    right: 0,
    backgroundColor: GLASS_BG,
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    paddingVertical: rs(24),
    paddingHorizontal: rs(32),
    minWidth: rs(320),
  },
  dropdownTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: rs(26),
    fontWeight: '600',
    marginBottom: rs(16),
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    paddingVertical: rs(10),
    paddingHorizontal: rs(8),
    borderRadius: rs(10),
  },
  logoutRowFocused: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  logoutRowText: {
    color: '#9E0000',
    fontSize: rs(24),
    fontWeight: '700',
  },
});
