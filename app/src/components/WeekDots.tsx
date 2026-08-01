import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/theme';
import { WeekDot } from '../store/selectors';

export function WeekDots({ dots }: { dots: WeekDot[] }) {
  return (
    <View style={styles.row}>
      {dots.map((d) => (
        <View
          key={d.key}
          style={[
            styles.dot,
            {
              backgroundColor: d.done ? colors.text : colors.bg,
              borderColor: d.done ? colors.text : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  dot: { flex: 1, height: 26, borderRadius: 8, borderWidth: 1.5 },
});
