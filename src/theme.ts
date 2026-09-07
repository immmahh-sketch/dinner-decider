// Bold, playful game-show palette — cool base, vivid primaries.
// Deliberately steers clear of orange / peach.
export const colors = {
  bg: '#EEF2F6', // cool off-white
  card: '#FFFFFF',
  ink: '#161D2B', // near-black navy
  inkSoft: '#5B6B7C',
  primary: '#0FB5A6', // teal
  primaryDark: '#0B8C81',
  accent: '#FF2E7E', // raspberry
  accentDark: '#D31E63',
  mint: '#25C685', // success green
  grape: '#6C5CE7',
  blue: '#2D9CDB',
  gold: '#FFD23F',
  line: '#DEE5EC',
  danger: '#E5484D',
  shadow: 'rgba(22, 29, 43, 0.16)',
};

// Rainbow wedges for the fortune wheel — no orange, no peach.
export const wheelColors = [
  '#0FB5A6', // teal
  '#FF2E7E', // raspberry
  '#6C5CE7', // violet
  '#2D9CDB', // blue
  '#FFD23F', // gold
  '#25C685', // green
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
