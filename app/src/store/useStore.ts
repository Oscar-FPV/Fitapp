import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { templateById } from '../data/catalog';
import { buildSeed } from '../data/seed';
import { DEFAULT_ACCENT } from '../theme/theme';
import { ActiveSession, HistorySession, Settings, TemplateExercise } from '../types/models';
import { dateKey } from '../utils/format';
import { buildSessionSummary, resolveDayTemplate } from './selectors';

const defaultSettings: Settings = {
  rir: false,
  restDefaultSec: 120,
  unit: 'kg',
  autoRest: true,
  accent: DEFAULT_ACCENT,
  numberSize: 64,
};

interface StoreState {
  hydrated: boolean;
  settings: Settings;
  plan: Record<string, string | null>;
  history: HistorySession[];
  active: ActiveSession | null;
  editOverrides: Record<string, number> | null;

  setHydrated: () => void;
  seedIfEmpty: () => void;

  updateSettings: (patch: Partial<Settings>) => void;

  setDayTemplate: (dateK: string, templateId: string | null) => void;
  clearWeek: (dateKeys: string[]) => void;

  setEditOverride: (exerciseId: string, sets: number) => void;

  startSession: () => boolean;
  setKg: (kg: number) => void;
  setReps: (reps: number) => void;
  setRpe: (rpe: number) => void;
  setNote: (note: string) => void;
  setNoteOpen: (open: boolean) => void;
  validateSet: () => { done: boolean };
  decrementRestTick: () => boolean;
  plus30: () => void;
  minus30: () => void;
  skipRest: () => void;
  discardSession: () => void;
  saveSession: (note: string) => HistorySession | null;
}

