import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { EmptyState } from '../components/EmptyState';
import { Pill } from '../components/Pill';
import { Screen } from '../components/Screen';
import { MUSCLE_GROUPS } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import { exerciseStats } from '../store/selectors';
import { useStore } from '../store/useStore';
import { colors, fonts } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Exos'>;

export default function ExosScreen({ navigation }: Props) {
  const exercises = useStore((s) => s.exercises);
  const history = useStore((s) => s.history);
  const accent = useStore((s) => s.settings.accent);
  const [filter, setFilter] = useState('Tous');
  const today = useMemo(() => new Date(), []);

  // Only offer filters for groups the user actually has exercises in.
  const usedGroups = useMemo(
    () => MUSCLE_GROUPS.filter((g) => exercises.some((e) => e.group === g)),
    [exercises]
  );

  const rows = useMemo(
    () =>
      exercises
        .filter((e) => filter === 'Tous' || e.group === filter)
        .map((e) => exerciseStats(history, exercises, e.id, today)),
    [exercises, history, filter, today]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <BackHeader title="Exercices" onBack={() => navigation.goBack()} />
        <Pressable
          onPress={() => navigation.navigate('ExoEdit', {})}
          style={[styles.addBtn, { backgroundColor: accent }]}
          hitSlop={8}
        >
          <Text style={styles.addIcon}>+</Text>
        </Pressable>
      </View>

      {exercises.length === 0 ? (
        <EmptyState
          title="Aucun exercice"
          body="Créez vos exercices une fois — ils sont gardés en mémoire et servent ensuite à composer vos séances."
          actionLabel="+ Créer un exercice"
          onAction={() => navigation.navigate('ExoEdit', {})}
          accent={accent}
        />
      ) : (
        <>
          {usedGroups.length > 1 ? (
            <View style={styles.filters}>
              <Pill label="Tous" selected={filter === 'Tous'} onPress={() => setFilter('Tous')} />
              {usedGroups.map((g) => (
                <Pill key={g} label={g} selected={filter === g} onPress={() => setFilter(g)} />
              ))}
            </View>
          ) : null}

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
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addIcon: { fontFamily: fonts.regular, fontSize: 28, color: '#fff', lineHeight: 32 },
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
