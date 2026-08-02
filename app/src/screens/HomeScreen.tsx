import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton, SecondaryButton } from '../components/Buttons';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { GroupBars } from '../components/GroupBars';
import { HistogramBars } from '../components/HistogramBars';
import { Screen } from '../components/Screen';
import { WeekDots } from '../components/WeekDots';
import { findTemplate, sessionTag } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import {
  last5SessionsVolume,
  resolveDayTemplate,
  volumeByGroup4Weeks,
  volumeTotalChangePct,
  weekDots,
  weekSessionProgress,
} from '../store/selectors';
import { useStore } from '../store/useStore';
import { colors, fonts } from '../theme/theme';
import { dateKey, dateLabelShort, pct } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const plan = useStore((s) => s.plan);
  const history = useStore((s) => s.history);
  const exercises = useStore((s) => s.exercises);
  const templates = useStore((s) => s.templates);
  const accent = useStore((s) => s.settings.accent);
  const startSession = useStore((s) => s.startSession);

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => dateKey(today), [today]);

  const todayTemplateId = resolveDayTemplate(plan, todayKey);
  const template = findTemplate(templates, todayTemplateId);

  const progress = useMemo(() => weekSessionProgress(plan, history, today), [plan, history, today]);
  const dots = useMemo(() => weekDots(plan, history, today), [plan, history, today]);
  const volumeBars = useMemo(() => last5SessionsVolume(history), [history]);
  const volumeChange = useMemo(() => volumeTotalChangePct(history), [history]);
  const groups = useMemo(
    () => volumeByGroup4Weeks(history, exercises, today),
    [history, exercises, today]
  );

  const isFirstRun = exercises.length === 0 && templates.length === 0;

  const handleStart = () => {
    if (todayTemplateId && startSession(todayTemplateId)) navigation.navigate('Set');
  };

  return (
    <Screen>
      <View style={styles.topRow}>
        <Text style={styles.dateLabel}>{dateLabelShort(today)}</Text>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsBtn}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
      </View>

      {isFirstRun ? (
        <EmptyState
          title="Bienvenue"
          body="Commencez par créer vos exercices, composez ensuite vos séances, puis placez-les dans le planning."
          actionLabel="+ Créer mon premier exercice"
          onAction={() => navigation.navigate('ExoEdit', {})}
          accent={accent}
        />
      ) : (
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>Aujourd'hui</Text>
          {template && template.exercises.length > 0 ? (
            <>
              <Text style={styles.todayTitle}>{template.name}</Text>
              <Text style={styles.todaySub}>{sessionTag(template)}</Text>
              <BigButton label="▶ COMMENCER" onPress={handleStart} accent={accent} />
            </>
          ) : template ? (
            <>
              <Text style={styles.todayTitle}>{template.name}</Text>
              <Text style={styles.todaySub}>Cette séance ne contient aucun exercice</Text>
              <SecondaryButton
                label="Composer la séance"
                onPress={() => navigation.navigate('SessionEdit', { templateId: template.id })}
                flex={false}
              />
            </>
          ) : (
            <>
              <Text style={styles.todayTitle}>Repos</Text>
              <Text style={styles.todaySub}>Aucune séance prévue aujourd'hui</Text>
              <SecondaryButton
                label="Planifier"
                onPress={() => navigation.navigate('Planning')}
                flex={false}
              />
            </>
          )}
        </View>
      )}

      <View style={styles.secondaryRow}>
        <SecondaryButton label="Séances" onPress={() => navigation.navigate('Sessions')} />
        <SecondaryButton label="Planning" onPress={() => navigation.navigate('Planning')} />
        <SecondaryButton label="Exos" onPress={() => navigation.navigate('Exos')} />
      </View>

      {history.length > 0 || progress.planned > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cette semaine</Text>
            <Text style={styles.sectionValue}>
              {progress.done} / {progress.planned || '—'}
            </Text>
          </View>
          <View style={styles.dotsWrap}>
            <WeekDots dots={dots} accent={accent} />
          </View>
        </>
      ) : null}

      {history.length >= 2 ? (
        <Card style={styles.volumeCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Volume total</Text>
            <Text style={[styles.cardValueAccent, { color: accent }]}>{pct(volumeChange)}</Text>
          </View>
          <HistogramBars bars={volumeBars} accent={accent} />
        </Card>
      ) : null}

      {groups.length > 0 ? (
        <Card style={styles.groupCard}>
          <Text style={styles.cardTitleWithSub}>
            Volume par groupe <Text style={styles.cardTitleSub}>· 4 semaines</Text>
          </Text>
          <GroupBars groups={groups} />
        </Card>
      ) : null}

      {history.length > 0 ? (
        <Pressable onPress={() => navigation.navigate('History')} style={styles.historyLink}>
          <Text style={styles.historyLinkText}>↓ Historique des séances</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, letterSpacing: 0.3 },
  settingsBtn: {
    width: 44,
    height: 44,
    marginRight: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 18, color: colors.textMuted },
  todayCard: {
    borderWidth: 2,
    borderColor: colors.text,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: 'center',
  },
  todayLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  todayTitle: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
    color: colors.text,
    marginTop: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  todaySub: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.textMuted, marginBottom: 22 },
  secondaryRow: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 30 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  sectionValue: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  dotsWrap: { marginBottom: 26 },
  volumeCard: { padding: 18, marginBottom: 12 },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  cardValueAccent: { fontFamily: fonts.semibold, fontSize: 13 },
  groupCard: { padding: 18, marginBottom: 26 },
  cardTitleWithSub: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, marginBottom: 16 },
  cardTitleSub: { fontFamily: fonts.regular, color: colors.textFaintest },
  historyLink: { alignItems: 'center', padding: 10 },
  historyLinkText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});
