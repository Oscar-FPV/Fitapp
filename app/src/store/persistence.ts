import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveSession, ExerciseDef, HistorySession, Settings, WorkoutTemplate } from '../types/models';

export const STORAGE_KEY = 'muscu-store-v2';

export interface PersistedState {
  settings: Settings;
  exercises: ExerciseDef[];
  templates: WorkoutTemplate[];
  plan: Record<string, string | null>;
  history: HistorySession[];
  active: ActiveSession | null;
}

export function pickPersisted(s: PersistedState): PersistedState {
  return {
    settings: s.settings,
    exercises: s.exercises,
    templates: s.templates,
    plan: s.plan,
    history: s.history,
    active: s.active,
  };
}

export async function loadPersisted(): Promise<Partial<PersistedState> | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Partial<PersistedState>;
  } catch {
    // Corrupt or unreadable storage shouldn't brick the app — start fresh.
    return null;
  }
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pending: PersistedState | null = null;

/** Debounced write — set-by-set logging would otherwise hit storage every tap. */
export function savePersisted(state: PersistedState): void {
  pending = state;
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    const toWrite = pending;
    pending = null;
    if (!toWrite) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pickPersisted(toWrite))).catch(() => {});
  }, 300);
}
