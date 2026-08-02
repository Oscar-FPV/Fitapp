import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SecondaryButton } from '../components/Buttons';
import { Screen } from '../components/Screen';
import { findExercise, findTemplate } from '../data/catalog';
import { useRestCountdown } from '../hooks/useSessionTicker';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { colors, fonts } from '../theme/theme';
import { fmtKg, mmss, scaleLabel, scaleValue } from '../utils/format';
import { cancelRestEnd, scheduleRestEnd } from '../utils/notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'Rest'>;

export default function RestScreen({ navigation }: Props) {
  const active = useStore((s) => s.active);
  const settings = useStore((s) => s.settings);
  const skipRest = useStore((s) => s.skipRest);
  const plus30 = useStore((s) => s.plus30);
  const minus30 = useStore((s) => s.minus30);
  const discardSession = useStore((s) => s.discardSession);
  const templates = useStore((s) => s.templates);
  const exercises = useStore((s) => s.exercises);

  useRestCountdown(() => navigation.replace('Set'));

  useEffect(() => {
    if (!active) navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [active, navigation]);

  // Describes the set waiting on the other side of the rest, for the notification body.
  const buildSubtitle = () => {
    const s = useStore.getState();
    const a = s.active;
    if (!a) return 'Série suivante';
    const t = findTemplate(s.templates, a.templateId);
    const te = t?.exercises[a.exerciseIndex];
    if (!te) return 'Série suivante';
    const def = findExercise(s.exercises, te.exerciseId);
    const p = def.isWeighted ? '+' : '';
    return `${def.name} · S${a.setIndex + 1} · ${p}${fmtKg(a.kg)} kg × ${a.reps}`;
  };

  const notifyEnabled = settings.restNotification;

  // Schedule the wrist alert once on entry; the countdown itself is in-app only.
  useEffect(() => {
    if (!notifyEnabled) return;
    const a = useStore.getState().active;
    if (a && a.screen === 'rest' && a.rest > 0) scheduleRestEnd(a.rest, buildSubtitle());
    return () => {
      cancelRestEnd();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifyEnabled]);

  const reschedule = () => {
    if (!notifyEnabled) return;
    const a = useStore.getState().active;
    if (a) scheduleRestEnd(a.rest, buildSubtitle());
  };

  const onPlus30 = () => {
    plus30();
    reschedule();
  };
  const onMinus30 = () => {
    minus30();
    reschedule();
  };
  const onSkip = () => {
    cancelRestEnd();
    skipRest();
    navigation.replace('Set');
  };

  if (!active || !active.lastValidated) return <Screen scroll={false} />;

  const template = findTemplate(templates, active.templateId);
  if (!template) return <Screen scroll={false} />;
  const exList = template.exercises;

  const accent = settings.accent;
  const rir = settings.rir;
  const lv = active.lastValidated;
  const finishedCatalog = findExercise(exercises, lv.exerciseId);
  const finishedPrefix = finishedCatalog.isWeighted ? '+' : '';

  const doneHere = active.log.filter((l) => l.exerciseId === lv.exerciseId);

  const curEx = exList[active.exerciseIndex];
  const curCatalog = findExercise(exercises, curEx.exerciseId);
  const isNewExercise = curEx.exerciseId !== lv.exerciseId;
  const curPrefix = curCatalog.isWeighted ? '+' : '';
  const nextTargetLine = `S${active.setIndex + 1} · ${isNewExercise ? curCatalog.name + ' · ' : ''}${curPrefix}${fmtKg(
    active.kg
  )} kg × ${active.reps} · ${scaleLabel(rir)} cible ${scaleValue(active.rpe, rir)}`;

  const pct = 1 - active.rest / Math.max(1, active.restTotal);

  const quit = () => {
    Alert.alert('Quitter la séance ?', 'Les séries déjà validées ne seront pas enregistrées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: () => {
          cancelRestEnd();
          discardSession();
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>
          {template.name} · {mmss((Date.now() - active.startedAt) / 1000)}
        </Text>
        <Pressable hitSlop={8} onPress={quit} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      </View>

      <View style={[styles.restBlock, { backgroundColor: accent }]}>
        <Text style={styles.restLabel}>Repos</Text>
        <Text style={styles.restTime}>{mmss(active.rest)}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, pct * 100))}%` }]} />
        </View>
        <Text style={styles.restSub}>
          S{lv.setIndex + 1} validée · {finishedPrefix}
          {fmtKg(lv.kg)} kg × {lv.reps} · {scaleLabel(rir)} {scaleValue(lv.rpe, rir)}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <SecondaryButton label="+30 s" onPress={onPlus30} />
        <SecondaryButton label="−30 s" onPress={onMinus30} />
        <SecondaryButton label="Passer →" onPress={onSkip} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Prochaine série</Text>
        <Text style={styles.cardValue}>{nextTargetLine}</Text>
      </View>

      <View style={[styles.card, styles.doneCard]}>
        <Text style={styles.cardLabel}>Séries faites · {finishedCatalog.name}</Text>
        {doneHere.map((d) => (
          <View key={d.setIndex} style={styles.doneRow}>
            <Text style={styles.doneSet}>S{d.setIndex + 1}</Text>
            <Text style={styles.doneLoad}>
              {finishedPrefix}
              {fmtKg(d.kg)} kg × {d.reps}
            </Text>
            <Text style={styles.doneRpe}>
              {scaleLabel(rir)} {scaleValue(d.rpe, rir)}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  closeBtn: { width: 44, height: 44, marginRight: -12, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { fontSize: 20, color: colors.textMuted },
  restBlock: { borderRadius: 26, paddingHorizontal: 22, paddingTop: 30, paddingBottom: 26, alignItems: 'center' },
  restLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#fff',
    opacity: 0.85,
  },
  restTime: {
    fontFamily: fonts.bold,
    fontSize: 88,
    letterSpacing: -3,
    lineHeight: 96,
    color: '#fff',
    marginTop: 6,
    marginBottom: 18,
  },
  track: { width: '100%', height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.28)', overflow: 'hidden', marginBottom: 16 },
  fill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },
  restSub: { fontFamily: fonts.regular, fontSize: 14, color: '#fff', opacity: 0.92 },
  actionsRow: { flexDirection: 'row', gap: 9, marginTop: 14, marginBottom: 18 },
  card: { borderWidth: 1, borderColor: colors.borderFaint, borderRadius: 16, padding: 14, paddingHorizontal: 16, marginBottom: 12 },
  doneCard: { paddingBottom: 4 },
  cardLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaintest,
    marginBottom: 7,
  },
  cardValue: { fontFamily: fonts.medium, fontSize: 15, color: '#3D3A36' },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: colors.fillPill,
  },
  doneSet: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, width: 28 },
  doneLoad: { flex: 1, fontFamily: fonts.medium, fontSize: 14.5, color: colors.text },
  doneRpe: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});
