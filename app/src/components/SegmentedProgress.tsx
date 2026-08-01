import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/theme';

export function SegmentedProgress({
  count,
  current,
  accent,
}: {
  count: number;
  current: number;
  accent: string;
}) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.seg,
            { backgroundColor: i < current ? colors.text : i === current ? accent : colors.borderFaint },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5 },
  seg: { flex: 1, height: 5, borderRadius: 3 },
});
