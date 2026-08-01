export const fmtKg = (v: number): string => {
  const rounded = Math.round(v * 10) / 10;
  return String(rounded).replace('.', ',');
};

export const mmss = (s: number): string => {
  const sec = Math.max(0, Math.round(s));
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
};

export const dateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (d: Date, n: number): Date => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

// Monday-based week start
export const startOfWeek = (d: Date): Date => {
  const copy = new Date(d);
  const dow = (copy.getDay() + 6) % 7; // 0 = Monday
  copy.setDate(copy.getDate() - dow);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const DAY_ABBR = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
const MONTH_ABBR = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];
const DAY_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export const dateLabelShort = (d: Date): string =>
  `${DAY_ABBR[d.getDay()]}. ${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;

export const dayLongName = (d: Date): string => {
  const name = DAY_LONG[d.getDay()];
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const DAYS_MON_FIRST = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

export const e1rm = (kg: number, reps: number): number => kg * (1 + reps / 30);

export const scaleLabel = (rir: boolean): string => (rir ? 'RIR' : 'RPE');

export const scaleValue = (rpe: number, rir: boolean): number => (rir ? 10 - rpe : rpe);

export const scaleValueDisplay = (rpe: number, rir: boolean): string => {
  const v = scaleValue(rpe, rir);
  return fmtKg(v);
};

export const pct = (value: number, digits = 0): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)} %`;
};

export const kgToLb = (kg: number): number => kg * 2.20462;
export const lbToKg = (lb: number): number => lb / 2.20462;

export const displayWeight = (kg: number, unit: 'kg' | 'lb'): string =>
  unit === 'lb' ? fmtKg(Math.round(kgToLb(kg))) : fmtKg(kg);
