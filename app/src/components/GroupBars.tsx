import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/theme';
import { GroupVolume } from '../store/selectors';

export function GroupBars({ groups }: { groups: GroupVolume[] }) {
  return (
    <View>
      {groups.map((g) => (
        <View key={g.name} style={styles.row}>
          <Text style={styles.name}>{g.name}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.max(4, g.pct * 100)}%` }]} />
          </View>
          <Text style={styles.count}>{g.sets}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  name: { width: 58, fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.fillPill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.text },
  count: {
    width: 30,
    textAlign: 'right',
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.textMuted,
  },
});
