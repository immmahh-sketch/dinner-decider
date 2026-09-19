import { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { DishCard } from '@/components/DishCard';
import { Button } from '@/components/Button';
import { useFavourites } from '@/store/favourites';
import { dishById, loadCatalog } from '@/data/dishes';
import { hydrateDish } from '@/engine/hydrate';
import { Dish } from '@/engine/types';
import { useCatalogVersion } from '@/store/catalog';
import { usePrefs } from '@/store/prefs';
import { shareDish } from '@/lib/share';
import { colors } from '@/theme';

export default function Favourites() {
  const router = useRouter();
  const ids = useFavourites((s) => s.ids);
  const username = usePrefs((s) => s.username);
  const catVersion = useCatalogVersion();

  // A favourite may have been saved before the hosted catalogue finished
  // loading (or on a fresh install) -- make sure it's fetched.
  useEffect(() => {
    loadCatalog();
  }, []);

  const dishes = useMemo(
    () =>
      [...ids]
        .reverse() // most recently favourited first
        .map((id) => hydrateDish(dishById(id)))
        .filter((d): d is Dish => !!d),
    [ids, catVersion],
  );

  const openDish = (id: string) => router.push({ pathname: '/dish/[id]', params: { id } });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Favourites" onBack={() => router.back()} />

      <View style={styles.head}>
        <Text style={styles.h1}>Your favourites</Text>
        <Text style={styles.sub}>
          {dishes.length === 0
            ? 'Tap the heart on any dish to save it here.'
            : `${dishes.length} ${dishes.length === 1 ? 'dish' : 'dishes'} saved`}
        </Text>
      </View>

      <FlatList
        data={dishes}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => (
          <DishCard
            dish={item}
            onPress={() => openDish(item.id)}
            onShare={() => shareDish(item, username)}
          />
        )}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤍</Text>
            <Text style={styles.emptyText}>
              No favourites yet. Tap the heart on any recipe to save it here — then you can build
              a fortune wheel out of just your favourites.
            </Text>
          </View>
        }
        ListFooterComponent={
          dishes.length >= 2 ? (
            <View style={styles.footer}>
              <Button
                label="Spin from favourites"
                variant="accent"
                onPress={() => router.push('/wheel-build')}
              />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4 },
  h1: { fontSize: 26, fontWeight: '900', color: colors.ink },
  sub: { fontSize: 14, color: colors.inkSoft, marginTop: 4 },
  empty: { alignItems: 'center', padding: 40, gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { textAlign: 'center', color: colors.inkSoft, lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 8, gap: 8 },
});
