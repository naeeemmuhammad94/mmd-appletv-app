import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rs } from '../../../theme/responsive';
import { FocusableCard } from '../../../components/ui/FocusableCard';
import { useDojoSettingsStore } from '../../../store/useDojoSettingsStore';

interface OfflineCacheSectionProps {
  /** Opt-in hooks for the screen's scoped LEFT-to-tab interceptor. Only the
   *  Clear cached slides button wires these — the Offline toggle is left on
   *  default spatial nav so in-section UP/DOWN between it and Clear cache
   *  behaves naturally. */
  onClearCacheFocus?: () => void;
  onClearCacheBlur?: () => void;
}

const OfflineCacheSection: React.FC<OfflineCacheSectionProps> = ({
  onClearCacheFocus,
  onClearCacheBlur,
}) => {
  const {
    offlineMode,
    cachedSlideCount,
    totalSlideCount,
    toggleOfflineMode,
    clearCache,
  } = useDojoSettingsStore();

  const [isClearing, setIsClearing] = useState(false);

  const fillPercent =
    totalSlideCount > 0 ? cachedSlideCount / totalSlideCount : 0;

  const storageHeading =
    totalSlideCount === 0
      ? 'No slides to cache yet'
      : `Cached: ${cachedSlideCount} of ${totalSlideCount} slides`;

  const handleClearCache = async () => {
    setIsClearing(true);
    await clearCache();
    setIsClearing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline & Cache</Text>

      {/* Offline toggle card */}
      <FocusableCard
        onPress={toggleOfflineMode}
        style={styles.card}
        focusedStyle={styles.cardFocused}
        wrapperStyle={styles.cardWrapperStyle}
        scaleOnFocus={false}
      >
        {() => (
          <View>
            <View style={styles.toggleRow}>
              <Text style={styles.cardLabel}>Offline Version</Text>
              <View
                style={[
                  styles.toggle,
                  offlineMode ? styles.toggleOn : styles.toggleOff,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    offlineMode ? styles.toggleThumbOn : styles.toggleThumbOff,
                  ]}
                />
              </View>
            </View>
            <Text style={styles.cacheTitle}>
              Cache slideshow for offline use
            </Text>
            <Text style={styles.cacheSubtitle}>
              Slides will continue to play even without an internet connection
            </Text>
          </View>
        )}
      </FocusableCard>

      {/* Storage indicator */}
      <Text style={styles.storageHeading}>{storageHeading}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { flex: fillPercent }]} />
        <View style={{ flex: 1 - fillPercent }} />
      </View>

      {/* Clear cache button */}
      <FocusableCard
        onPress={handleClearCache}
        onFocus={onClearCacheFocus}
        onBlur={onClearCacheBlur}
        disabled={isClearing}
        style={[styles.clearButton, isClearing && styles.clearButtonDisabled]}
        focusedStyle={styles.clearButtonFocused}
        wrapperStyle={styles.clearButtonWrapper}
        scaleOnFocus={false}
      >
        {() => (
          <Text style={styles.clearButtonText}>
            {isClearing ? 'Clearing…' : 'Clear cached slides'}
          </Text>
        )}
      </FocusableCard>
      <Text style={styles.helperText}>
        Clearing cache removes offline access
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: rs(40),
  },
  title: {
    fontSize: rs(48),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(32),
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: rs(12),
    padding: rs(28),
    marginBottom: rs(36),
  },
  cardFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  cardWrapperStyle: {
    flex: 0,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(16),
  },
  cardLabel: {
    fontSize: rs(28),
    color: '#FFFFFF',
  },
  toggle: {
    width: rs(60),
    height: rs(34),
    borderRadius: rs(17),
    justifyContent: 'center',
    paddingHorizontal: rs(4),
  },
  toggleOn: {
    backgroundColor: '#4A90E2',
  },
  toggleOff: {
    backgroundColor: '#374151',
  },
  toggleThumb: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(13),
    backgroundColor: '#FFFFFF',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    alignSelf: 'flex-start',
  },
  cacheTitle: {
    fontSize: rs(26),
    color: '#FFFFFF',
    marginBottom: rs(8),
  },
  cacheSubtitle: {
    fontSize: rs(22),
    color: '#9CA3AF',
  },
  storageHeading: {
    fontSize: rs(40),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(20),
  },
  progressTrack: {
    flexDirection: 'row',
    height: rs(10),
    backgroundColor: '#374151',
    borderRadius: rs(5),
    overflow: 'hidden',
    marginBottom: rs(36),
  },
  progressFill: {
    backgroundColor: '#4A90E2',
    borderRadius: rs(5),
  },
  clearButtonWrapper: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: rs(12),
    paddingVertical: rs(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(16),
  },
  clearButtonDisabled: {
    opacity: 0.4,
  },
  clearButtonFocused: {
    borderColor: '#4A90E2',
  },
  clearButtonText: {
    fontSize: rs(30),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  helperText: {
    fontSize: rs(22),
    color: '#9CA3AF',
  },
});

export default OfflineCacheSection;
