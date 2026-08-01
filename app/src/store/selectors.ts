import { catalogById, TEMPLATES } from '../data/catalog';
import { HistoryExercise, HistorySession, SetLogEntry, TemplateExercise } from '../types/models';
import { addDays, dateKey, e1rm, fmtKg, startOfWeek } from '../utils/format';

export function suggestedTemplateId(history: HistorySession[]): string | null {
  const order = TEMPLATES.filter((t) => !t.isActiveRest).map((t) => t.id);
  if (order.length === 0) return null;
  const last = history[0];
  if (!last) return order[0];
  const idx = order.indexOf(last.templateId);
  if (idx === -1) return order[0];
  return order[(idx + 1) % order.length];
}

export function resolveDayTemplate(
  plan: Record<string, string | null>,
  history: HistorySession[],
  key: string,
  todayKey: string
): string | null | undefined {
  if (key in plan) return plan[key];
  if (key === todayKey) return suggestedTemplateId(history);
  return undefined;
}

export interface WeekDot {
  date: Date;
  key: string;
  done: boolean;
  isToday: boolean;
}

export function weekDots(history: HistorySession[], today: Date): WeekDot[] {
  const start = startOfWeek(today);
  const todayKey = dateKey(today);
  const doneSet = new Set(history.map((h) => h.dateKey));
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const key = dateKey(d);
    return { date: d, key, done: doneSet.has(key), isToday: key === todayKey };
  });
}

export function weekSessionProgress(
  plan: Record<string, string | null>,
  history: HistorySession[],
  today: Date
): { done: number; planned: number } {
  const start = startOfWeek(today);
  const todayKey = dateKey(today);
  let planned = 0;
  let done = 0;
  for (let i = 0; i < 7; i++) {
    const key = dateKey(addDays(start, i));
    const resolved = resolveDayTemplate(plan, history, key, todayKey);
    if (resolved) planned++;
    if (history.some((h) => h.dateKey === key)) done++;
  }
  return { done, planned: planned || 4 };
}

export interface VolumeBar {
  volumeKg: number;
  pct: number;
  label: string;
}

export function last5SessionsVolume(history: HistorySession[]): VolumeBar[] {
  const last5 = history.slice(0, 5).slice().reverse();
  const max = Math.max(1, ...last5.map((h) => h.volumeKg));
  return last5.map((h, i) => ({
    volumeKg: h.volumeKg,
    pct: h.volumeKg / max,
    label: i === last5.length - 1 ? 'auj.' : `J-${last5.length - 1 - i}`,
  }));
}

export function volumeTotalChangePct(history: HistorySession[]): number {
  const sum = (arr: HistorySession[]) => arr.reduce((a, h) => a + h.volumeKg, 0);
  const a = sum(history.slice(0, 5));
  const b = sum(history.slice(5, 10));
  if (b === 0) return 0;
  return Math.round(((a - b) / b) * 100);
}

export interface GroupVolume {
  name: string;
  sets: number;
  pct: number;
}

export function volumeByGroup4Weeks(history: HistorySession[], today: Date): GroupVolume[] {
  const cutoffKey = dateKey(addDays(today, -28));
  const groups: Record<string, number> = {};
  for (const h of history) {
    if (h.dateKey < cutoffKey) continue;
    for (const ex of h.exercises) {
      const g = catalogById(ex.exerciseId).group;
      groups[g] = (groups[g] ?? 0) + ex.sets.length;
    }
  }
  const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, n]) => n));
  return entries.slice(0, 3).map(([name, sets]) => ({ name, sets, pct: sets / max }));
}

export interface SessionSummary {
  exercises: HistoryExercise[];
  volumeKg: number;
  setsCount: number;
  avgRpe: number;
  isPR: boolean;
  prExerciseName?: string;
  prLine?: string;
  prPreviousLine?: string;
  prPct?: number;
}

function bestHistoricalSet(
  history: HistorySession[],
  exerciseId: string
): { e1rm: number; kg: number; reps: number } | null {
  let best: { e1rm: number; kg: number; reps: number } | null = null;
  for (const h of history) {
    const he = h.exercises.find((e) => e.exerciseId === exerciseId);
    if (!he) continue;
    for (const s of he.sets) {
      const v = e1rm(s.kg, s.reps);
      if (!best || v > best.e1rm) best = { e1rm: v, kg: s.kg, reps: s.reps };
    }
  }
  return best;
}

export function buildSessionSummary(
  log: SetLogEntry[],
  exList: TemplateExercise[],
  history: HistorySession[]
): SessionSummary {
  const exercises: HistoryExercise[] = exList
    .map((te) => ({
      exerciseId: te.exerciseId,
      name: catalogById(te.exerciseId).name,
      sets: log
        .filter((l) => l.exerciseId === te.exerciseId)
        .map((l) => ({ kg: l.kg, reps: l.reps, rpe: l.rpe })),
    }))
    .filter((e) => e.sets.length > 0);

  const volumeKg = log.reduce((a, l) => a + l.kg * l.reps, 0);
  const setsCount = log.length;
  const avgRpe = setsCount ? log.reduce((a, l) => a + l.rpe, 0) / setsCount : 0;

  let isPR = false;
  let bestMargin = 0;
  let prExerciseName: string | undefined;
  let prLine: string | undefined;
  let prPreviousLine: string | undefined;
  let prPct: number | undefined;

  for (const ex of exercises) {
    const prior = bestHistoricalSet(history, ex.exerciseId);
    const priorBest = prior?.e1rm ?? 0;
    const sessionBestSet = ex.sets.reduce((a, b) => (e1rm(b.kg, b.reps) > e1rm(a.kg, a.reps) ? b : a));
    const sessionBest = e1rm(sessionBestSet.kg, sessionBestSet.reps);
    if (sessionBest > priorBest) {
      const margin = sessionBest - priorBest;
      if (!isPR || margin > bestMargin) {
        isPR = true;
        bestMargin = margin;
        prExerciseName = ex.name;
        prLine = `${fmtKg(sessionBestSet.kg)} kg × ${sessionBestSet.reps}`;
        prPreviousLine = prior ? `${fmtKg(prior.kg)} kg × ${prior.reps}` : undefined;
        prPct = prior && priorBest > 0 ? Math.round(((sessionBest - priorBest) / priorBest) * 100) : undefined;
      }
    }
  }

  return {
    exercises,
    volumeKg: Math.round(volumeKg),
    setsCount,
    avgRpe: Math.round(avgRpe * 10) / 10,
    isPR,
    prExerciseName,
    prLine,
    prPreviousLine,
    prPct,
  };
}

