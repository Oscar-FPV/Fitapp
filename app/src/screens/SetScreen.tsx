import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton, StepButton } from '../components/Buttons';
import { NumberPad } from '../components/NumberPad';
import { RpeChips } from '../components/RpeChips';
import { Screen } from '../components/Screen';
import { SegmentedProgress } from '../components/SegmentedProgress';
import { catalogById, templateById } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import { lastTimeForExerciseSet } from '../store/selectors';
import { effectiveExercises, useStore } from '../store/useStore';
import { colors, fonts } from '../theme/theme';
import { displayWeight, fmtKg, kgToLb, lbToKg, scaleLabel, scaleValue } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Set'>;

export default function SetScreen({ navigation }: Props) {
  const active = useStore((s) => s.active);
  const settings = useStore((s) => s.settings);
  const history = useStore((s) => s.history);
  const setKg = useStore((s) => s.setKg);
  const setReps = useStore((s) => s.setReps);
  const setRpe = useStore((s) => s.setRpe);
  const setNote = useStore((s) => s.setNote);
  const setNoteOpen = useStore((s) => s.setNoteOpen);
  const validateSet = useStore((s) => s.validateSet);
  const discardSession = useStore((s) => s.discardSession);

  const [pad, setPad] = useState<'kg' | 'reps' | null>(null);

  useEffect(() => {
    if (!active) navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [active, navigation]);

  const template = active ? templateById(active.templateId) : undefined;
  const exList = useMemo(
    () => (active && template ? effectiveExercises(active, template) : []),
    [active, template]
  );

  if (!active || !template || exList.length === 0) return <Screen scroll={false} />;

  const curEx = exList[active.exerciseIndex];
  const catalogEntry = catalogById(curEx.exerciseId);
  const unit = settings.unit;
  const accent = settings.accent;

  const lastTime = lastTimeForExerciseSet(history, curEx.exerciseId, active.setIndex, {
    kg: curEx.kg,
    reps: curEx.reps,
    rpe: curEx.rpeTarget,
  });

  const prefix = catalogEntry.isWeighted ? '+' : '';

  const quit = () => {
    const go = () => {
      discardSession();
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    };
    if (active.log.length > 0) {
      Alert.alert(
        'Quitter la séance ?',
        'Les séries déjà validées ne seront pas enregistrées.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Quitter', style: 'destructive', onPress: go },
        ]
      );
    } else {
      go();
    }
  };

  const finishEarly = () => navigation.replace('End');

  const onValidate = () => {
    const result = validateSet();
    if (result.done) {
      navigation.replace('End');
    } else if (settings.autoRest) {
      navigation.replace('Rest');
    }
  };

  const stepKg = (delta: number) => {
    if (unit === 'kg') {
      setKg(Math.round((active.kg + delta) * 20) / 20);
    } else {
      const newLb = Math.max(0, kgToLb(active.kg) + delta);
      setKg(lbToKg(newLb));
    }
  };

  const isLastSetOfEx = active.setIndex + 1 >= curEx.sets;
  const followingEx = exList[active.exerciseIndex + 1];

  const nextSetLine = isLastSetOfEx
    ? 'Exercice suivant'
    : `S${active.setIndex + 2} · ${prefix}${fmtKg(displayVal(active.kg, unit))} ${unit} × ${curEx.reps}`;
  const nextExLine = followingEx
    ? `${catalogById(followingEx.exerciseId).name} · ${followingEx.sets}×${followingEx.reps}`
    : 'Dernier exercice';

  return (
    <Screen scroll style={styles.pad}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>
          Exo {active.exerciseIndex + 1}/{exList.length} · Série {active.setIndex + 1}/{curEx.sets}
        </Text>
        <Pressable hitSlop={8} onPress={quit} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.segWrap}>
        <SegmentedProgress count={curEx.sets} current={active.setIndex} accent={accent} />
      </View>

      <Text style={styles.exName}>{catalogEntry.name}</Text>

      <View style={styles.lastBanner}>
        <Text style={styles.lastLabel}>Dernière fois · série {active.setIndex + 1}</Text>
        <Text style={styles.lastValue}>
          {lastTime.found
            ? `${prefix}${fmtKg(displayVal(lastTime.kg, unit))} ${unit} × ${lastTime.reps} · ${scaleLabel(
                settings.rir
              )} ${scaleValue(lastTime.rpe, settings.rir)}`
            : 'Pas encore de données'}
        </Text>
      </View>

      <View style={styles.fieldsRow}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{unit}</Text>
          <Pressable onPress={() => setPad('kg')}>
            <Text style={[styles.fieldValue, { fontSize: settings.numberSize }]}>
              {prefix}
              {fmtKg(displayVal(active.kg, unit))}
            </Text>
          </Pressable>
          <View style={styles.stepRow}>
            <StepButton label="−2,5" onPress={() => stepKg(-2.5)} />
            <StepButton label="+2,5" onPress={() => stepKg(2.5)} />
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>reps</Text>
          <Pressable onPress={() => setPad('reps')}>
            <Text style={[styles.fieldValue, { fontSize: settings.numberSize }]}>{active.reps}</Text>
          </Pressable>
          <View style={styles.stepRow}>
            <StepButton label="−1" onPress={() => setReps(active.reps - 1)} fontSize={15} />
            <StepButton label="+1" onPress={() => setReps(active.reps + 1)} fontSize={15} />
          </View>
        </View>
      </View>

      <View style={styles.rpeRow}>
        <Text style={styles.rpeLabel}>{scaleLabel(settings.rir)}</Text>
        <RpeChips value={active.rpe} onChange={setRpe} accent={accent} rir={settings.rir} />
      </View>

      {active.noteOpen ? (
        <View style={styles.noteOpenBox}>
          <TextInput
            value={active.note}
            onChangeText={setNote}
            placeholder="Dernière rep un peu grinçante…"
            placeholderTextColor={colors.textFaintest}
            style={styles.noteInput}
          />
          <Pressable onPress={() => setNoteOpen(false)} hitSlop={8}>
            <Text style={[styles.noteOk, { color: accent }]}>OK</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setNoteOpen(true)} style={styles.noteClosedBox}>
          <Text style={styles.noteClosedText} numberOfLines={1}>
            {active.note ? `note ✓ · ${active.note}` : '+ note'}
          </Text>
        </Pressable>
      )}

      <BigButton label="VALIDER LA SÉRIE" onPress={onValidate} accent={accent} height={66} fontSize={19} />

      <View style={styles.suiteBox}>
        <Text style={styles.suiteLabel}>Suite</Text>
        <Text style={styles.suiteLine1}>{nextSetLine}</Text>
        <Text style={styles.suiteLine2}>{nextExLine}</Text>
      </View>

      <Pressable onPress={finishEarly} style={styles.finishLink}>
        <Text style={styles.finishLinkText}>Terminer la séance</Text>
      </Pressable>

      <NumberPad
        visible={pad !== null}
        label={pad === 'kg' ? unit : 'reps'}
        initialValue={pad === 'kg' ? displayVal(active.kg, unit) : active.reps}
        allowDecimal={pad === 'kg'}
        onCancel={() => setPad(null)}
        onConfirm={(v) => {
          if (pad === 'kg') setKg(unit === 'kg' ? v : lbToKg(v));
          else setReps(Math.round(v));
          setPad(null);
        }}
      />
    </Screen>
  );
}

