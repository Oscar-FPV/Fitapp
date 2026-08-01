import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { Pill } from '../components/Pill';
import { Screen } from '../components/Screen';
import { CATALOG } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import { exerciseStats } from '../store/selectors';
import { useStore } from '../store/useStore';
import { colors, fonts } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Exos'>;

const FILTERS = ['Tous', 'Dos', 'Pecs', 'Jambes', 'Épaules', 'Bras'];

export default function ExosScreen({ navigation }: Props) {
  const history = useStore((s) => s.history);
  const accent = useStore((s) => s.settings.accent);
  const [filter, setFilter] = useState('Tous');
  const today = useMemo(() => new Date(), []);

  const rows = useMemo(
    () =>
      CATALOG.filter((e) => filter === 'Tous' || e.group === filter).map((e) =>
        exerciseStats(history, e.id, today)
      ),
    [history, filter, today]
  );

  return (
    <Screen>
      <BackHeader title="Exercices" onBack={() => navigation.goBack()} />

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pill key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>

      {rows.map((r) => (
        <Pressable
          key={r.exerciseId}
          onPress={() => navigation.navigate('ExoDetail', { exerciseId: r.exerciseId })}
          style={styles.row}
        >
          <View style={styles.rowLeft}>
            <Text style={styles.name}>{r.name}</Text>
            <Text style={styles.meta}>
              {r.group} · {r.freq}
            </Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.best}>{r.bestLine}</Text>
            <Text style={[styles.trend, { color: r.trendUp ? accent : colors.textFaintest }]}>
              {r.trend}
            </Text>
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.fillPill,
  },
  rowLeft: { flex: 1 },
  name: { fontFamily: fonts.semibold, fontSize: 15.5, color: colors.text, marginBottom: 3 },
  meta: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaint },
  rowRight: { alignItems: 'flex-end' },
  best: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  trend: { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
});
