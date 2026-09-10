import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/Button';
import { ALL_DISHES } from '@/data/dishes';
import { useCatalogVersion } from '@/store/catalog';
import { useDecider } from '@/store/decider';
import { getActiveExcluder } from '@/engine/exclude';
import { INGREDIENT_GROUPS, filterByIngredients } from '@/engine/ingredients';
import { colors, radius, shadowCard } from '@/theme';

export default function Pick() {
  const router = useRouter();
  const setPickedIngredients = useDecider((s) => s.setPickedIngredients);
  const catVersion = useCatalogVersion();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (term: string) =>
    setSelected((cur) => (cur.includes(term) ? cur.filter((t) => t !== term) : [...cur, term]));

  const count = useMemo(() => {
    if (!selected.length) return 0;
    const exclude = getActiveExcluder();
    const base = exclude ? ALL_DISHES.filter((d) => !exclude(d)) : ALL_DISHES;
    return filterByIngredients(base, selected).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, catVersion]);

  const go = () => {
    setPickedIngredients(selected);
    router.replace('/results');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Choose by ingredient" onBack={() => router.back()} />

      <View style={styles.head}>
        <Text style={styles.h1}>What have you got?</Text>
        <Text style={styles.sub}>
          Tap what you want in tonight&apos;s dinner — we&apos;ll show dishes that use all of it.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {INGREDIENT_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.chips}>
              {group.items.map((term) => {
                const on = selected.includes(term);
                return (
                  <Pressable
                    key={term}
                    onPress={() => toggle(term)}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{term}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height: 8 }} />
      </ScrollView>

      <View style={[styles.bar, shadowCard]}>
        {selected.length > 0 && (
          <Pressable onPress={() => setSelected([])} hitSlop={8}>
            <Text style={styles.clear}>Clear ({selected.length})</Text>
          </Pressable>
        )}
        <Button
          label={
            selected.length === 0
              ? 'Pick some ingredients'
              : count === 0
                ? 'No dishes use all of those'
                : `Show ${count} ${count === 1 ? 'dish' : 'dishes'}`
          }
          variant="primary"
          onPress={go}
          disabled={selected.length === 0 || count === 0}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  h1: { fontSize: 24, fontWeight: '900', color: colors.ink },
  sub: { fontSize: 13.5, color: colors.inkSoft, marginTop: 4, lineHeight: 19 },
  scroll: { paddingHorizontal: 16, paddingBottom: 16 },
  group: { marginTop: 14 },
  groupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
    marginBottom: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  chipTextOn: { color: '#fff' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  clear: { fontSize: 13, fontWeight: '800', color: colors.accent },
});
