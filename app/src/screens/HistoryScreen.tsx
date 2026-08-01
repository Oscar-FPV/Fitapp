import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { RootStackParamList } from '../navigation/types';
import { historyStats4Weeks } from '../store/selectors';
import { useStore } from '../store/useStore';
import { colors, fonts } from '../theme/theme';
import { dateLabelShort, fmtKg, mmss, scaleLabel, scaleValue } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const history = useStore((s) => s.history);
  const settings = useStore((s) => s.settings);
  const today = useMemo(() => new Date(), []);
  const stats = useMemo(() => historyStats4Weeks(history, today), [history, today]);
  const accent = settings.accent;

  return (
    <Screen>
      <BackHeader title="Historique" onBack={() => navigation.goBack()} />

      <View style={styles.tilesRow}>
        <Card style={styles.tile}>
          <Text style={styles.tileLabel}>4 semaines</Text>
          <Text style={styles.tileValue}>{stats.sessions}</Text>
          <Text style={styles.tileSub}>séances</Text>
        </Card>
        <Card style={styles.tile}>
          <Text style={styles.tileLabel}>Volume</Text>
          <Text style={styles.tileValue}>{(stats.volumeKg / 1000).toFixed(0)} t</Text>
          <Text style={styles.tileSub}>
            ·{' '}
            <Text style={{ color: accent, fontFamily: fonts.semibold }}>
              {stats.changePct >= 0 ? '+' : ''}
              {stats.changePct} %
            </Text>
          </Text>
        </Card>
      </View>

      {history.length === 0 ? (
        <Text style={styles.empty}>Aucune séance enregistrée pour l'instant.</Text>
      ) : null}

      {history.map((h) => {
        const d = new Date(h.dateKey + 'T00:00:00');
        return (
          <Pressable
            key={h.id}
            onPress={() => navigation.navigate('SessionDetail', { sessionId: h.id })}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.rowTop}>
              <Text style={styles.rowName}>{h.name}</Text>
              <Text style={styles.rowDate}>{dateLabelShort(d)}</Text>
            </View>
            <View style={styles.rowBottom}>
              <Text style={styles.rowMeta}>{mmss(h.durationSec)}</Text>
              <Text style={styles.rowMeta}>{h.volumeKg.toLocaleString('fr-FR')} kg</Text>
              <Text style={styles.rowMeta}>
                {h.setsCount} {h.setsCount > 1 ? 'séries' : 'série'}
              </Text>
              <Text style={[styles.rowPill, { color: h.isPR ? accent : colors.textFaint }]}>
                {h.isPR ? 'PR' : `${scaleLabel(settings.rir)} ${fmtKg(scaleValue(h.avgRpe, settings.rir))}`}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tilesRow: { flexDirection: 'row', gap: 11, marginBottom: 22 },
  tile: { flex: 1, padding: 14, alignItems: 'center' },
  tileLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaint,
  },
  tileValue: { fontFamily: fonts.bold, fontSize: 28, letterSpacing: -0.8, color: colors.text, marginTop: 4 },
  tileSub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.textFaint, textAlign: 'center', paddingVertical: 24 },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 15,
    paddingHorizontal: 17,
    marginBottom: 10,
  },
  rowPressed: { borderColor: colors.text },
  rowTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  rowName: { fontFamily: fonts.semibold, fontSize: 16.5, color: colors.text, flexShrink: 1 },
  rowDate: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaint },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowMeta: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  rowPill: { marginLeft: 'auto', fontFamily: fonts.semibold, fontSize: 13 },
});
