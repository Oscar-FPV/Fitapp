import { HistoryExercise, HistorySession, WorkoutTemplate } from '../types/models';
import { addDays, dateKey, e1rm, fmtKg } from '../utils/format';
import { seededRandom } from '../utils/rng';
import { TEMPLATES, catalogById, templateById } from './catalog';

// Flexible 7-slot rotation (4 work sessions, 3 rest) used only to seed demo
// history/plan on first launch — the user reassigns freely afterwards via Planning.
const ROTATION: (string | null)[] = ['pull', 'push', null, 'legs', 'upper', null, null];

interface SeedResult {
  plan: Record<string, string | null>;
  history: HistorySession[];
}

const PAST_DAYS = 63;
const FUTURE_DAYS = 13;

export function buildSeed(today: Date): SeedResult {
  const rand = seededRandom('muscu-seed-v1');
  const plan: Record<string, string | null> = {};

  for (let offset = -PAST_DAYS; offset <= FUTURE_DAYS; offset++) {
    const d = addDays(today, offset);
    const slot = ((offset % 7) + 7) % 7;
    plan[dateKey(d)] = ROTATION[slot];
  }

  const runningBest: Record<string, number> = {};
  const occurrence: Record<string, number> = {};
  const history: HistorySession[] = [];
  let doneCounter = 0;

  for (let offset = -PAST_DAYS; offset < 0; offset++) {
    const d = addDays(today, offset);
    const key = dateKey(d);
    const templateId = plan[key];
    if (!templateId) continue;
    doneCounter++;
    if (doneCounter % 6 === 0) continue; // occasional missed session (realistic adherence)

    const template = templateById(templateId);
    if (!template) continue;

    const session = buildSession(template, key, rand, occurrence, runningBest);
    history.push(session);
  }

  history.reverse(); // most recent first
  return { plan, history };
}

function buildSession(
  template: WorkoutTemplate,
  dateK: string,
  rand: () => number,
  occurrence: Record<string, number>,
  runningBest: Record<string, number>
): HistorySession {
  let volumeKg = 0;
  let setsCount = 0;
  let rpeSum = 0;
  let bestExerciseName = '';
  let bestPrevious = 0;
  let bestLine = '';
  let isPR = false;
  let durationSec = 0;

  const exercises: HistoryExercise[] = template.exercises.map((te) => {
    const n = occurrence[te.exerciseId] ?? 0;
    occurrence[te.exerciseId] = n + 1;
    const catalogEntry = catalogById(te.exerciseId);
    const increment = catalogEntry.isWeighted ? 2.5 : te.kg >= 100 ? 5 : te.kg >= 40 ? 2.5 : 1;
    // Loads trend up over the block with a deload dip every 5th appearance.
    const isDeload = n > 0 && n % 5 === 4;
    const progression = Math.floor(n / 2) * increment - (isDeload ? increment * 2 : 0);

    const sets = Array.from({ length: te.sets }, (_, i) => {
      const jitter = (rand() - 0.5) * increment;
      const kg = Math.max(increment, Math.round((te.kg + progression + jitter) / 2.5) * 2.5);
      const repVariance = i === te.sets - 1 ? -1 : 0;
      const reps = Math.max(1, te.reps + repVariance + (rand() > 0.7 ? -1 : 0));
      const rpe = Math.min(10, Math.max(6, te.rpeTarget + (rand() > 0.6 ? 1 : 0) - (i === 0 ? 1 : 0)));
      volumeKg += kg * reps;
      setsCount += 1;
      rpeSum += rpe;
      durationSec += 42 + te.restSec;

      const best = e1rm(kg, reps);
      const prevBest = runningBest[te.exerciseId] ?? 0;
      if (best > prevBest) {
        runningBest[te.exerciseId] = best;
        if (best > bestPrevious || bestLine === '') {
          isPR = prevBest > 0;
          bestExerciseName = catalogEntry.name;
          bestPrevious = prevBest;
          bestLine = `${fmtKg(kg)} kg × ${reps}`;
        }
      }
      return { kg, reps, rpe };
    });

    return { exerciseId: te.exerciseId, name: catalogEntry.name, sets };
  });

  const avgRpe = setsCount > 0 ? rpeSum / setsCount : 0;
  const notes = [
    'Bonne forme, dos solide.',
    'Séance courte, propre.',
    'Épaules fraîches, tempo tenu.',
    'Squat solide, barre rapide.',
    'Hanches raides à l’échauffement.',
    'Dos bien connecté.',
    'Bonne énergie du début à la fin.',
  ];
  const note = notes[Math.floor(rand() * notes.length)];

  return {
    id: `${dateK}-${template.id}`,
    templateId: template.id,
    name: template.name,
    dateKey: dateK,
    durationSec: Math.round(durationSec * (0.92 + rand() * 0.16)),
    volumeKg: Math.round(volumeKg),
    setsCount,
    avgRpe: Math.round(avgRpe * 10) / 10,
    isPR,
    prLine: isPR ? `${bestExerciseName} · ${bestLine}` : undefined,
    note,
    exercises,
  };
}
