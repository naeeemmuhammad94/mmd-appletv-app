import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rs } from '../../../theme/responsive';
import { FocusableCard } from '../../../components/ui/FocusableCard';
import { useDojoSettingsStore } from '../../../store/useDojoSettingsStore';

const DURATIONS: Array<10 | 20 | 30> = [10, 20, 30];

const PlaybackSection = () => {
  const { autoAdvance, slideDuration, toggleAutoAdvance, setSlideDuration } =
    useDojoSettingsStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playback</Text>

      {/* Auto-advance toggle */}
      <FocusableCard
        onPress={toggleAutoAdvance}
        style={styles.card}
        focusedStyle={styles.cardFocused}
        wrapperStyle={styles.cardWrapper}
        scaleOnFocus={false}
      >
        {() => (
          <View style={styles.cardInner}>
            <Text style={styles.cardLabel}>Auto-advance slides</Text>
            <View
              style={[
                styles.toggle,
                autoAdvance ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  autoAdvance ? styles.toggleThumbOn : styles.toggleThumbOff,
                ]}
              />
            </View>
          </View>
        )}
      </FocusableCard>
      <Text style={styles.helperText}>
        Slides advance automatically during dojo display.
      </Text>

      {/* Slide duration */}
      <Text style={styles.sectionTitle}>Slide duration</Text>
      <View style={styles.durationContainer}>
        {DURATIONS.map(d => (
          <FocusableCard
            key={d}
            onPress={() => setSlideDuration(d)}
            style={[
              styles.durationSegment,
              slideDuration === d && styles.durationSegmentActive,
            ]}
            focusedStyle={styles.durationSegmentFocused}
            wrapperStyle={styles.durationWrapper}
            scaleOnFocus={false}
          >
            {() => <Text style={styles.durationText}>{d} seconds</Text>}
          </FocusableCard>
        ))}
      </View>
      <Text style={styles.helperText}>
        Slides advance automatically during dojo display.
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
    paddingHorizontal: rs(28),
    paddingVertical: rs(24),
  },
  cardFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  cardWrapper: {
    flex: 0,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  helperText: {
    fontSize: rs(22),
    color: '#9CA3AF',
    marginTop: rs(12),
    marginBottom: rs(36),
  },
  sectionTitle: {
    fontSize: rs(40),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(20),
  },
  durationContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: rs(12),
    overflow: 'hidden',
  },
  durationWrapper: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationSegment: {
    flex: 1,
    paddingVertical: rs(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationSegmentActive: {
    backgroundColor: '#4A90E2',
    borderRadius: rs(12),
  },
  durationSegmentFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: rs(12),
  },
  durationText: {
    fontSize: rs(28),
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PlaybackSection;
