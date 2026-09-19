import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/Button';
import { useFavourites } from '@/store/favourites';
import { useWheelPicks } from '@/store/wheelPicks';
import { ALL_DISHES, dishById, loadCatalog } from '@/data/dishes';
import { hydrateDish } from '@/engine/hydrate';
import { Dish } from '@/engine/types';
import { searchDishes } from '@/engine/search';
import { useCatalogVersion } from '@/store/catalog';
import { colors, radius, shadowCard } from '@/theme';

export default function WheelBuild() {
  const router = useRouter();
  const favIds = useFavourites((s) => s.ids);
  const wheelIds = useWheelPicks((s) => s.ids);
  const toggleWheel = useWheelPicks((s) => s.toggle);
  const seedWheel = useWheelPicks((s) => s.set);
  const catVersion = useCatalogVersion();
  const [q, setQ] = useState('');

  useEffect(() => {
    loadCatalog();
  }, []);

  // First time in with nothing queued yet, default the wheel to your
  // favourites -- after that, whatever's ticked (here or quick-added from
  // search) is the source of truth, so it isn't re-seeded on every visit.
  const seededOnce = useRef(false);
  useEffect(() => {
    if (!seededOnce.current && wheelIds.length === 0 && favIds.length > 0) {
      seedWheel(favIds);
    }
    seededOnce.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wheelSet = useMemo(() => new Set(wheelIds), [wheelIds]);

  // Favourites, plus anything quick-added to the wheel from search that
  // isn't (yet) favourited -- both show up in the plain (non-search) list.
  const dishes = useMemo(() => {
    const ids = [...new Set([...favIds, ...wheelIds])].reverse();
    return ids.map((id) => hydrateDish(dishById(id))).filter((d): d is Dish => !!d);
  }, [favIds, wheelIds, catVersion]);

  const searching = q.trim().length >= 2;
  const searchResults = useMemo(
    () => (searching ? searchDishes(ALL_DISHES, q) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, searching, catVersion],
  );

  const list = searching ? searchResults : dishes;
  const count = wheelIds.length;
  const canSpin = count >= 2;

  const go = () => router.replace('/wheel');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Build your wheel" onBack={() => router.back()} />

      <View style={styles.head}>
        <Text style={styles.h1}>Pick your wheel</Text>
        <Text style={styles.sub}>
          One dish each — search for anyone's pick and tap to add it, then spin.
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search any recipe to add it…"
          placeholderTextColor={colors.inkSoft}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={list}
        keyExtractor={(d) => d.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const on = wheelSet.has(item.id);
          return (
            <Pressable
              onPress={() => toggleWheel(item.id)}
              style={({ pressed }) => [
                styles.row,
                shadowCard,
                on && styles.rowOn,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={[styles.check, on && styles.checkOn]}>
                {on && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.rowBlurb} numberOfLines={1}>
                  {item.blurb}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {searching
              ? `No dinner matches “${q.trim()}”.`
              : 'Nothing queued yet — search above or favourite a dish elsewhere in the app.'}
          </Text>
        }
      />

      <View style={styles.bottom}>
        <Text style={styles.bottomHint}>
          {count === 0
            ? 'Nothing on the wheel yet'
            : `${count} ${count === 1 ? 'dish' : 'dishes'} queued`}
        </Text>
        <Button
          label={canSpin ? `Spin these ${count}` : 'Add at least 2'}
          variant="accent"
          disabled={!canSpin}
          onPress={go}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4 },
  h1: { fontSize: 24, fontWeight: '900', color: colors.ink },
  sub: { fontSize: 13.5, color: colors.inkSoft, marginTop: 4, lineHeight: 19 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
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
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 130 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 5,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  rowOn: { borderColor: colors.accent },
  rowPressed: { transform: [{ scale: 0.99 }] },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '900' },
  rowName: { fontSize: 15.5, fontWeight: '800', color: colors.ink },
  rowBlurb: { fontSize: 12.5, color: colors.inkSoft, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.inkSoft, padding: 32, lineHeight: 20 },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 8,
  },
  bottomHint: { textAlign: 'center', fontSize: 12.5, fontWeight: '700', color: colors.inkSoft },
});
