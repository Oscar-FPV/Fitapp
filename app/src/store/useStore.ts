import { create } from 'zustand';
import { findExercise, findTemplate, newId } from '../data/catalog';
import { DEFAULT_ACCENT } from '../theme/theme';
import {
  ActiveSession,
  ExerciseDef,
  HistorySession,
  Settings,
  TemplateExercise,
  WorkoutTemplate,
} from '../types/models';
import { dateKey } from '../utils/format';
import { loadPersisted, PersistedState, savePersisted } from './persistence';
import { buildSessionSummary } from './selectors';

const defaultSettings: Settings = {
  rir: false,
  restDefaultSec: 120,
  unit: 'kg',
  autoRest: true,
  restNotification: true,
  accent: DEFAULT_ACCENT,
  numberSize: 64,
};

export const defaultTemplateExercise = (
  exerciseId: string,
  restDefaultSec: number
): TemplateExercise => ({
  exerciseId,
  sets: 3,
  reps: 10,
  kg: 20,
  rpeTarget: 8,
  restSec: restDefaultSec,
});

interface StoreState {
  settings: Settings;
  exercises: ExerciseDef[];
  templates: WorkoutTemplate[];
  plan: Record<string, string | null>;
  history: HistorySession[];
  active: ActiveSession | null;

  updateSettings: (patch: Partial<Settings>) => void;

  addExercise: (input: Omit<ExerciseDef, 'id'>) => ExerciseDef;
  updateExercise: (id: string, patch: Partial<Omit<ExerciseDef, 'id'>>) => void;
  deleteExercise: (id: string) => void;

  createTemplate: (name: string) => WorkoutTemplate;
  renameTemplate: (id: string, name: string) => void;
  deleteTemplate: (id: string) => void;
  addExerciseToTemplate: (templateId: string, exerciseId: string) => void;
  removeExerciseFromTemplate: (templateId: string, index: number) => void;
  updateTemplateExercise: (
    templateId: string,
    index: number,
    patch: Partial<TemplateExercise>
  ) => void;
  moveTemplateExercise: (templateId: string, index: number, direction: -1 | 1) => void;

  setDayTemplate: (dateK: string, templateId: string | null) => void;
  clearWeek: (dateKeys: string[]) => void;

  startSession: (templateId: string) => boolean;
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
  resetAll: () => void;
}

