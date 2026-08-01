import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { catalogById } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { colors, fonts } from '../theme/theme';
import { dateLabelShort, fmtKg, scaleLabel, scaleValue } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionDetail'>;

export default function SessionDetailScreen({ navigation, route }: Props) {
  const session = useStore((s) => s.history.find((h) => h.id === route.params.sessionId));
  const rir = useStore((s) => s.settings.rir);

  if (!session) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <Text style={styles.missing}>Séance introuvable.</Text>
      </Screen>
    );
  }

  const d = new Date(session.dateKey + 'T00:00:00');

  return (
    <Screen>
      <BackHeader subtitle={dateLabelShort(d)} onBack={() => navigation.goBack()} />
      <Text style={styles.title}>{session.name}</Text>

      <View style={styles.tilesRow}>
        <Card style={styles.tile}>
          <Text style={styles.tileLabel}>Volume</Text>
          <Text style={styles.tileValue}>{session.volumeKg.toLocaleString('fr-FR')}</Text>
        </Card>
        <Card style={styles.tile}>
          <Text style={styles.tileLabel}>{scaleLabel(rir)} moy.</Text>
          <Text style={styles.tileValue}>{fmtKg(scaleValue(session.avgRpe, rir))}</Text>
        </Card>
      </View>

      {session.exercises.map((ex) => {
        const prefix = catalogById(ex.exerciseId).isWeighted ? '+' : '';
        return (
          <Card key={ex.exerciseId} style={styles.exCard}>
            <Text style={styles.exName}>{ex.name}</Text>
            {ex.sets.map((s, i) => (
              <View key={i} style={styles.setRow}>
                <Text style={styles.setNum}>S{i + 1}</Text>
                <Text style={styles.setLoad}>
                  {prefix}
                  {fmtKg(s.kg)} kg × {s.reps}
                </Text>
                <Text style={styles.setRpe}>
                  {scaleLabel(rir)} {scaleValue(s.rpe, rir)}
                </Text>
              </View>
            ))}
          </Card>
        );
      })}

      {session.note ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>« {session.note} »</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { fontFamily: fonts.regular, fontSize: 14, color: colors.textFaint },
  title: { fontFamily: fonts.bold, fontSize: 34, letterSpacing: -1, lineHeight: 36, color: colors.text, marginBottom: 18 },
  tilesRow: { flexDirection: 'row', gap: 11, marginBottom: 16 },
  tile: { flex: 1, padding: 14, alignItems: 'center' },
  tileLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaint,
  },
  tileValue: { fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.8, color: colors.text, marginTop: 4 },
  exCard: { padding: 14, paddingHorizontal: 16, paddingBottom: 8, marginBottom: 10 },
  exName: { fontFamily: fonts.semibold, fontSize: 15.5, color: colors.text, marginBottom: 4 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.fillPill,
  },
  setNum: { fontFamily: fonts.regular, fontSize: 13, color: colors.textFaint, width: 26 },
  setLoad: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  setRpe: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted },
  noteBox: { backgroundColor: colors.fill, borderRadius: 16, padding: 14, paddingHorizontal: 16 },
  noteText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
});
