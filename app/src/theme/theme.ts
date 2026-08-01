export const ACCENTS = [
  { id: 'brique', label: 'Brique', value: '#D8402A' },
  { id: 'bleu', label: 'Bleu', value: '#2F6FE4' },
  { id: 'vert', label: 'Vert', value: '#1F7A5A' },
  { id: 'violet', label: 'Violet', value: '#5B4BD6' },
] as const;

export const DEFAULT_ACCENT = ACCENTS[0].value;

export const colors = {
  bg: '#FFFFFF',
  text: '#131211',
  textSecondary: '#5C5852',
  textMuted: '#8D8880',
  textFaint: '#A5A099',
  textFaintest: '#B0ABA3',
  border: '#E4E0DA',
  borderFaint: '#EDEAE5',
  borderDashed: '#DDD8D1',
  fill: '#F5F3F0',
  fillPill: '#F2EFEB',
  fillPillActive: '#E7E3DD',
  fillTrack: '#F2EFEB',
  overlay: 'rgba(19,18,17,.35)',
  white: '#FFFFFF',
  black: '#131211',
};

export const radius = {
  xl: 22,
  lg: 20,
  md: 18,
  card: 16,
  button: 14,
  chip: 13,
  small: 12,
  sheet: 28,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 26,
};

export const fonts = {
  regular: 'InterTight_400Regular',
  medium: 'InterTight_500Medium',
  semibold: 'InterTight_600SemiBold',
  bold: 'InterTight_700Bold',
  extrabold: 'InterTight_800ExtraBold',
};

export const TAP_MIN = 44;
