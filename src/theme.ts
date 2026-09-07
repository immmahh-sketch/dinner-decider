// Bold, warm, cartoon-diner palette.
export const colors = {
  bg: '#FFF4E6',
  card: '#FFFFFF',
  ink: '#2B2118',
  inkSoft: '#7A6A58',
  primary: '#FF5A5F', // tomato red
  primaryDark: '#D6383D',
  accent: '#FFC542', // egg-yolk yellow
  accentDark: '#E0A81E',
  mint: '#2EC4B6',
  grape: '#7C4DFF',
  line: '#EAD9C3',
  danger: '#E5484D',
  shadow: 'rgba(43, 33, 24, 0.18)',
};

export const wheelColors = [
  '#FF5A5F',
  '#FFC542',
  '#2EC4B6',
  '#7C4DFF',
  '#FF8A5B',
  '#4D96FF',
];

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
};

export const space = (n: number) => n * 4;

export const font = {
  display: 'System' as const,
};

export const shadowCard = {
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 1,
  shadowRadius: 14,
  elevation: 4,
};