export interface LastTimeSet {
  kg: number;
  reps: number;
  rpe: number;
  found: boolean;
}

export function lastTimeForExerciseSet(
  history: HistorySession[],
  exerciseId: string,
  setIndex: number,
  fallback: { kg: number; reps: number; rpe: number }
): LastTimeSet {
  const past = history.find((h) => h.exercises.some((e) => e.exerciseId === exerciseId));
  if (!past) return { ...fallback, found: false };
  const ex = past.exercises.find((e) => e.exerciseId === exerciseId)!;
  const s = ex.sets[Math.min(setIndex, ex.sets.length - 1)];
  return { kg: s.kg, reps: s.reps, rpe: s.rpe, found: true };
}

export interface ExerciseStats {
  exerciseId: string;
  name: string;
  group: string;
  freq: string;
  isWeighted: boolean;
  hasData: boolean;
  bestLine: string;
  bestE1rm: number;
  trend: string;
  trendUp: boolean;
  bars: { pct: number }[];
  log: { dateKey: string; load: string; rpe: number }[];
  lastSessionDaysAgo: number | null;
}

export function exerciseStats(
  history: HistorySession[],
  exerciseId: string,
  today: Date
): ExerciseStats {
  const def = catalogById(exerciseId);
  const prefix = def.isWeighted ? '+' : '';

  const appearances = history
    .filter((h) => h.exercises.some((e) => e.exerciseId === exerciseId))
    .map((h) => ({
      dateKey: h.dateKey,
      sets: h.exercises.find((e) => e.exerciseId === exerciseId)!.sets,
    }));

  if (appearances.length === 0) {
    return {
      exerciseId,
      name: def.name,
      group: def.group,
      freq: def.freq,
      isWeighted: def.isWeighted,
      hasData: false,
      bestLine: '—',
      bestE1rm: 0,
      trend: '—',
      trendUp: false,
      bars: [],
      log: [],
      lastSessionDaysAgo: null,
    };
  }

  let best = { e1rm: 0, kg: 0, reps: 0 };
  for (const a of appearances) {
    for (const s of a.sets) {
      const v = e1rm(s.kg, s.reps);
      if (v > best.e1rm) best = { e1rm: v, kg: s.kg, reps: s.reps };
    }
  }

  const perSessionBest = appearances
    .slice(0, 8)
    .slice()
    .reverse()
    .map((a) => Math.max(...a.sets.map((s) => e1rm(s.kg, s.reps))));
  // Scale across the min–max range (floored at 35%) rather than from zero, so
  // week-to-week differences stay visible on loads that only move a few percent.
  const maxBar = Math.max(...perSessionBest);
  const minBar = Math.min(...perSessionBest);
  const span = maxBar - minBar;
  const bars = perSessionBest.map((v) => ({
    pct: span === 0 ? 1 : 0.35 + 0.65 * ((v - minBar) / span),
  }));

  const recent = perSessionBest.slice(-3);
  const older = perSessionBest.slice(-6, -3);
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const recentAvg = avg(recent);
  const olderAvg = avg(older);
  const change = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;

  const log = appearances.slice(0, 4).map((a) => {
    const top = a.sets.reduce((x, y) => (e1rm(y.kg, y.reps) > e1rm(x.kg, x.reps) ? y : x));
    return {
      dateKey: a.dateKey,
      load: `${prefix}${fmtKg(top.kg)} kg × ${top.reps}`,
      rpe: top.rpe,
    };
  });

  const lastDate = new Date(appearances[0].dateKey + 'T00:00:00');
  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);
  const daysAgo = Math.max(
    0,
    Math.round((todayMidnight.getTime() - lastDate.getTime()) / 86400000)
  );

  return {
    exerciseId,
    name: def.name,
    group: def.group,
    freq: def.freq,
    isWeighted: def.isWeighted,
    hasData: true,
    bestLine: `${prefix}${fmtKg(best.kg)} kg × ${best.reps}`,
    bestE1rm: Math.round(best.e1rm),
    trend: change === 0 ? '=' : `${change > 0 ? '+' : ''}${change} %`,
    trendUp: change > 0,
    bars,
    log,
    lastSessionDaysAgo: daysAgo,
  };
}

export function historyStats4Weeks(history: HistorySession[], today: Date) {
  const cutoffKey = dateKey(addDays(today, -28));
  const prevCutoffKey = dateKey(addDays(today, -56));
  const recent = history.filter((h) => h.dateKey >= cutoffKey);
  const prev = history.filter((h) => h.dateKey >= prevCutoffKey && h.dateKey < cutoffKey);
  const volume = recent.reduce((a, h) => a + h.volumeKg, 0);
  const prevVolume = prev.reduce((a, h) => a + h.volumeKg, 0);
  const changePct = prevVolume === 0 ? 0 : Math.round(((volume - prevVolume) / prevVolume) * 100);
  return { sessions: recent.length, volumeKg: volume, changePct };
}
