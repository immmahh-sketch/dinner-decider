import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { ShoppingItem, useShoppingList } from '@/store/shoppingList';
import { colors, radius, shadowCard } from '@/theme';

export default function ShoppingListScreen() {
  const router = useRouter();
  const items = useShoppingList((s) => s.items);
  const toggle = useShoppingList((s) => s.toggle);
  const remove = useShoppingList((s) => s.remove);
  const clearChecked = useShoppingList((s) => s.clearChecked);
  const clearAll = useShoppingList((s) => s.clearAll);

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; items: ShoppingItem[] }>();
    for (const it of items) {
      if (!map.has(it.dishId)) map.set(it.dishId, { name: it.dishName, items: [] });
      map.get(it.dishId)!.items.push(it);
    }
    return [...map.values()];
  }, [items]);

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.h1}>Shopping list</Text>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Text style={styles.close}>Done</Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🧺</Text>
          <Text style={styles.emptyText}>
            Your list is empty. Open a cook-at-home dish and tap “Add to shopping list”.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {groups.map((g) => (
            <View key={g.name} style={[styles.group, shadowCard]}>
              <Text style={styles.groupTitle}>{g.name}</Text>
              {g.items.map((it) => (
                <Pressable key={it.id} style={styles.row} onPress={() => toggle(it.id)}>
                  <View style={[styles.check, it.checked && styles.checkOn]}>
                    {it.checked && <Text style={styles.tick}>✓</Text>}
                  </View>
                  <Text style={[styles.itemText, it.checked && styles.itemTextDone]}>
                    {it.text}
                  </Text>
                  <Pressable hitSlop={10} onPress={() => remove(it.id)}>
                    <Text style={styles.removeX}>✕</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ))}

          <View style={styles.actions}>
            {checkedCount > 0 && (
              <Button
                label={`Clear ${checkedCount} ticked`}
                variant="outline"
                onPress={clearChecked}
              />
            )}
            <Button label="Clear whole list" variant="ghost" onPress={clearAll} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  h1: { fontSize: 24, fontWeight: '900', color: colors.ink },
  close: { fontSize: 16, fontWeight: '800', color: colors.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { textAlign: 'center', color: colors.inkSoft, marginTop: 12, lineHeight: 20 },
  scroll: { padding: 16, paddingBottom: 30 },
  group: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  groupTitle: { fontSize: 15, fontWeight: '900', color: colors.ink, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.mint, borderColor: colors.mint },
  tick: { color: '#fff', fontSize: 13, fontWeight: '900' },
  itemText: { flex: 1, fontSize: 14.5, color: colors.ink },
  itemTextDone: { textDecorationLine: 'line-through', color: colors.inkSoft },
  removeX: { fontSize: 14, color: colors.inkSoft, paddingHorizontal: 4 },
  actions: { marginTop: 8, gap: 8 },
});
