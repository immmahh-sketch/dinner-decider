import { StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { usePrefs } from '@/store/prefs';
import { colors, radius, shadowCard } from '@/theme';

const STEPS: { emoji: string; title: string; body: string }[] = [
  {
    emoji: '🃏',
    title: 'Think of it like Guess Who',
    body: 'Every dinner we know is a card. To start, they are all face up.',
  },
  {
    emoji: '🙋',
    title: 'Answer easy questions',
    body: 'Eating in or out? Cooking or takeaway? Spicy or not? Each answer flips down the cards that do not match.',
  },
  {
    emoji: '👀',
    title: 'Peek whenever you like',
    body: 'After every question we show how many dinners are left. Stop and see the list, or keep narrowing.',
  },
  {
    emoji: '🍽️',
    title: 'Land on a shortlist',
    body: 'At 10 or fewer, pick one. Cooking? Get the ingredients and method. Eating out? We find local spots.',
  },
];

export default function HowItWorks() {
  const router = useRouter();
  const hide = usePrefs((s) => s.hideHowItWorks);
  const setHide = usePrefs((s) => s.setHideHowItWorks);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>HOW IT WORKS</Text>
        <Text style={styles.h1}>Four steps to dinner</Text>
      </View>

      <View style={styles.list}>
        {STEPS.map((s, i) => (
          <View key={i} style={[styles.step, shadowCard]}>
            <Text style={styles.stepEmoji}>{s.emoji}</Text>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepBody}>{s.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Don&apos;t show this again</Text>
          <Switch
            value={hide}
            onValueChange={setHide}
            trackColor={{ true: colors.primary, false: '#d8cdbb' }}
            thumbColor="#fff"
          />
        </View>
        <Button label="Next" onPress={() => router.replace('/question')} variant="primary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  header: { paddingTop: 12, paddingBottom: 8 },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 1.5 },
  h1: { fontSize: 28, fontWeight: '900', color: colors.ink, marginTop: 4 },
  list: { flex: 1, gap: 12, marginTop: 8 },
  step: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  stepEmoji: { fontSize: 30 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  stepBody: { fontSize: 13.5, color: colors.inkSoft, marginTop: 3, lineHeight: 19 },
  footer: { gap: 14, paddingVertical: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 15, fontWeight: '700', color: colors.ink },
});
