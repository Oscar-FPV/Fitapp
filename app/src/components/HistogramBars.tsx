import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/theme';
import { VolumeBar } from '../store/selectors';

const BAR_AREA = 86;

export function HistogramBars({ bars, accent }: { bars: VolumeBar[]; accent: string }) {
  return (
    <View style={styles.row}>
      {bars.map((b, i) => (
        <View key={i} style={styles.col}>
          <View style={styles.barArea}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(6, b.pct * BAR_AREA),
                  backgroundColor: i === bars.length - 1 ? accent : colors.text,
                },
              ]}
            />
          </View>
          <Text style={styles.label}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  col: { flex: 1, alignItems: 'center' },
  barArea: { width: '100%', height: BAR_AREA, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 7 },
  label: { fontFamily: fonts.regular, fontSize: 10.5, color: colors.textFaintest, marginTop: 8 },
});
