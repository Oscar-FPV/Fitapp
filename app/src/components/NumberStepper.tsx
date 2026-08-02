import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/theme';

export function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  format?: (v: number) => string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => onChange(clamp(value - step))}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          hitSlop={4}
        >
          <Text style={styles.btnLabel}>−</Text>
        </Pressable>
        <Text style={styles.value}>{format ? format(value) : value}</Text>
        <Pressable
          onPress={() => onChange(clamp(value + step))}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          hitSlop={4}
        >
          <Text style={styles.btnLabel}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textFaintest,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.fillPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { backgroundColor: colors.fillPillActive },
  btnLabel: { fontFamily: fonts.semibold, fontSize: 17, color: colors.textSecondary },
  value: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
});
