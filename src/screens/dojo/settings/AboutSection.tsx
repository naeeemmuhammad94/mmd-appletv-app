import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rs } from '../../../theme/responsive';

const ABOUT_ROWS = [
  { label: 'App Version', value: '1.0.3' },
  { label: 'Build', value: '2026.01.14' },
  { label: 'Google Account', value: 'mmd.dojocast@gmail.com' },
  { label: 'Device', value: 'Apple TV \u2013 Dojo Cast' },
];

const AboutSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About</Text>
      {ABOUT_ROWS.map((row, index) => (
        <View key={row.label}>
          <View style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{row.value}</Text>
          </View>
          {index < ABOUT_ROWS.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
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
    marginBottom: rs(40),
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