function displayVal(kg: number, unit: 'kg' | 'lb'): number {
  return unit === 'lb' ? Math.round(kgToLb(kg)) : Math.round(kg * 10) / 10;
}

const styles = StyleSheet.create({
  pad: { paddingTop: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, letterSpacing: 0.3 },
  closeBtn: { width: 44, height: 44, marginRight: -12, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { fontSize: 20, color: colors.textMuted },
  segWrap: { marginBottom: 24 },
  exName: {
    fontFamily: fonts.bold,
    fontSize: 36,
    letterSpacing: -1,
    lineHeight: 40,
    color: colors.text,
    marginBottom: 16,
  },
  lastBanner: { backgroundColor: colors.fill, borderRadius: 14, padding: 13, paddingHorizontal: 16, marginBottom: 22 },
  lastLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textFaintest,
    marginBottom: 4,
  },
  lastValue: { fontFamily: fonts.medium, fontSize: 15, color: colors.textSecondary },
  fieldsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  field: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 14, alignItems: 'center' },
  fieldLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaintest,
  },
  fieldValue: {
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -1.5,
    lineHeight: undefined,
    textAlign: 'center',
  },
  stepRow: { flexDirection: 'row', gap: 8, marginTop: 6, width: '100%' },
  rpeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  rpeLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaintest,
    width: 34,
  },
  noteOpenBox: {
    borderWidth: 1,
    borderColor: colors.text,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, padding: 0 },
  noteOk: { fontFamily: fonts.semibold, fontSize: 13, padding: 6 },
  noteClosedBox: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.borderDashed,
    borderStyle: 'dashed',
    borderRadius: 13,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  noteClosedText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.textFaint },
  suiteBox: { borderWidth: 1, borderColor: colors.borderFaint, borderRadius: 16, padding: 14, paddingHorizontal: 16, marginTop: 18 },
  suiteLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaintest,
    marginBottom: 8,
  },
  suiteLine1: { fontFamily: fonts.regular, fontSize: 14, color: '#3D3A36', marginBottom: 5 },
  suiteLine2: { fontFamily: fonts.regular, fontSize: 14, color: colors.textFaint },
  finishLink: { alignItems: 'center', paddingVertical: 18, paddingBottom: 4 },
  finishLinkText: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaintest },
});
