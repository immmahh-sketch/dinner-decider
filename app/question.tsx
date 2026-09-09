import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { FadeInView } from '@/components/FadeInView';
import { AdBanner } from '@/components/AdBanner';
import { useDecider } from '@/store/decider';
import { usePoolCount } from '@/store/pool';
import { questionById } from '@/engine/filter';
import { colors, radius, shadowCard } from '@/theme';

export default function QuestionScreen() {
  const router = useRouter();
  const currentQuestionId = useDecider((s) => s.currentQuestionId);
  const steps = useDecider((s) => s.steps);
  const visited = useDecider((s) => s.visited);
  const answer = useDecider((s) => s.answer);
  const goBack = useDecider((s) => s.goBack);
  const count = usePoolCount();

  const question = useMemo(() => questionById(currentQuestionId), [currentQuestionId]);
  const answered = steps.length;

  const onBack = () => {
    if (visited.length <= 1) {
      router.replace('/');
      return;
    }
    goBack();
  };

  const choose = (optionId: string) => {
    const res = answer(currentQuestionId, optionId);
    if (res.done) {
      router.replace('/results');
    } else {
      router.push({
        pathname: '/peek',
        params: { count: String(res.count), ignored: res.ignored ? '1' : '0' },
      });
    }
  };

  if (!question) {
    // Ran out of questions but still > 10: just show what's left.
    router.replace('/results');
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title={`Question ${answered + 1}`} onBack={onBack} />

      <Pressable style={styles.peekPill} onPress={() => router.push('/results')}>
        <Text style={styles.peekText}>
          {count} {count === 1 ? 'dinner' : 'dinners'} left
        </Text>
        <Text style={styles.peekLink}>view now ›</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeInView key={currentQuestionId} from="none" duration={250}>
          <Text style={styles.qTitle}>{question.title}</Text>
          {question.subtitle && <Text style={styles.qSub}>{question.subtitle}</Text>}
        </FadeInView>

        <View style={styles.options}>
          {question.options.map((opt, i) => (
            <FadeInView
              key={`${currentQuestionId}-${opt.id}`}
              from="right"
              delay={60 * i}
              duration={220}
            >
              <Pressable
                onPress={() => choose(opt.id)}
                style={({ pressed }) => [
                  styles.option,
                  shadowCard,
                  pressed && styles.optionPressed,
                ]}
              >
                {opt.emoji && <Text style={styles.optionEmoji}>{opt.emoji}</Text>}
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionChevron}>›</Text>
              </Pressable>
            </FadeInView>
          ))}
        </View>
      </ScrollView>

      <AdBanner slot="question" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  peekPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },
  peekText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  peekLink: { color: colors.accent, fontWeight: '800', fontSize: 13 },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  qTitle: { fontSize: 26, fontWeight: '900', color: colors.ink, lineHeight: 32 },
  qSub: { fontSize: 14.5, color: colors.inkSoft, marginTop: 6 },
  options: { marginTop: 20, gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  optionPressed: { transform: [{ scale: 0.98 }], backgroundColor: '#FFF8EE' },
  optionEmoji: { fontSize: 22 },
  optionLabel: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.ink },
  optionChevron: { fontSize: 22, color: colors.inkSoft, fontWeight: '800' },
});
