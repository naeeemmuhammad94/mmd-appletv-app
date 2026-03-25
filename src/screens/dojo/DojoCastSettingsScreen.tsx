import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { rs } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { DojoStackParamList } from '../../navigation';
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

  const renderContent = () => {
    switch (activeTab) {
      case 'Playback':
        return <PlaybackSection />;
      case 'Offline & Cache':
        return <OfflineCacheSection />;
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
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          focusedStyle={styles.backButtonFocused}
          scaleOnFocus={false}
        >
          {() => <Icon name="arrow-back" size={rs(32)} color="#FFFFFF" />}
        </FocusableCard>
      </View>
      <View style={styles.headerDivider} />

      {/* Body */}
      <View style={styles.body}>
        {/* Left sidebar */}
        <View style={styles.sidebar}>
          {TABS.map(tab => (
            <FocusableCard
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
              ]}
              focusedStyle={styles.tabButtonFocused}
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
    justifyContent: 'center',
    gap: rs(8),
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
  contentPanel: {
    flex: 1,
    position: 'relative',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  contentInner: {
    flex: 1,
  },
});

export default DojoCastSettingsScreen;
