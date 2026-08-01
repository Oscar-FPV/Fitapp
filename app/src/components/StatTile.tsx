import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors, fonts } from '../theme/theme';

export function StatTile({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {sub ? <Text style={[styles.sub, subColor ? { color: subColor } : null]}>{sub}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center' },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaint,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 34,
    letterSpacing: -0.8,
    color: colors.text,
    marginTop: 4,
  },
  sub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
});
