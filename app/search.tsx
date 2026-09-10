import { useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { ALL_DISHES, WHEEL_TITLES } from '@/data/dishes';
import { useCatalogVersion } from '@/store/catalog';
import { searchDishes } from '@/engine/search';
import { Dish, isRestaurant, isTakeaway } from '@/engine/types';
import { colors, radius } from '@/theme';

const kindLabel = (d: Dish): string =>
  isTakeaway(d) ? 'Takeaway' : isRestaurant(d) ? 'Eating out' : 'Cook at home';

export default function Search() {
  const router = useRouter();
  const catVersion = useCatalogVersion();
  const [q, setQ] = useState('');

  const results = useMemo(
    () => searchDishes(ALL_DISHES, q),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, catVersion],
  );

  const open = (id: string) => {
    Keyboard.dismiss();
    router.push({ pathname: '/dish/[id]', params: { id } });
  };

  const showSuggestions = q.trim().length < 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Find a dinner" onBack={() => router.back()} />

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search a dish by name…"
          placeholderTextColor={colors.inkSoft}
          style={styles.input}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {showSuggestions ? (
        <View style={styles.suggest}>
          <Text style={styles.suggestHead}>Try</Text>
          <View style={styles.suggestChips}>
            {WHEEL_TITLES.slice(0, 12).map((t) => (
              <Pressable key={t} style={styles.chip} onPress={() => setQ(t)}>
                <Text style={styles.chipText}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(d) => d.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => open(item.id)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {kindLabel(item)} · {item.blurb}
                </Text>
              </View>
              <Text style={styles.rowChevron}>›</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No dinner matches “{q.trim()}”.</Text>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
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
  suggest: { paddingHorizontal: 20, paddingTop: 14 },
  suggestHead: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  suggestChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  rowSub: { fontSize: 12.5, color: colors.inkSoft, marginTop: 2 },
  rowChevron: { fontSize: 22, color: colors.inkSoft, fontWeight: '800' },
  empty: { textAlign: 'center', color: colors.inkSoft, padding: 32, lineHeight: 20 },
});
