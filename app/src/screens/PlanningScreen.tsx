import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { Screen } from '../components/Screen';
import { sessionTag, TEMPLATES, templateById } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import { resolveDayTemplate } from '../store/selectors';
import { useStore } from '../store/useStore';
import { colors, fonts, radius } from '../theme/theme';
import { addDays, dateKey, dayLongName, startOfWeek } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Planning'>;

const DAY_LABELS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export default function PlanningScreen({ navigation }: Props) {
  const plan = useStore((s) => s.plan);
  const history = useStore((s) => s.history);
  const accent = useStore((s) => s.settings.accent);
  const setDayTemplate = useStore((s) => s.setDayTemplate);
  const clearWeek = useStore((s) => s.clearWeek);

  const [weekOffset, setWeekOffset] = useState(0);
  const [pickDayKey, setPickDayKey] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => dateKey(today), [today]);

  const weekStart = useMemo(
    () => addDays(startOfWeek(today), weekOffset * 7),
    [today, weekOffset]
  );

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        const key = dateKey(date);
        const templateId = resolveDayTemplate(plan, history, key, todayKey) ?? null;
        return { date, key, templateId, isToday: key === todayKey };
      }),
    [weekStart, plan, history, todayKey]
  );

  const workDays = days.filter((d) => {
    const t = d.templateId ? templateById(d.templateId) : undefined;
    return t && !t.isActiveRest;
  });
  const totalSeries = workDays.reduce((a, d) => {
    const t = templateById(d.templateId!);
    return a + (t?.exercises.reduce((x, e) => x + e.sets, 0) ?? 0);
  }, 0);

  const weekRange = `${weekStart.getDate()} – ${addDays(weekStart, 6).getDate()} ${
    MONTHS[addDays(weekStart, 6).getMonth()]
  }`;
  const weekTitle =
    weekOffset === 0 ? 'Cette semaine' : weekOffset === 1 ? 'Semaine prochaine' : weekOffset === -1 ? 'Semaine dernière' : `Semaine ${weekOffset > 0 ? '+' : ''}${weekOffset}`;

  const pickDate = pickDayKey ? new Date(pickDayKey + 'T00:00:00') : null;

  return (
    <Screen>
      <BackHeader title="Planning" onBack={() => navigation.goBack()} />

      <View style={styles.weekNav}>
        <Pressable onPress={() => setWeekOffset((w) => w - 1)} style={styles.navBtn}>
          <Text style={styles.navIcon}>‹</Text>
        </Pressable>
        <View style={styles.weekTitleWrap}>
          <Text style={styles.weekTitle}>{weekTitle}</Text>
          <Text style={styles.weekRange}>{weekRange}</Text>
        </View>
        <Pressable onPress={() => setWeekOffset((w) => w + 1)} style={styles.navBtn}>
          <Text style={styles.navIcon}>›</Text>
        </Pressable>
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {workDays.length} {workDays.length > 1 ? 'séances' : 'séance'} · {totalSeries} séries
        </Text>
        <Pressable onPress={() => clearWeek(days.map((d) => d.key))} hitSlop={8}>
          <Text style={[styles.clearText, { color: accent }]}>Vider</Text>
        </Pressable>
      </View>

      {days.map((d, i) => {
        const t = d.templateId ? templateById(d.templateId) : undefined;
        const stripe = t ? (t.accent ?? (d.isToday ? accent : colors.text)) : colors.fillPill;
        return (
          <Pressable
            key={d.key}
            onPress={() => setPickDayKey(d.key)}
            style={[styles.dayRow, d.isToday && { borderWidth: 2, borderColor: colors.text }]}
          >
            <View style={styles.dayDate}>
              <Text style={[styles.dayName, { color: d.isToday ? accent : colors.textFaintest }]}>
                {DAY_LABELS[i]}
              </Text>
              <Text style={[styles.dayNum, { color: d.isToday ? accent : colors.text }]}>
                {d.date.getDate()}
              </Text>
            </View>
            <View style={[styles.stripe, { backgroundColor: stripe }]} />
            <View style={styles.dayInfo}>
              <Text
                style={[
                  styles.dayTitle,
                  { color: t ? colors.text : colors.textFaint, fontFamily: t ? fonts.semibold : fonts.regular },
                ]}
                numberOfLines={1}
              >
                {t ? t.name : 'Repos'}
              </Text>
              <Text style={styles.dayTag}>{t ? sessionTag(t) : 'libre'}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        );
      })}

      <Text style={styles.hint}>
        Touchez un jour pour y placer une séance. Le bloc suit le nombre de séances faites, pas les
        dates — décaler un jour ne casse pas la progression.
      </Text>

      <Modal
        visible={pickDayKey !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickDayKey(null)}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickDayKey(null)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>
              {pickDate ? `${dayLongName(pickDate)} ${pickDate.getDate()} ${MONTHS[pickDate.getMonth()]}` : ''}
            </Text>
            <Text style={styles.sheetSub}>Quelle séance ce jour-là ?</Text>

            {[...TEMPLATES, null].map((t) => {
              const id = t?.id ?? null;
              const selected =
                pickDayKey !== null &&
                (resolveDayTemplate(plan, history, pickDayKey, todayKey) ?? null) === id;
              const stripe = t ? (t.accent ?? (selected ? accent : colors.text)) : colors.fillPill;
              return (
                <Pressable
                  key={id ?? 'repos'}
                  onPress={() => {
                    if (pickDayKey) setDayTemplate(pickDayKey, id);
                    setPickDayKey(null);
                  }}
                  style={[
                    styles.option,
                    selected ? { borderWidth: 2, borderColor: accent } : null,
                  ]}
                >
                  <View style={[styles.optionStripe, { backgroundColor: stripe }]} />
                  <View style={styles.optionText}>
                    <Text style={[styles.optionName, { color: t ? colors.text : colors.textFaint }]}>
                      {t ? t.name : 'Repos'}
                    </Text>
                    <Text style={styles.optionTag}>{t ? sessionTag(t) : 'aucune séance'}</Text>
                  </View>
                  {selected ? <Text style={[styles.check, { color: accent }]}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  weekNav: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  navBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: { fontSize: 17, color: colors.textSecondary },
  weekTitleWrap: { flex: 1, alignItems: 'center' },
  weekTitle: { fontFamily: fonts.semibold, fontSize: 15.5, color: colors.text },
  weekRange: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaint, marginTop: 2 },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.fill,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.textSecondary },
  clearText: { fontFamily: fonts.semibold, fontSize: 12.5, padding: 4 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 8,
    minHeight: 62,
  },
  dayDate: { width: 44, alignItems: 'center' },
  dayName: { fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase' },
  dayNum: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 23 },
  stripe: { width: 3, alignSelf: 'stretch', borderRadius: 2, marginVertical: 2 },
  dayInfo: { flex: 1, minWidth: 0 },
  dayTitle: { fontSize: 15 },
  dayTag: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint, marginTop: 2 },
  chevron: { fontSize: 16, color: '#CFCAC3' },
  hint: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaintest, lineHeight: 20, marginTop: 14 },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 26,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: fonts.bold, fontSize: 19, letterSpacing: -0.4, color: colors.text, marginBottom: 2 },
  sheetSub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaint, marginBottom: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginBottom: 8,
    minHeight: 58,
  },
  optionStripe: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  optionText: { flex: 1 },
  optionName: { fontFamily: fonts.semibold, fontSize: 15 },
  optionTag: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint, marginTop: 2 },
  check: { fontFamily: fonts.bold, fontSize: 15 },
});
