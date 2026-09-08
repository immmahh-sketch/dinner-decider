import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { AdBanner } from '@/components/AdBanner';
import { Button } from '@/components/Button';
import { dishById } from '@/data/dishes';
import { hydrateDish } from '@/engine/hydrate';
import { isHome } from '@/engine/types';
import { useShoppingList } from '@/store/shoppingList';
import { findNearMeQuery, mapsSearchUrl, openExternal } from '@/lib/links';
import { colors, radius, shadowCard } from '@/theme';

export default function DishDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dish = id ? hydrateDish(dishById(id)) : undefined;

  const addForDish = useShoppingList((s) => s.addForDish);
  const inList = useShoppingList((s) => (id ? s.hasDish(id) : false));
  const [justAdded, setJustAdded] = useState(0);

  if (!dish) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TopBar title="Not found" onBack={() => router.back()} />
        <Text style={styles.missing}>We couldn&apos;t find that dish.</Text>
      </SafeAreaView>
    );
  }

  if (!isHome(dish)) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TopBar title={dish.name} onBack={() => router.back()} />
        <View style={styles.pad}>
          <Text style={styles.blurb}>{dish.blurb}</Text>
          <Button
            label="Find this near me"
            variant="primary"
            onPress={() => openExternal(mapsSearchUrl(findNearMeQuery(dish)))}
          />
        </View>
      </SafeAreaView>
    );
  }

  const add = () => {
    const n = addForDish(dish.id, dish.name, dish.ingredients);
    setJustAdded(n);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title={dish.name} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{dish.name}</Text>
        <Text style={styles.blurb}>{dish.blurb}</Text>

        <View style={styles.metaRow}>
          <Meta label="Time" value={`${dish.timeMinutes} min`} />
          <Meta label="Effort" value={dish.effort === 'showoff' ? 'show off' : dish.effort} />
          <Meta label="Serves" value={String(dish.servings)} />
          {dish.spicy > 0 && <Meta label="Spice" value={'🌶️'.repeat(dish.spicy)} />}
        </View>

        <View style={[styles.section, shadowCard]}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <Text style={styles.serves}>for {dish.servings}</Text>
          </View>
          {dish.ingredients.map((line, i) => (
            <View key={i} style={styles.ingRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.ingText}>{line}</Text>
            </View>
          ))}

          <Button
            label={inList ? 'Add again to shopping list' : 'Add to shopping list'}
            variant={inList ? 'outline' : 'accent'}
            onPress={add}
            style={{ marginTop: 14 }}
          />
          {justAdded > 0 && (
            <Text style={styles.added}>
              Added {justAdded} {justAdded === 1 ? 'item' : 'items'} ·{' '}
              <Text style={styles.addedLink} onPress={() => router.push('/shopping-list')}>
                view list
              </Text>
            </Text>
          )}
          {justAdded === 0 && inList && (
            <Text style={styles.added}>Already on your{' '}
              <Text style={styles.addedLink} onPress={() => router.push('/shopping-list')}>
                shopping list
              </Text>
            </Text>
          )}
        </View>

        <View style={[styles.section, shadowCard]}>
          <Text style={styles.sectionTitle}>Method</Text>
          {dish.method.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <AdBanner slot="dish" />
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 8 },
  pad: { padding: 20, gap: 16 },
  missing: { textAlign: 'center', color: colors.inkSoft, padding: 32 },
  title: { fontSize: 26, fontWeight: '900', color: colors.ink },
  blurb: { fontSize: 14.5, color: colors.inkSoft, marginTop: 6, lineHeight: 20 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  meta: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    minWidth: 68,
  },
  metaLabel: { fontSize: 10, fontWeight: '800', color: colors.inkSoft, letterSpacing: 0.6 },
  metaValue: { fontSize: 15, fontWeight: '800', color: colors.ink, marginTop: 1 },
  section: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.ink, marginBottom: 8 },
  serves: { fontSize: 12, color: colors.inkSoft, fontWeight: '700' },
  ingRow: { flexDirection: 'row', gap: 8, paddingVertical: 3 },
  bullet: { color: colors.primary, fontSize: 15, fontWeight: '900' },
  ingText: { flex: 1, fontSize: 14.5, color: colors.ink, lineHeight: 20 },
  added: { marginTop: 8, fontSize: 12.5, color: colors.inkSoft, textAlign: 'center' },
  addedLink: { color: colors.primary, fontWeight: '800' },
  stepRow: { flexDirection: 'row', gap: 12, paddingVertical: 7 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  stepText: { flex: 1, fontSize: 14.5, color: colors.ink, lineHeight: 21 },
});
