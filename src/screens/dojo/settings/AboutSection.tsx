import React from 'react';
import { View, Text, StyleSheet, TVFocusGuideView } from 'react-native';
import { rs } from '../../../theme/responsive';
import { FocusableCard } from '../../../components/ui/FocusableCard';
import { useAuthStore } from '../../../store/useAuthStore';
import { getUserEmail } from '../../../utils/authHelpers';

const AboutSection = () => {
  const email = useAuthStore(s => getUserEmail(s.user)) || 'N/A';

  const ABOUT_ROWS = [
    { label: 'App Version', value: '1.0.3' },
    { label: 'Build', value: '2026.01.14' },
    { label: 'Google Account', value: email },
    { label: 'Device', value: 'Apple TV \u2013 Dojo Cast' },
  ];
  return (
    <TVFocusGuideView autoFocus style={styles.container}>
      <Text style={styles.title}>About</Text>

      {/* Focusable info card so focus has somewhere to land */}
      <FocusableCard
        style={styles.infoCard}
        focusedStyle={styles.infoCardFocused}
        wrapperStyle={styles.cardWrapper}
        scaleOnFocus={false}
      >
        {() => (
          <View>
            {ABOUT_ROWS.map((row, index) => (
              <View key={row.label}>
                <View style={styles.row}>
                  <Text style={styles.label}>{row.label}</Text>
                  <Text style={styles.value}>{row.value}</Text>
                </View>
                {index < ABOUT_ROWS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        )}
      </FocusableCard>
    </TVFocusGuideView>
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
    marginBottom: rs(40),
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: rs(12),
    padding: rs(28),
  },
  infoCardFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  cardWrapper: {
    flex: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: rs(28),
  },
  label: {
    fontSize: rs(28),
    color: '#9CA3AF',
  },
  value: {
    fontSize: rs(28),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default AboutSection;
