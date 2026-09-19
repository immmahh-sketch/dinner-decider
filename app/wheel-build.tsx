import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/Button';
import { useFavourites } from '@/store/favourites';
import { useWheelPicks } from '@/store/wheelPicks';
import { dishById, loadCatalog } from '@/data/dishes';
import { hydrateDish } from '@/engine/hydrate';
import { Dish } from '@/engine/types';
import { useCatalogVersion } from '@/store/catalog';
import { colors, radius, shadowCard } from '@/theme';

export default function WheelBuild() {
  const router = useRouter();
  const favIds = useFavourites((s) => s.ids);
  const wheelIds = useWheelPicks((s) => s.ids);
  const setWheelIds = useWheelPicks((s) => s.set);
  const catVersion = useCatalogVersion();

  useEffect(() => {
    loadCatalog();
  }, []);

  // Favourites, plus anything quick-added to the wheel from search that
  // isn't (yet) favourited -- both are fair game to build a wheel from.
  const dishes = useMemo(() => {
    const ids = [...new Set([...favIds, ...wheelIds])].reverse();
    return ids.map((id) => hydrateDish(dishById(id))).filter((d): d is Dish => !!d);
  }, [favIds, wheelIds, catVersion]);

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(dishes.map((d) => d.id)),
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const count = selected.size;
  const canSpin = count >= 2;

  const go = () => {
    setWheelIds(dishes.filter((d) => selected.has(d.id)).map((d) => d.id));
    router.replace('/wheel');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Build your wheel" onBack={() => router.back()} />

      <View style={styles.head}>
        <Text style={styles.h1}>Pick your wheel</Text>
        <Text style={styles.sub}>
          {dishes.length === 0
            ? 'Favourite a few dishes first, then come back here.'
            : `Choose at least 2 of your favourites to spin between.`}
        </Text>
      </View>

      <FlatList
        data={dishes}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const on = selected.has(item.id);
          return (
            <Pressable
              onPress={() => toggle(item.id)}
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
            No favourites yet — tap the heart on any dish to save it here.
          </Text>
        }
      />

      <View style={styles.bottom}>
        <Button
          label={canSpin ? `Spin these ${count}` : 'Pick at least 2'}
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
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 },
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
  },
});
