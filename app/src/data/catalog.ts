import { ExerciseDef, WorkoutTemplate } from '../types/models';

export const CATALOG: ExerciseDef[] = [
  { id: 'tractions-lestees', name: 'Tractions lestées', group: 'Dos', freq: '2× / sem.', isWeighted: true },
  { id: 'rowing-barre', name: 'Rowing barre', group: 'Dos', freq: '2× / sem.', isWeighted: false },
  { id: 'tirage-poulie', name: 'Tirage poulie', group: 'Dos', freq: '1× / sem.', isWeighted: false },
  { id: 'rowing-haltere', name: 'Rowing haltère', group: 'Dos', freq: '1× / sem.', isWeighted: false },
  { id: 'tirage-menton', name: 'Tirage menton', group: 'Dos', freq: '1× / sem.', isWeighted: false },
  { id: 'developpe-couche', name: 'Développé couché', group: 'Pecs', freq: '2× / sem.', isWeighted: false },
  { id: 'dips-lestees', name: 'Dips lestées', group: 'Pecs', freq: '1× / sem.', isWeighted: true },
  { id: 'ecarte-poulie', name: 'Écarté poulie', group: 'Pecs', freq: '1× / sem.', isWeighted: false },
  { id: 'developpe-incline-halteres', name: 'Développé incliné haltères', group: 'Pecs', freq: '1× / sem.', isWeighted: false },
  { id: 'squat-barre', name: 'Squat barre', group: 'Jambes', freq: '1× / sem.', isWeighted: false },
  { id: 'souleve-roumain', name: 'Soulevé roumain', group: 'Jambes', freq: '1× / sem.', isWeighted: false },
  { id: 'presse', name: 'Presse', group: 'Jambes', freq: '1× / sem.', isWeighted: false },
  { id: 'extension-mollets', name: 'Extension mollets', group: 'Jambes', freq: '1× / sem.', isWeighted: false },
  { id: 'developpe-militaire', name: 'Développé militaire', group: 'Épaules', freq: '2× / sem.', isWeighted: false },
  { id: 'elevations-laterales', name: 'Élévations latérales', group: 'Épaules', freq: '2× / sem.', isWeighted: false },
  { id: 'curl-incline', name: 'Curl incliné', group: 'Bras', freq: '2× / sem.', isWeighted: false },
  { id: 'curl-barre', name: 'Curl barre', group: 'Bras', freq: '1× / sem.', isWeighted: false },
  { id: 'extension-triceps-poulie', name: 'Extension triceps poulie', group: 'Bras', freq: '1× / sem.', isWeighted: false },
  { id: 'face-pull', name: 'Face pull', group: 'Épaules', freq: '1× / sem.', isWeighted: false },
];

export const catalogById = (id: string): ExerciseDef =>
  CATALOG.find((e) => e.id === id) ?? CATALOG[0];

export const TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'pull',
    name: 'PULL — Hypertrophie',
    shortName: 'PULL',
    accent: null,
    isActiveRest: false,
    exercises: [
      { exerciseId: 'tractions-lestees', sets: 4, reps: 5, kg: 15, rpeTarget: 8, restSec: 150 },
      { exerciseId: 'rowing-barre', sets: 4, reps: 8, kg: 85, rpeTarget: 8, restSec: 120 },
      { exerciseId: 'tirage-poulie', sets: 4, reps: 12, kg: 60, rpeTarget: 8, restSec: 90 },
      { exerciseId: 'curl-incline', sets: 4, reps: 12, kg: 14, rpeTarget: 8, restSec: 75 },
      { exerciseId: 'face-pull', sets: 3, reps: 15, kg: 25, rpeTarget: 7, restSec: 60 },
    ],
  },
  {
    id: 'push',
    name: 'PUSH — Hypertrophie',
    shortName: 'PUSH',
    accent: null,
    isActiveRest: false,
    exercises: [
      { exerciseId: 'developpe-couche', sets: 4, reps: 6, kg: 85, rpeTarget: 8, restSec: 150 },
      { exerciseId: 'developpe-militaire', sets: 4, reps: 8, kg: 47.5, rpeTarget: 8, restSec: 120 },
      { exerciseId: 'dips-lestees', sets: 3, reps: 8, kg: 20, rpeTarget: 8, restSec: 120 },
      { exerciseId: 'ecarte-poulie', sets: 4, reps: 15, kg: 12, rpeTarget: 7, restSec: 60 },
      { exerciseId: 'elevations-laterales', sets: 3, reps: 15, kg: 10, rpeTarget: 7, restSec: 60 },
    ],
  },
  {
    id: 'legs',
    name: 'LEGS — Force',
    shortName: 'LEGS',
    accent: null,
    isActiveRest: false,
    exercises: [
      { exerciseId: 'squat-barre', sets: 4, reps: 5, kg: 130, rpeTarget: 8, restSec: 180 },
      { exerciseId: 'souleve-roumain', sets: 4, reps: 8, kg: 110, rpeTarget: 8, restSec: 120 },
      { exerciseId: 'presse', sets: 4, reps: 10, kg: 200, rpeTarget: 8, restSec: 90 },
      { exerciseId: 'extension-mollets', sets: 4, reps: 15, kg: 80, rpeTarget: 7, restSec: 60 },
    ],
  },
  {
    id: 'upper',
    name: 'UPPER — Volume',
    shortName: 'UPPER',
    accent: null,
    isActiveRest: false,
    exercises: [
      { exerciseId: 'developpe-incline-halteres', sets: 4, reps: 10, kg: 30, rpeTarget: 8, restSec: 90 },
      { exerciseId: 'rowing-haltere', sets: 4, reps: 10, kg: 34, rpeTarget: 8, restSec: 90 },
      { exerciseId: 'elevations-laterales', sets: 3, reps: 15, kg: 10, rpeTarget: 7, restSec: 60 },
      { exerciseId: 'curl-barre', sets: 4, reps: 10, kg: 30, rpeTarget: 8, restSec: 75 },
      { exerciseId: 'extension-triceps-poulie', sets: 4, reps: 12, kg: 25, rpeTarget: 8, restSec: 75 },
      { exerciseId: 'tirage-menton', sets: 3, reps: 12, kg: 30, rpeTarget: 7, restSec: 60 },
    ],
  },
  {
    id: 'repos-actif',
    name: 'Repos actif',
    shortName: 'Repos actif',
    accent: '#CFCAC3',
    isActiveRest: true,
    exercises: [],
  },
];

export const templateById = (id: string): WorkoutTemplate | undefined =>
  TEMPLATES.find((t) => t.id === id);

export const sessionTag = (t: WorkoutTemplate): string => {
  if (t.isActiveRest) return 'mobilité · 20 min';
  const series = t.exercises.reduce((a, e) => a + e.sets, 0);
  const minutes = Math.round(
    t.exercises.reduce((a, e) => a + e.sets * (45 + e.restSec), 0) / 60
  );
  return `${t.exercises.length} exos · ${series} séries · ~${minutes} min`;
};
