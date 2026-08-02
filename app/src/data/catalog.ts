import { ExerciseDef, TemplateExercise, WorkoutTemplate } from '../types/models';

export const MUSCLE_GROUPS = [
  'Dos',
  'Pecs',
  'Jambes',
  'Épaules',
  'Bras',
  'Abdos',
] as const;

export const UNKNOWN_EXERCISE: ExerciseDef = {
  id: '__unknown__',
  name: 'Exercice supprimé',
  group: 'Dos',
  isWeighted: false,
};

export const findExercise = (exercises: ExerciseDef[], id: string): ExerciseDef =>
  exercises.find((e) => e.id === id) ?? UNKNOWN_EXERCISE;

export const findTemplate = (
  templates: WorkoutTemplate[],
  id: string | null | undefined
): WorkoutTemplate | undefined =>
  id ? templates.find((t) => t.id === id) : undefined;

export const totalSets = (exercises: TemplateExercise[]): number =>
  exercises.reduce((a, e) => a + e.sets, 0);

/** Rough duration estimate: ~45 s of work per set plus its prescribed rest. */
export const estimatedMinutes = (exercises: TemplateExercise[]): number =>
  Math.round(exercises.reduce((a, e) => a + e.sets * (45 + e.restSec), 0) / 60);

export const sessionTag = (t: WorkoutTemplate): string => {
  if (t.exercises.length === 0) return 'séance vide';
  const exos = t.exercises.length;
  return `${exos} exo${exos > 1 ? 's' : ''} · ${totalSets(t.exercises)} séries · ~${estimatedMinutes(
    t.exercises
  )} min`;
};

export const newId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
