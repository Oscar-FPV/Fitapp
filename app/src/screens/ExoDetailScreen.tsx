import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { RootStackParamList } from '../navigation/types';
import { exerciseStats } from '../store/selectors';
import { useStore } from '../store/useStore';
import { colors, fonts } from '../theme/theme';
import { dateLabelShort, scaleLabel, scaleValue } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ExoDetail'>;

export default function ExoDetailScreen({ navigation, route }: Props) {
  const history = useStore((s) => s.history);
  const exercises = useStore((s) => s.exercises);
  const settings = useStore((s) => s.settings);
  const today = useMemo(() => new Date(), []);
  const stats = useMemo(
    () => exerciseStats(history, exercises, route.params.exerciseId, today),
    [history, exercises, route.params.exerciseId, today]
  );
  const accent = settings.accent;

  const lastLabel =
    stats.lastSessionDaysAgo === null
      ? 'jamais travaillé'
      : stats.lastSessionDaysAgo === 0
      ? "dernier travail aujourd'hui"
      : stats.lastSessionDaysAgo === 1
      ? 'dernier travail hier'
      : `dernier travail il y a ${stats.lastSessionDaysAgo} jours`;

  return (
    <Screen>
      <View style={styles.headerRow}>
        <BackHeader subtitle={stats.group} onBack={() => navigation.goBack()} />
        <Pressable
          onPress={() => navigation.navigate('ExoEdit', { exerciseId: stats.exerciseId })}
          hitSlop={8}
          style={styles.editBtn}
        >
          <Text style={[styles.editLabel, { color: accent }]}>Modifier</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{stats.name}</Text>
      <Text style={styles.sub}>
        {stats.freq} · {lastLabel}
      </Text>

      <Card style={styles.prCard} borderWidth={2} borderColor={accent} radiusSize={20}>
        <Text style={[styles.prLabel, { color: accent }]}>Record</Text>
        <View style={styles.prRow}>
          <Text style={styles.prValue}>{stats.bestLine}</Text>
          <Text style={styles.prE1rm}>
            {stats.hasData ? `e1RM est. ${stats.bestE1rm} kg` : 'pas encore de données'}
          </Text>
        </View>
      </Card>

      {stats.bars.length > 0 ? (
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            Charge de travail <Text style={styles.chartTitleSub}>· {stats.bars.length} séances</Text>
          </Text>
          <View style={styles.barsRow}>
            {stats.bars.map((b, i) => (
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(6, b.pct * 96),
                      backgroundColor: i === stats.bars.length - 1 ? accent : colors.text,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.chartAxis}>
            <Text style={styles.axisLabel}>plus ancien</Text>
            <Text style={styles.axisLabel}>récent</Text>
          </View>
        </Card>
      ) : null}

      {stats.log.length > 0 ? (
        <Card style={styles.logCard}>
          <Text style={styles.logLabel}>Dernières séances</Text>
          {stats.log.map((l) => (
            <View key={l.dateKey} style={styles.logRow}>
              <Text style={styles.logDate}>{dateLabelShort(new Date(l.dateKey + 'T00:00:00'))}</Text>
              <Text style={styles.logLoad}>{l.load}</Text>
              <Text style={styles.logRpe}>
                {scaleLabel(settings.rir)} {scaleValue(l.rpe, settings.rir)}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editBtn: { height: 44, justifyContent: 'center', marginBottom: 16 },
  editLabel: { fontFamily: fonts.semibold, fontSize: 14 },
  title: { fontFamily: fonts.bold, fontSize: 34, letterSpacing: -1, lineHeight: 36, color: colors.text, marginBottom: 6 },
  sub: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.textMuted, marginBottom: 20 },
  prCard: { padding: 16, paddingHorizontal: 18, marginBottom: 12 },
  prLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  prRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  prValue: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  prE1rm: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted },
  chartCard: { padding: 18, marginBottom: 12 },
  chartTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, marginBottom: 16 },
  chartTitleSub: { fontFamily: fonts.regular, color: colors.textFaintest },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 7, height: 96 },
  barCol: { flex: 1, justifyContent: 'flex-end', height: '100%' },
  bar: { width: '100%', borderRadius: 6 },
  chartAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  axisLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaintest },
  logCard: { padding: 16, paddingHorizontal: 18, paddingBottom: 8 },
  logLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaint,
    marginBottom: 4,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: colors.fillPill,
  },
  logDate: { fontFamily: fonts.regular, fontSize: 13, color: colors.textFaint, width: 74 },
  logLoad: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  logRpe: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted },
});
