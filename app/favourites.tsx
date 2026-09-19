import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { DishCard } from '@/components/DishCard';
import { Button } from '@/components/Button';
import { useFavourites } from '@/store/favourites';
import { useWheelPicks } from '@/store/wheelPicks';
import { ALL_DISHES, dishById, loadCatalog } from '@/data/dishes';
import { hydrateDish } from '@/engine/hydrate';
import { Dish } from '@/engine/types';
import { searchDishes } from '@/engine/search';
import { useCatalogVersion } from '@/store/catalog';
import { usePrefs } from '@/store/prefs';
import { shareDish } from '@/lib/share';
import { colors, radius } from '@/theme';

export default function Favourites() {
  const router = useRouter();
  const favIds = useFavourites((s) => s.ids);
  const wheelIds = useWheelPicks((s) => s.ids);
  const username = usePrefs((s) => s.username);
  const catVersion = useCatalogVersion();
  const [q, setQ] = useState('');

  // A favourite may have been saved before the hosted catalogue finished
  // loading (or search needs the full catalogue) -- make sure it's fetched.
  useEffect(() => {
    loadCatalog();
  }, []);

  const favourites = useMemo(
    () =>
      [...favIds]
        .reverse() // most recently favourited first
        .map((id) => hydrateDish(dishById(id)))
        .filter((d): d is Dish => !!d),
    [favIds, catVersion],
  );

  const searching = q.trim().length >= 2;
  const searchResults = useMemo(
    () => (searching ? searchDishes(ALL_DISHES, q) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, searching, catVersion],
  );

  const wheelCount = useMemo(() => new Set([...favIds, ...wheelIds]).size, [favIds, wheelIds]);
  const canBuildWheel = wheelCount >= 2;

  const openDish = (id: string) => router.push({ pathname: '/dish/[id]', params: { id } });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Favourites" onBack={() => router.back()} />

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search every recipe…"
          placeholderTextColor={colors.inkSoft}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.ctaWrap}>
        <Button
          label={canBuildWheel ? `Spin your wheel (${wheelCount})` : 'Spin your wheel'}
          icon={<Text style={styles.ctaIcon}>🎡</Text>}
          variant="accent"
          disabled={!canBuildWheel}
          onPress={() => router.push('/wheel-build')}
          style={styles.cta}
        />
        {!canBuildWheel && (
          <Text style={styles.ctaHint}>
            Heart or 🎡-tag at least 2 dishes to build your own wheel.
          </Text>
        )}
      </View>

      {searching ? (
        <FlatList
          data={searchResults}
          keyExtractor={(d) => d.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <DishCard dish={item} onPress={() => openDish(item.id)} showWheelToggle />
          )}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No dinner matches “{q.trim()}”.</Text>
          }
        />
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(d) => d.id}
          renderItem={({ item }) => (
            <DishCard
              dish={item}
              onPress={() => openDish(item.id)}
              onShare={() => shareDish(item, username)}
              showWheelToggle
            />
          )}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🤍</Text>
              <Text style={styles.emptyText}>
                No favourites yet. Tap the heart on any recipe to save it here, or search above and
                🎡-tag dishes straight onto your wheel.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchIcon: { fontSize: 15 },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.ink },
  ctaWrap: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
  cta: { minHeight: 66 },
  ctaIcon: { fontSize: 24 },
  ctaHint: { textAlign: 'center', fontSize: 12, color: colors.inkSoft, marginTop: 8 },
  empty: { textAlign: 'center', color: colors.inkSoft, padding: 32, lineHeight: 20 },
  emptyState: { alignItems: 'center', padding: 40, gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { textAlign: 'center', color: colors.inkSoft, lineHeight: 20 },
});
