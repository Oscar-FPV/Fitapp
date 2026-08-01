import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { BigButton } from '../components/Buttons';
import { Screen } from '../components/Screen';
import { catalogById, templateById } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import { resolveDayTemplate } from '../store/selectors';
import { useStore } from '../store/useStore';
import { colors, fonts } from '../theme/theme';
import { dateKey, fmtKg, scaleLabel, scaleValue } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Edit'>;

export default function EditSessionScreen({ navigation }: Props) {
  const plan = useStore((s) => s.plan);
  const history = useStore((s) => s.history);
  const settings = useStore((s) => s.settings);
  const editOverrides = useStore((s) => s.editOverrides);
  const setEditOverride = useStore((s) => s.setEditOverride);

  const todayKey = useMemo(() => dateKey(new Date()), []);
  const templateId = resolveDayTemplate(plan, history, todayKey, todayKey);
  const template = templateId ? templateById(templateId) : undefined;

  if (!template || template.exercises.length === 0) {
    return (
      <Screen>
        <BackHeader title="Modifier la séance" onBack={() => navigation.goBack()} />
        <Text style={styles.empty}>Aucune séance prévue aujourd'hui.</Text>
      </Screen>
    );
  }

  const setsFor = (exerciseId: string, fallback: number) => editOverrides?.[exerciseId] ?? fallback;
  const totalSets = template.exercises.reduce((a, e) => a + setsFor(e.exerciseId, e.sets), 0);

  return (
    <Screen>
      <BackHeader title="Modifier la séance" onBack={() => navigation.goBack()} />
      <Text style={styles.subtitle}>{template.name}</Text>

      {template.exercises.map((e) => {
        const def = catalogById(e.exerciseId);
        const sets = setsFor(e.exerciseId, e.sets);
        const prefix = def.isWeighted ? '+' : '';
        return (
          <View key={e.exerciseId} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowName}>{def.name}</Text>
              <Text style={styles.rowScheme}>
                {sets} × {e.reps} @ {prefix}
                {fmtKg(e.kg)} kg · {scaleLabel(settings.rir)}{' '}
                {scaleValue(e.rpeTarget, settings.rir)}
              </Text>
            </View>
            <Pressable
              onPress={() => setEditOverride(e.exerciseId, Math.max(1, sets - 1))}
              style={styles.stepBtn}
            >
              <Text style={styles.stepLabel}>−</Text>
            </Pressable>
            <Pressable
              onPress={() => setEditOverride(e.exerciseId, Math.min(8, sets + 1))}
              style={styles.stepBtn}
            >
              <Text style={styles.stepLabel}>+</Text>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {template.exercises.length} exos · {totalSets} séries
        </Text>
      </View>

      <BigButton
        label="Enregistrer la séance"
        onPress={() => navigation.goBack()}
        accent={settings.accent}
        height={60}
        fontSize={17}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.textFaint },
  subtitle: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.textMuted, marginLeft: 36, marginBottom: 20, marginTop: -10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 13,
    paddingHorizontal: 14,
    marginBottom: 9,
  },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginBottom: 3 },
  rowScheme: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaint },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.fillPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { fontFamily: fonts.semibold, fontSize: 18, color: colors.textSecondary },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 18,
  },
  totalLabel: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.textMuted },
  totalValue: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.text },
});
