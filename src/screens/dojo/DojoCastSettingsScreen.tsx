import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  useTVEventHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { rs } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { DojoStackParamList } from '../../navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserEmail, getUserFullName } from '../../utils/authHelpers';
import PlaybackSection from './settings/PlaybackSection';
import OfflineCacheSection from './settings/OfflineCacheSection';
import RotationSection from './settings/RotationSection';
import AboutSection from './settings/AboutSection';

type Nav = NativeStackNavigationProp<DojoStackParamList, 'Settings'>;

type TabId = 'Playback' | 'Offline & Cache' | 'Rotation' | 'About';

const TABS: TabId[] = ['Playback', 'Offline & Cache', 'Rotation', 'About'];

const KARATE_BG =
  'https://images.unsplash.com/photo-1514050566906-8d077bae7046?w=1920&q=80';

const DojoCastSettingsScreen = () => {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<TabId>('Playback');
  const { logout } = useAuthStore();
  const accountEmail = useAuthStore(s => getUserEmail(s.user));
  const accountName = useAuthStore(s => getUserFullName(s.user));
  const showEmailRow = Boolean(accountEmail) && accountName !== accountEmail;

  // --- LEFT-press interceptor (SCOPED) ---
  // Only specific section focusables opt in to LEFT-to-tab behavior via
  // leftEscapeFocused (set via their onFocus/onBlur). Other focusables leave
  // the flag false so LEFT keeps its normal spatial-nav behavior — important
  // for segmented controls like 10s/20s/30s in Playback and Rotate 90° Left /
  // Right / 180° / Reset in Rotation, where LEFT moves between options.
  const tabRefs = useRef<Record<TabId, any>>({} as Record<TabId, any>);
  const leftEscapeFocused = useRef(false);
  const onLeftEscapeFocus = () => {
    leftEscapeFocused.current = true;
  };
  const onLeftEscapeBlur = () => {
    leftEscapeFocused.current = false;
  };

  // UP from the topmost tab (Playback) has no spatial target above it in the
  // sidebar column; wire it explicitly to the header back button via the same
  // imperative interceptor pattern.
  const backButtonRef = useRef<any>(null);
  const playbackTabFocused = useRef(false);
  const onPlaybackTabFocus = () => {
    playbackTabFocused.current = true;
  };
  const onPlaybackTabBlur = () => {
    playbackTabFocused.current = false;
  };

  useTVEventHandler(evt => {
    if (
      (evt?.eventType === 'left' || evt?.eventType === 'swipeLeft') &&
      leftEscapeFocused.current
    ) {
      tabRefs.current[activeTab]?.requestTVFocus?.();
      return;
    }
    if (
      (evt?.eventType === 'up' || evt?.eventType === 'swipeUp') &&
      playbackTabFocused.current
    ) {
      backButtonRef.current?.requestTVFocus?.();
    }
  });

  const handleLogout = async () => {
    await logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Playback':
        return <PlaybackSection />;
      case 'Offline & Cache':
        return (
          <OfflineCacheSection
            onClearCacheFocus={onLeftEscapeFocus}
            onClearCacheBlur={onLeftEscapeBlur}
          />
        );
      case 'Rotation':
        return <RotationSection />;
      case 'About':
        return <AboutSection />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dojo Cast Setting</Text>
        <FocusableCard
          ref={backButtonRef}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          focusedStyle={styles.backButtonFocused}
          wrapperStyle={styles.tabWrapper}
          scaleOnFocus={false}
        >
          {() => <Text style={styles.backButtonIcon}>{'\u2190'}</Text>}
        </FocusableCard>
      </View>
      <View style={styles.headerDivider} />

      {/* Body — sidebar and content panel are horizontally adjacent,
           spatial navigation handles LEFT/RIGHT between them natively */}
      <View style={styles.body}>
        {/* Left sidebar */}
        <View style={styles.sidebar}>
          {TABS.map(tab => (
            <FocusableCard
              key={tab}
              ref={(node: any) => {
                if (node) tabRefs.current[tab] = node;
              }}
              onPress={() => setActiveTab(tab)}
              onFocus={tab === 'Playback' ? onPlaybackTabFocus : undefined}
              onBlur={tab === 'Playback' ? onPlaybackTabBlur : undefined}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
              ]}
              focusedStyle={styles.tabButtonFocused}
              wrapperStyle={styles.tabWrapper}
              scaleOnFocus={false}
            >
              {() => (
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              )}
            </FocusableCard>
          ))}

          {/* Account info + Logout at bottom */}
          <View style={styles.accountSection}>
            {accountName || accountEmail ? (
              <View style={styles.accountInfo}>
                {accountName ? (
                  <Text style={styles.accountName} numberOfLines={1}>
                    {accountName}
                  </Text>
                ) : null}
                {showEmailRow ? (
                  <Text style={styles.accountEmail} numberOfLines={1}>
                    {accountEmail}
                  </Text>
                ) : null}
              </View>
            ) : null}
            <FocusableCard
              onPress={handleLogout}
              style={styles.logoutButton}
              focusedStyle={styles.logoutButtonFocused}
              wrapperStyle={styles.tabWrapper}
              scaleOnFocus={false}
            >
              {({ focused }) => (
                <Text
                  style={[
                    styles.logoutText,
                    focused && styles.logoutTextFocused,
                  ]}
                >
                  Logout
                </Text>
              )}
            </FocusableCard>
          </View>
        </View>

        {/* Right content panel */}
        <View style={styles.contentPanel}>
          <ImageBackground
            source={{ uri: KARATE_BG }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={styles.contentOverlay} />
          <View style={styles.contentInner}>{renderContent()}</View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(48),
    paddingVertical: rs(28),
    backgroundColor: '#0C101E',
  },
  headerTitle: {
    fontSize: rs(42),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(12),
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonFocused: {
    backgroundColor: '#4A90E2',
  },
  backButtonIcon: {
    fontSize: rs(32),
    color: '#FFFFFF',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '33%',
    backgroundColor: '#000000',
    paddingVertical: rs(48),
    paddingHorizontal: rs(32),
    justifyContent: 'flex-start',
    gap: rs(16),
  },
  tabWrapper: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    paddingVertical: rs(22),
    paddingHorizontal: rs(24),
    borderRadius: rs(12),
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4A90E2',
  },
  tabButtonFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: rs(12),
  },
  tabText: {
    fontSize: rs(30),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  accountSection: {
    marginTop: 'auto' as any,
    gap: rs(12),
  },
  accountInfo: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(16),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: rs(12),
    gap: rs(4),
  },
  accountName: {
    fontSize: rs(24),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  accountEmail: {
    fontSize: rs(20),
    color: 'rgba(255,255,255,0.5)',
  },
  logoutButton: {
    paddingVertical: rs(22),
    paddingHorizontal: rs(24),
    borderRadius: rs(12),
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  logoutButtonFocused: {
    backgroundColor: '#DC3545',
    borderColor: '#DC3545',
    borderWidth: 2,
  },
  logoutText: {
    fontSize: rs(30),
    color: '#FF6B6B',
    fontWeight: '500',
  },
  logoutTextFocused: {
    color: '#FFFFFF',
  },
  contentPanel: {
    flex: 1,
    position: 'relative',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  contentInner: {
    flex: 1,
  },
});

export default DojoCastSettingsScreen;
