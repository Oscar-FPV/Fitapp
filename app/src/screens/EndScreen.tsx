import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton } from '../components/Buttons';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { StatTile } from '../components/StatTile';
import { findExercise, findTemplate } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import { buildSessionSummary } from '../store/selectors';
import { useStore } from '../store/useStore';
import { colors, fonts } from '../theme/theme';
import { fmtKg, mmss, scaleLabel, scaleValue } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'End'>;

export default function EndScreen({ navigation }: Props) {
  const active = useStore((s) => s.active);
  const history = useStore((s) => s.history);
  const settings = useStore((s) => s.settings);
  const saveSession = useStore((s) => s.saveSession);

  const [note, setNote] = useState('');

  useEffect(() => {
    if (!active) navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [active, navigation]);

  const templates = useStore((s) => s.templates);
  const exercises = useStore((s) => s.exercises);
  const template = findTemplate(templates, active?.templateId);

  const summary = useMemo(() => {
    if (!active || !template) return null;
    return buildSessionSummary(active.log, template.exercises, history, exercises);
  }, [active, template, history, exercises]);

  if (!active || !template || !summary) return <Screen scroll={false} />;

  const rir = settings.rir;
  const accent = settings.accent;
  const durationSec = Math.round((Date.now() - active.startedAt) / 1000);

  const prevVolume = history[0]?.volumeKg ?? 0;
  const volumeChange =
    prevVolume > 0 ? Math.round(((summary.volumeKg - prevVolume) / prevVolume) * 100) : 0;

  const onSave = () => {
    saveSession(note);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <Screen>
      <Text style={styles.kicker}>Fin de séance</Text>
      <Text style={styles.title}>{template.name}</Text>
      <Text style={styles.duration}>{mmss(durationSec)}</Text>

      <View style={styles.tilesRow}>
        <StatTile
          label="Volume"
          value={summary.volumeKg.toLocaleString('fr-FR')}
          sub={prevVolume > 0 ? `kg · ${volumeChange >= 0 ? '+' : ''}${volumeChange} %` : 'kg'}
          subColor={colors.textMuted}
        />
        <StatTile
          label="Séries"
          value={String(summary.setsCount)}
          sub={`${scaleLabel(rir)} moy. ${fmtKg(scaleValue(summary.avgRpe, rir))}`}
        />
      </View>

      {summary.isPR ? (
        <Card style={styles.prCard} borderWidth={2} borderColor={accent} radiusSize={20}>
          <Text style={[styles.prLabel, { color: accent }]}>Record du jour</Text>
          <View style={styles.prRow}>
            <Text style={styles.prName}>{summary.prExerciseName}</Text>
            <Text style={styles.prValue}>{summary.prLine} ↑</Text>
          </View>
          {summary.prPreviousLine ? (
            <Text style={styles.prPrev}>
              Précédent : {summary.prPreviousLine}
              {summary.prPct !== undefined ? ` · +${summary.prPct} %` : ''}
            </Text>
          ) : (
            <Text style={styles.prPrev}>Premier enregistrement sur cet exercice</Text>
          )}
        </Card>
      ) : null}

      <Card style={styles.detailCard} radiusSize={20}>
        <Text style={styles.detailLabel}>Détail</Text>
        {summary.exercises.map((ex) => {
          const isWeighted = findExercise(exercises, ex.exerciseId).isWeighted;
          const prefix = isWeighted ? '+' : '';
          const reps = ex.sets.map((s) => s.reps);
          const sameReps = reps.every((r) => r === reps[0]);
          const kgs = ex.sets.map((s) => s.kg);
          const sameKg = kgs.every((k) => k === kgs[0]);
          const detail =
            sameReps && sameKg
              ? `${ex.sets.length}×${reps[0]} @ ${prefix}${fmtKg(kgs[0])} kg`
              : ex.sets.map((s) => `${prefix}${fmtKg(s.kg)}×${s.reps}`).join(' · ');
          return (
            <View key={ex.exerciseId} style={styles.detailRow}>
              <Text style={styles.detailName}>{ex.name}</Text>
              <Text style={styles.detailValue}>{detail}</Text>
            </View>
          );
        })}
      </Card>

      <Card style={styles.noteCard} dashed borderColor={colors.borderDashed} radiusSize={16}>
        <Text style={styles.noteLabel}>Note de séance</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Bonne forme, dos solide…"
          placeholderTextColor={colors.textFaintest}
          style={styles.noteInput}
        />
      </Card>

      <BigButton label="Enregistrer" onPress={onSave} accent={accent} height={62} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 10 },
  title: { fontFamily: fonts.bold, fontSize: 34, letterSpacing: -1, lineHeight: 37, color: colors.text },
  duration: {
    fontFamily: fonts.bold,
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 40,
    color: colors.textFaint,
    marginBottom: 20,
  },
  tilesRow: { flexDirection: 'row', gap: 11, marginBottom: 12 },
  prCard: { padding: 16, paddingHorizontal: 18, marginBottom: 12 },
  prLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  prRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  prName: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text, flexShrink: 1 },
  prValue: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  prPrev: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, marginTop: 5 },
  detailCard: { padding: 16, paddingHorizontal: 18, paddingBottom: 8, marginBottom: 12 },
  detailLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaint,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.fillPill,
  },
  detailName: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.text, flexShrink: 1 },
  detailValue: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.textMuted },
  noteCard: { padding: 14, paddingHorizontal: 16, marginBottom: 18 },
  noteLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaintest,
    marginBottom: 6,
  },
  noteInput: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, padding: 0 },
});
