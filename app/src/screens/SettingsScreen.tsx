import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { ACCENTS, colors, fonts } from '../theme/theme';
import { mmss } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SIZES = [48, 56, 64, 72, 78];

export default function SettingsScreen({ navigation }: Props) {
  const settings = useStore((s) => s.settings);
  const history = useStore((s) => s.history);
  const update = useStore((s) => s.updateSettings);
  const accent = settings.accent;

  const rows = [
    {
      key: 'scale',
      label: "Échelle d'effort",
      hint: settings.rir ? 'reps en réserve' : 'effort perçu 6 → 10',
      value: settings.rir ? 'RIR' : 'RPE',
      valueColor: accent,
      onPress: () => update({ rir: !settings.rir }),
    },
    {
      key: 'rest',
      label: 'Repos par défaut',
      hint: 'ajustable par exercice',
      value: mmss(settings.restDefaultSec),
      valueColor: colors.text,
      onPress: () =>
        update({ restDefaultSec: settings.restDefaultSec >= 180 ? 60 : settings.restDefaultSec + 30 }),
    },
    {
      key: 'unit',
      label: 'Unité',
      hint: 'incréments de 2,5',
      value: settings.unit,
      valueColor: colors.text,
      onPress: () => update({ unit: settings.unit === 'kg' ? 'lb' : 'kg' }),
    },
    {
      key: 'autoRest',
      label: 'Chrono automatique',
      hint: 'démarre à la validation',
      value: settings.autoRest ? 'activé' : 'désactivé',
      valueColor: settings.autoRest ? accent : colors.textFaintest,
      onPress: () => update({ autoRest: !settings.autoRest }),
    },
  ];

  // Block progression follows sessions completed, not calendar dates, so shifting
  // a day in Planning never breaks the cycle. 4 sessions per week, 5-week blocks.
  const blockWeek = (Math.floor(history.length / 4) % 5) + 1;

  return (
    <Screen>
      <BackHeader title="Réglages" onBack={() => navigation.goBack()} />

      <Card style={styles.blockCard}>
        <Text style={styles.cardLabel}>Bloc en cours</Text>
        <View style={styles.blockRow}>
          <Text style={styles.blockName}>Hypertrophie</Text>
          <Text style={styles.blockWeek}>semaine {blockWeek} / 5</Text>
        </View>
        <View style={styles.blockBars}>
          {[1, 2, 3, 4, 5].map((w) => (
            <View
              key={w}
              style={[
                styles.blockBar,
                {
                  backgroundColor:
                    w < blockWeek ? colors.text : w === blockWeek ? accent : colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.blockHint}>Deload prévu en semaine 5</Text>
      </Card>

      <Text style={styles.sectionLabel}>Séance</Text>
      <Card style={styles.rowsCard}>
        {rows.map((r, i) => (
          <Pressable
            key={r.key}
            onPress={r.onPress}
            style={[styles.settingRow, i > 0 && styles.settingRowBorder]}
          >
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>{r.label}</Text>
              <Text style={styles.settingHint}>{r.hint}</Text>
            </View>
            <Text style={[styles.settingValue, { color: r.valueColor }]}>{r.value}</Text>
          </Pressable>
        ))}
      </Card>

      <Text style={styles.sectionLabel}>Apparence</Text>
      <Card style={styles.appearanceCard}>
        <Text style={styles.settingLabel}>Couleur d'accent</Text>
        <View style={styles.swatchRow}>
          {ACCENTS.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => update({ accent: a.value })}
              style={[
                styles.swatch,
                { backgroundColor: a.value },
                settings.accent === a.value && styles.swatchSelected,
              ]}
            >
              {settings.accent === a.value ? <Text style={styles.swatchCheck}>✓</Text> : null}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.settingLabel, styles.sizeLabel]}>Taille des chiffres kg / reps</Text>
        <View style={styles.sizeRow}>
          {SIZES.map((s) => (
            <Pressable
              key={s}
              onPress={() => update({ numberSize: s })}
              style={[
                styles.sizeChip,
                settings.numberSize === s && { backgroundColor: colors.text, borderColor: colors.text },
              ]}
            >
              <Text
                style={[
                  styles.sizeChipLabel,
                  settings.numberSize === s && { color: '#fff' },
                ]}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Text style={styles.footer}>v1.0 · données stockées sur l'appareil</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  blockCard: { padding: 16, paddingHorizontal: 18, marginBottom: 22 },
  cardLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaint,
    marginBottom: 8,
  },
  blockRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  blockName: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  blockWeek: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  blockBars: { flexDirection: 'row', gap: 6 },
  blockBar: { flex: 1, height: 8, borderRadius: 4 },
  blockHint: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaintest, marginTop: 10 },
  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaint,
    marginBottom: 10,
  },
  rowsCard: { paddingHorizontal: 16, marginBottom: 22 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    minHeight: 56,
  },
  settingRowBorder: { borderTopWidth: 1, borderTopColor: colors.fillPill },
  settingText: { flex: 1 },
  settingLabel: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  settingHint: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaintest, marginTop: 2 },
  settingValue: { fontFamily: fonts.semibold, fontSize: 14.5 },
  appearanceCard: { padding: 16, paddingHorizontal: 18, marginBottom: 22 },
  swatchRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: { borderWidth: 3, borderColor: colors.text },
  swatchCheck: { color: '#fff', fontFamily: fonts.bold, fontSize: 18 },
  sizeLabel: { marginTop: 20 },
  sizeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  sizeChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeChipLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textSecondary },
  footer: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaintest, textAlign: 'center' },
});
