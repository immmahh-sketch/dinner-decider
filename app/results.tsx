import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { AdBanner } from '@/components/AdBanner';
import { DishCard } from '@/components/DishCard';
import { Button } from '@/components/Button';
import { useDecider } from '@/store/decider';
import { useResults } from '@/store/pool';
import { usePrefs } from '@/store/prefs';
import { answersFromSteps, RESULT_THRESHOLD } from '@/engine/filter';
import { planLabel } from '@/engine/estimate';
import { shareDish } from '@/lib/share';
import { colors } from '@/theme';

const PLAN_NAME: Record<string, string> = {
  sw: 'Slimming World',
  ww: 'WeightWatchers',
  cals: 'calorie',
};

export default function Results() {
  const router = useRouter();
  const { results, total } = useResults();
  const reshuffle = useDecider((s) => s.reshuffle);
  const start = useDecider((s) => s.start);
  const steps = useDecider((s) => s.steps);
  const picked = useDecider((s) => s.pickedIngredients);
  const username = usePrefs((s) => s.username);
  const plan = planLabel(answersFromSteps(steps).q_plan);

  const byIngredient = picked.length > 0;
  const overflow = total > RESULT_THRESHOLD;
  const subtitle = byIngredient
    ? total === 0
      ? `Nothing uses all of: ${picked.join(', ')} — try fewer`
      : `${total} ${total === 1 ? 'dish uses' : 'dishes use'} ${picked.join(', ')}${
          overflow ? ` — here are ${RESULT_THRESHOLD}` : ''
        }`
    : total === 0
      ? 'Nothing matched every answer — start over and loosen a choice'
      : overflow
        ? `${total} match — here are ${RESULT_THRESHOLD} to spark ideas`
        : `Narrowed down to ${total} — pick one`;

  const openDish = (id: string) => {
    router.push({ pathname: '/dish/[id]', params: { id } });
  };

  const restart = () => {
    start();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Your shortlist" onBack={() => router.back()} />

      <View style={styles.head}>
        <Text style={styles.h1}>Dinner, sorted</Text>
        <Text style={styles.sub}>{subtitle}</Text>
        {plan && plan !== 'cals' && (
          <Text style={styles.planNote}>
            ≈ {PLAN_NAME[plan]} scores are a rough guide — always check your own app.
          </Text>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => (
          <DishCard
            dish={item}
            plan={plan}
            onPress={() => openDish(item.id)}
            onShare={() => shareDish(item, username)}
          />
        )}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {byIngredient
              ? 'No dish uses all of those together. Go back and drop one or two.'
              : 'Nothing matched every answer. Start over and loosen up a choice or two.'}
          </Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {overflow && (
              <Button label={`Shuffle these ${RESULT_THRESHOLD}`} variant="outline" onPress={reshuffle} />
            )}
            {byIngredient && (
              <Button
                label="Adjust ingredients"
                variant="outline"
                onPress={() => router.replace('/pick')}
              />
            )}
            <Button label="Start over" variant="ghost" onPress={restart} />
          </View>
        }
      />

      <AdBanner slot="results" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4 },
  h1: { fontSize: 26, fontWeight: '900', color: colors.ink },
  sub: { fontSize: 14, color: colors.inkSoft, marginTop: 4 },
  planNote: { fontSize: 11.5, color: colors.inkSoft, marginTop: 6, fontStyle: 'italic' },
  empty: { textAlign: 'center', color: colors.inkSoft, padding: 32, lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
});