export const useStore = create<StoreState>()((set, get) => ({
    settings: defaultSettings,
    exercises: [],
    templates: [],
    plan: {},
    history: [],
    active: null,

    updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

    addExercise: (input) => {
      const ex: ExerciseDef = { ...input, id: newId('ex') };
      set((s) => ({ exercises: [...s.exercises, ex] }));
      return ex;
    },

    updateExercise: (id, patch) =>
      set((s) => ({
        exercises: s.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      })),

    // Removing an exercise also strips it from every session that used it, so
    // templates can never reference a definition that no longer exists.
    deleteExercise: (id) =>
      set((s) => ({
        exercises: s.exercises.filter((e) => e.id !== id),
        templates: s.templates.map((t) => ({
          ...t,
          exercises: t.exercises.filter((te) => te.exerciseId !== id),
        })),
      })),

    createTemplate: (name) => {
      const t: WorkoutTemplate = { id: newId('tpl'), name, exercises: [] };
      set((s) => ({ templates: [...s.templates, t] }));
      return t;
    },

    renameTemplate: (id, name) =>
      set((s) => ({
        templates: s.templates.map((t) => (t.id === id ? { ...t, name } : t)),
      })),

    deleteTemplate: (id) =>
      set((s) => {
        const plan = { ...s.plan };
        for (const k of Object.keys(plan)) if (plan[k] === id) plan[k] = null;
        return { templates: s.templates.filter((t) => t.id !== id), plan };
      }),

    addExerciseToTemplate: (templateId, exerciseId) =>
      set((s) => ({
        templates: s.templates.map((t) =>
          t.id === templateId
            ? {
                ...t,
                exercises: [
                  ...t.exercises,
                  defaultTemplateExercise(exerciseId, s.settings.restDefaultSec),
                ],
              }
            : t
        ),
      })),

    removeExerciseFromTemplate: (templateId, index) =>
      set((s) => ({
        templates: s.templates.map((t) =>
          t.id === templateId
            ? { ...t, exercises: t.exercises.filter((_, i) => i !== index) }
            : t
        ),
      })),

    updateTemplateExercise: (templateId, index, patch) =>
      set((s) => ({
        templates: s.templates.map((t) =>
          t.id === templateId
            ? {
                ...t,
                exercises: t.exercises.map((te, i) => (i === index ? { ...te, ...patch } : te)),
              }
            : t
        ),
      })),

    moveTemplateExercise: (templateId, index, direction) =>
      set((s) => ({
        templates: s.templates.map((t) => {
          if (t.id !== templateId) return t;
          const target = index + direction;
          if (target < 0 || target >= t.exercises.length) return t;
          const list = t.exercises.slice();
          [list[index], list[target]] = [list[target], list[index]];
          return { ...t, exercises: list };
        }),
      })),

    setDayTemplate: (dateK, templateId) =>
      set((s) => ({ plan: { ...s.plan, [dateK]: templateId } })),

    clearWeek: (dateKeys) =>
      set((s) => {
        const plan = { ...s.plan };
        for (const k of dateKeys) plan[k] = null;
        return { plan };
      }),

    startSession: (templateId) => {
      const s = get();
      const template = findTemplate(s.templates, templateId);
      if (!template || template.exercises.length === 0) return false;
      const firstEx = template.exercises[0];
      const active: ActiveSession = {
        templateId,
        dateKey: dateKey(new Date()),
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
      };
      set({ active });
      return true;
    },

    setKg: (kg) => set((s) => (s.active ? { active: { ...s.active, kg: Math.max(0, kg) } } : {})),
    setReps: (reps) =>
      set((s) => (s.active ? { active: { ...s.active, reps: Math.max(1, reps) } } : {})),
    setRpe: (rpe) => set((s) => (s.active ? { active: { ...s.active, rpe } } : {})),
    setNote: (note) => set((s) => (s.active ? { active: { ...s.active, note } } : {})),
    setNoteOpen: (open) =>
      set((s) => (s.active ? { active: { ...s.active, noteOpen: open } } : {})),

    validateSet: () => {
      const s = get();
      const active = s.active;
      if (!active) return { done: true };
      const template = findTemplate(s.templates, active.templateId);
      if (!template) return { done: true };
      const exList = template.exercises;
      const curEx = exList[active.exerciseIndex];
      if (!curEx) return { done: true };

      const log = [
        ...active.log,
        {
          exerciseId: curEx.exerciseId,
          setIndex: active.setIndex,
          kg: active.kg,
          reps: active.reps,
          rpe: active.rpe,
          note: active.note || undefined,
        },
      ];
      const lastValidated = {
        exerciseId: curEx.exerciseId,
        setIndex: active.setIndex,
        kg: active.kg,
        reps: active.reps,
        rpe: active.rpe,
      };

      const isLastSetOfEx = active.setIndex + 1 >= curEx.sets;
      const isLastEx = active.exerciseIndex + 1 >= exList.length;

      if (isLastSetOfEx && isLastEx) {
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
          kg: isLastSetOfEx ? nextEx.kg : active.kg,
          reps: isLastSetOfEx ? nextEx.reps : active.reps,
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
          ? {
              active: {
                ...s.active,
                rest: s.active.rest + 30,
                restTotal: s.active.restTotal + 30,
              },
            }
          : {}
      ),
    minus30: () =>
      set((s) =>
        s.active ? { active: { ...s.active, rest: Math.max(1, s.active.rest - 30) } } : {}
      ),
    skipRest: () =>
      set((s) => (s.active ? { active: { ...s.active, screen: 'set', rest: 0 } } : {})),

    discardSession: () => set({ active: null }),

    saveSession: (note) => {
      const s = get();
      const active = s.active;
      if (!active) return null;
      const template = findTemplate(s.templates, active.templateId);
      if (!template) return null;

      const summary = buildSessionSummary(active.log, template.exercises, s.history, s.exercises);
      if (summary.exercises.length === 0) {
        set({ active: null });
        return null;
      }

      const session: HistorySession = {
        id: newId('sess'),
        templateId: active.templateId,
        name: template.name,
        dateKey: active.dateKey,
        durationSec: Math.round((Date.now() - active.startedAt) / 1000),
        volumeKg: summary.volumeKg,
        setsCount: summary.setsCount,
        avgRpe: summary.avgRpe,
        isPR: summary.isPR,
        prLine: summary.prExerciseName
          ? `${summary.prExerciseName} · ${summary.prLine}`
          : undefined,
        note,
        exercises: summary.exercises,
      };

      set({ history: [session, ...s.history], active: null });
      return session;
    },

    resetAll: () =>
      set({ exercises: [], templates: [], plan: {}, history: [], active: null }),
}));

/** Read storage once at boot; call before rendering the app. */
export async function hydrateStore(): Promise<void> {
  const saved = await loadPersisted();
  if (saved) {
    useStore.setState((s) => ({
      settings: { ...s.settings, ...(saved.settings ?? {}) },
      exercises: saved.exercises ?? s.exercises,
      templates: saved.templates ?? s.templates,
      plan: saved.plan ?? s.plan,
      history: saved.history ?? s.history,
      active: saved.active ?? null,
    }));
  }
  useStore.subscribe((state) => savePersisted(state as unknown as PersistedState));
}

export const useExercise = (id: string): ExerciseDef =>
  useStore((s) => findExercise(s.exercises, id));
