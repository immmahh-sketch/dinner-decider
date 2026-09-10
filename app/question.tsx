import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { AdBanner } from '@/components/AdBanner';
import { useDecider } from '@/store/decider';
import { usePoolCount } from '@/store/pool';
import { questionById, RESULT_THRESHOLD } from '@/engine/filter';
import { colors, radius, shadowCard } from '@/theme';

type Overlay =
  | { kind: 'count'; from: number; to: number; ignored: boolean; done: boolean }
  | { kind: 'toomany'; count: number }
  | null;

/** Old count slides out left / new count slides in from the right. */
function CountSwap({ from, to }: { from: number; to: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(120, withTiming(1, { duration: 460, easing: Easing.inOut(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const oldS = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: [{ translateX: -70 * p.value }],
  }));
  const newS = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateX: 70 * (1 - p.value) }],
  }));
  return (
    <View style={styles.swapWrap}>
      <Animated.Text style={[styles.bigNum, styles.numAbs, oldS]}>
        {from.toLocaleString()}
      </Animated.Text>
      <Animated.Text style={[styles.bigNum, styles.numAbs, newS]}>
        {to.toLocaleString()}
      </Animated.Text>
    </View>
  );
}

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
  const canView = count <= RESULT_THRESHOLD;

  const [overlay, setOverlay] = useState<Overlay>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onBack = () => {
    if (visited.length <= 1) {
      router.replace('/');
      return;
    }
    goBack();
  };

  const choose = (optionId: string) => {
    if (overlay) return; // ignore taps while the count is showing
    const from = count;
    const res = answer(currentQuestionId, optionId); // advances the question in the store
    setOverlay({ kind: 'count', from, to: res.count, ignored: res.ignored, done: res.done });
    timer.current = setTimeout(() => {
      setOverlay(null);
      if (res.done) router.replace('/results');
    }, 1000);
  };

  const onViewPress = () => {
    if (overlay) return;
    if (canView) {
      router.push('/results');
      return;
    }
    setOverlay({ kind: 'toomany', count });
    timer.current = setTimeout(() => setOverlay(null), 1700);
  };

  if (!question) {
    router.replace('/results');
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title={`Question ${answered + 1}`} onBack={onBack} />

      <Pressable
        style={[styles.viewBar, canView ? styles.viewBarOn : styles.viewBarOff]}
        onPress={onViewPress}
      >
        <Text style={[styles.viewCount, canView ? styles.viewTextOn : styles.viewTextOff]}>
          {count.toLocaleString()} {count === 1 ? 'dinner' : 'dinners'} left
        </Text>
        <Text style={[styles.viewCta, canView ? styles.viewTextOn : styles.viewTextOff]}>
          {canView ? 'View the list  ›' : `🔒 narrow to ${RESULT_THRESHOLD}`}
        </Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View key={currentQuestionId} entering={FadeIn.duration(250)}>
          <Text style={styles.qTitle}>{question.title}</Text>
          {question.subtitle && <Text style={styles.qSub}>{question.subtitle}</Text>}
        </Animated.View>

        <View style={styles.options}>
          {question.options.map((opt, i) => (
            <Animated.View
              key={`${currentQuestionId}-${opt.id}`}
              entering={FadeInRight.delay(60 * i).duration(220)}
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
            </Animated.View>
          ))}
        </View>

        {answered === 0 && (
          <Pressable style={styles.directRow} onPress={() => router.push('/pick')}>
            <Text style={styles.directText}>🧺  Know what you want? Choose by ingredient</Text>
            <Text style={styles.directChevron}>›</Text>
          </Pressable>
        )}
      </ScrollView>

      <AdBanner slot="question" />

      {overlay && (
        <Animated.View style={styles.overlay} entering={FadeIn.duration(140)} pointerEvents="none">
          <View style={[styles.overlayCard, shadowCard]}>
            {overlay.kind === 'count' ? (
              <>
                <CountSwap from={overlay.from} to={overlay.to} />
                <Text style={styles.overlayLabel}>
                  {overlay.to === 1 ? 'dinner still on the table' : 'dinners still on the table'}
                </Text>
                {overlay.ignored && (
                  <Text style={styles.overlayNote}>
                    Nothing matched that exactly — kept your options
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.overlayBig}>Still too many to show</Text>
                <Text style={styles.overlayLabel}>Answer a few more questions first!</Text>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  viewBar: {
    marginHorizontal: 16,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderWidth: 2,
  },
  viewBarOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  viewBarOff: { backgroundColor: colors.card, borderColor: colors.line },
  viewCount: { fontWeight: '900', fontSize: 15 },
  viewCta: { fontWeight: '900', fontSize: 14 },
  viewTextOn: { color: '#fff' },
  viewTextOff: { color: colors.inkSoft },

  scroll: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
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

  directRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
  directText: { flex: 1, fontSize: 14.5, fontWeight: '800', color: colors.inkSoft },
  directChevron: { fontSize: 20, color: colors.inkSoft, fontWeight: '800' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,29,43,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  overlayCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: 26,
    paddingHorizontal: 30,
    alignItems: 'center',
    minWidth: 240,
  },
  swapWrap: { height: 60, alignSelf: 'stretch', justifyContent: 'center' },
  numAbs: { position: 'absolute', alignSelf: 'center' },
  bigNum: { fontSize: 52, fontWeight: '900', color: colors.primary },
  overlayBig: { fontSize: 22, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  overlayLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkSoft,
    marginTop: 6,
    textAlign: 'center',
  },
  overlayNote: {
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
