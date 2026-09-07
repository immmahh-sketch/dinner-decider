import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { AdBanner } from '@/components/AdBanner';
import { DishCard } from '@/components/DishCard';
import { Button } from '@/components/Button';
import { useDecider } from '@/store/decider';
import { isHome } from '@/engine/types';
import { RESULT_THRESHOLD } from '@/engine/filter';
import { findNearMeQuery, mapsSearchUrl, openExternal } from '@/lib/links';
import { colors } from '@/theme';

export default function Results() {
  const router = useRouter();
  const total = useDecider((s) => s.count());
  const shuffleSeed = useDecider((s) => s.shuffleSeed);
  const results = useDecider((s) => s.results());
  const reshuffle = useDecider((s) => s.reshuffle);
  const start = useDecider((s) => s.start);

  const overflow = total > RESULT_THRESHOLD;
  // recompute label when seed changes
  const subtitle = useMemo(() => {
    if (total === 0) return 'No exact matches — try starting over';
    if (overflow) return `Still ${total} to choose from — here are 10 to spark ideas`;
    return `Narrowed down to ${total} — pick one`;
  }, [total, overflow, shuffleSeed]);

  const openDish = (id: string) => {
    const dish = results.find((d) => d.id === id);
    if (!dish) return;
    if (isHome(dish)) {
      router.push({ pathname: '/dish/[id]', params: { id } });
    } else {
      openExternal(mapsSearchUrl(findNearMeQuery(dish)));
    }
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
      </View>

      <FlatList
        data={results}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => <DishCard dish={item} onPress={() => openDish(item.id)} />}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nothing matched every answer. Start over and loosen up a choice or two.
          </Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {overflow && (
              <Button label="Shuffle these 10" variant="outline" onPress={reshuffle} />
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
  empty: { textAlign: 'center', color: colors.inkSoft, padding: 32, lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
});