export function effectiveExercises(
  active: ActiveSession,
  template = templateById(active.templateId)
): TemplateExercise[] {
  if (!template) return [];
  return template.exercises.map((te) => ({
    ...te,
    sets: active.setsOverride?.[te.exerciseId] ?? te.sets,
  }));
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      settings: defaultSettings,
      plan: {},
      history: [],
      active: null,
      editOverrides: null,

      setHydrated: () => set({ hydrated: true }),
      seedIfEmpty: () => {
        const s = get();
        if (s.history.length === 0 && Object.keys(s.plan).length === 0) {
          const seed = buildSeed(new Date());
          set({ plan: seed.plan, history: seed.history });
        }
      },

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      setDayTemplate: (dateK, templateId) =>
        set((s) => ({ plan: { ...s.plan, [dateK]: templateId } })),

      clearWeek: (dateKeys) =>
        set((s) => {
          const plan = { ...s.plan };
          for (const k of dateKeys) plan[k] = null;
          return { plan };
        }),

      setEditOverride: (exerciseId, sets) =>
        set((s) => ({ editOverrides: { ...(s.editOverrides ?? {}), [exerciseId]: sets } })),

      startSession: () => {
        const s = get();
        const todayKey = dateKey(new Date());
        const templateId = resolveDayTemplate(s.plan, s.history, todayKey, todayKey);
        if (!templateId) return false;
        const template = templateById(templateId);
        if (!template || template.exercises.length === 0) return false;
        const firstEx = template.exercises[0];
        const active: ActiveSession = {
          templateId,
          dateKey: todayKey,
          startedAt: Date.now(),
          exerciseIndex: 0,
          setIndex: 0,
          kg: firstEx.kg,
          reps: firstEx.reps,
          rpe: firstEx.rpeTarget,
          log: [],
          screen: 'set',
          rest: 0,
          restTotal: firstEx.restSec,
          lastValidated: null,
          note: '',
          noteOpen: false,
          setsOverride: s.editOverrides,
        };
        set({ active });
        return true;
      },

      setKg: (kg) => set((s) => (s.active ? { active: { ...s.active, kg: Math.max(0, kg) } } : {})),
      setReps: (reps) =>
        set((s) => (s.active ? { active: { ...s.active, reps: Math.max(1, reps) } } : {})),
      setRpe: (rpe) => set((s) => (s.active ? { active: { ...s.active, rpe } } : {})),
      setNote: (note) => set((s) => (s.active ? { active: { ...s.active, note } } : {})),
      setNoteOpen: (open) => set((s) => (s.active ? { active: { ...s.active, noteOpen: open } } : {})),

      validateSet: () => {
        const s = get();
        const active = s.active;
        if (!active) return { done: true };
        const template = templateById(active.templateId);
        if (!template) return { done: true };
        const exList = effectiveExercises(active, template);
        const curEx = exList[active.exerciseIndex];
        const entry = {
          exerciseId: curEx.exerciseId,
          setIndex: active.setIndex,
          kg: active.kg,
          reps: active.reps,
          rpe: active.rpe,
          note: active.note || undefined,
        };
        const log = [...active.log, entry];
        const lastValidated = {
          exerciseId: curEx.exerciseId,
          setIndex: active.setIndex,
          kg: active.kg,
          reps: active.reps,
          rpe: active.rpe,
        };

        const isLastSetOfEx = active.setIndex + 1 >= curEx.sets;
        const isLastEx = active.exerciseIndex + 1 >= exList.length;
        const done = isLastSetOfEx && isLastEx;

        if (done) {
          set({ active: { ...active, log, lastValidated, note: '', noteOpen: false } });
          return { done: true };
        }

        const nextExerciseIndex = isLastSetOfEx ? active.exerciseIndex + 1 : active.exerciseIndex;
        const nextSetIndex = isLastSetOfEx ? 0 : active.setIndex + 1;
        const nextEx = exList[nextExerciseIndex];
        const restSec = curEx.restSec;

        set({
          active: {
            ...active,
            log,
            exerciseIndex: nextExerciseIndex,
            setIndex: nextSetIndex,
            kg: nextEx.kg,
            reps: nextEx.reps,
            rpe: nextEx.rpeTarget,
            rest: restSec,
            restTotal: restSec,
            screen: 'rest',
            lastValidated,
            note: '',
            noteOpen: false,
          },
        });
        return { done: false };
      },

      decrementRestTick: () => {
        const active = get().active;
        if (!active) return false;
        if (active.rest <= 1) {
          set({ active: { ...active, rest: 0 } });
          return true;
        }
        set({ active: { ...active, rest: active.rest - 1 } });
        return false;
      },

      plus30: () =>
        set((s) =>
          s.active
            ? { active: { ...s.active, rest: s.active.rest + 30, restTotal: s.active.restTotal + 30 } }
            : {}
        ),
      minus30: () =>
        set((s) => (s.active ? { active: { ...s.active, rest: Math.max(1, s.active.rest - 30) } } : {})),
      skipRest: () => set((s) => (s.active ? { active: { ...s.active, screen: 'set', rest: 0 } } : {})),

      discardSession: () => set({ active: null }),

      saveSession: (note) => {
        const s = get();
        const active = s.active;
        if (!active) return null;
        const template = templateById(active.templateId);
        if (!template) return null;
        const exList = effectiveExercises(active, template);

        const summary = buildSessionSummary(active.log, exList, s.history);
        const durationSec = Math.round((Date.now() - active.startedAt) / 1000);

        const session: HistorySession = {
          id: `${active.dateKey}-${active.templateId}-${Date.now()}`,
          templateId: active.templateId,
          name: template.name,
          dateKey: active.dateKey,
          durationSec,
          volumeKg: summary.volumeKg,
          setsCount: summary.setsCount,
          avgRpe: summary.avgRpe,
          isPR: summary.isPR,
          prLine: summary.prExerciseName ? `${summary.prExerciseName} · ${summary.prLine}` : undefined,
          note,
          exercises: summary.exercises,
        };

        set({ history: [session, ...s.history], active: null, editOverrides: null });
        return session;
      },
    }),
    {
      name: 'muscu-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

useStore.persist.onFinishHydration(() => {
  useStore.getState().seedIfEmpty();
  useStore.getState().setHydrated();
});

// In case persisted storage was already empty and hydration resolves synchronously
// in some environments, make sure we still flip the flag.
if (useStore.persist.hasHydrated()) {
  useStore.getState().seedIfEmpty();
  useStore.getState().setHydrated();
}
