import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WeekDot } from '../store/selectors';
import { colors } from '../theme/theme';

export function WeekDots({ dots, accent }: { dots: WeekDot[]; accent: string }) {
  return (
    <View style={styles.row}>
      {dots.map((d) => {
        // Done = filled dark. Planned but not done = outlined, accent on today.
        const bg = d.done ? colors.text : colors.bg;
        const border = d.done
          ? colors.text
          : d.isToday
          ? accent
          : d.planned
          ? colors.textFaintest
          : colors.border;
        return <View key={d.key} style={[styles.dot, { backgroundColor: bg, borderColor: border }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  dot: { flex: 1, height: 26, borderRadius: 8, borderWidth: 1.5 },
});
