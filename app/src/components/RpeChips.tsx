import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/theme';
import { scaleValue } from '../utils/format';

const RPE_VALUES = [6, 7, 8, 9, 10];

export function RpeChips({
  value,
  onChange,
  accent,
  rir,
}: {
  value: number;
  onChange: (v: number) => void;
  accent: string;
  rir: boolean;
}) {
  return (
    <View style={styles.row}>
      {RPE_VALUES.map((v) => {
        const selected = v === value;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? accent : '#fff',
                borderColor: selected ? accent : colors.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: selected ? '#fff' : colors.textSecondary }]}>
              {scaleValue(v, rir)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', gap: 7 },
  chip: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.semibold, fontSize: 16 },
});
