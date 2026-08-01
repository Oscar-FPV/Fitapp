export type MuscleGroup = 'Dos' | 'Pecs' | 'Jambes' | 'Épaules' | 'Bras';

export interface ExerciseDef {
  id: string;
  name: string;
  group: MuscleGroup;
  freq: string;
  isWeighted: boolean;
}

export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  kg: number;
  rpeTarget: number;
  restSec: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  shortName: string;
  accent: string | null;
  isActiveRest: boolean;
  exercises: TemplateExercise[];
}

export interface SetLogEntry {
  exerciseId: string;
  setIndex: number;
  kg: number;
  reps: number;
  rpe: number;
  note?: string;
}

export interface ActiveSession {
  templateId: string;
  dateKey: string;
  startedAt: number;
  exerciseIndex: number;
  setIndex: number;
  kg: number;
  reps: number;
  rpe: number;
  log: SetLogEntry[];
  screen: 'set' | 'rest';
  rest: number;
  restTotal: number;
  lastValidated: { exerciseId: string; setIndex: number; kg: number; reps: number; rpe: number } | null;
  note: string;
  noteOpen: boolean;
  setsOverride: Record<string, number> | null;
}

export interface HistorySet {
  kg: number;
  reps: number;
  rpe: number;
}

export interface HistoryExercise {
  exerciseId: string;
  name: string;
  sets: HistorySet[];
}

export interface HistorySession {
  id: string;
  templateId: string;
  name: string;
  dateKey: string;
  durationSec: number;
  volumeKg: number;
  setsCount: number;
  avgRpe: number;
  isPR: boolean;
  prLine?: string;
  note: string;
  exercises: HistoryExercise[];
}

export interface Settings {
  rir: boolean;
  restDefaultSec: number;
  unit: 'kg' | 'lb';
  autoRest: boolean;
  accent: string;
  numberSize: number;
}
