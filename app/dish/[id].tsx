import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { AdBanner } from '@/components/AdBanner';
import { Button } from '@/components/Button';
import { dishById, loadCatalog } from '@/data/dishes';
import { hydrateDish } from '@/engine/hydrate';
import { Dish, isHome } from '@/engine/types';
import { estimateDish, planLabel } from '@/engine/estimate';
import { answersFromSteps } from '@/engine/filter';
import { useShoppingList } from '@/store/shoppingList';
import { useDecider } from '@/store/decider';
import { usePrefs } from '@/store/prefs';
import { useCatalogVersion } from '@/store/catalog';
import { findNearMeQuery, mapsSearchUrl, openExternal } from '@/lib/links';
import { shareDish } from '@/lib/share';
import { colors, radius, shadowCard } from '@/theme';

const PLAN_NAME: Record<string, string> = {
  sw: 'Slimming World',
  ww: 'WeightWatchers',
  cals: 'Calories',
};

export default function DishDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // A shared link may land here before the hosted catalogue has loaded, so
  // pull it in and re-resolve when it arrives.
  const catVersion = useCatalogVersion();
  useEffect(() => {
    loadCatalog();
  }, []);
  const dish = useMemo(
    () => (id ? hydrateDish(dishById(id)) : undefined),
    [id, catVersion],
  );

  const steps = useDecider((s) => s.steps);
  const username = usePrefs((s) => s.username);
  const plan = planLabel(answersFromSteps(steps).q_plan);

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
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{dish.name}</Text>
          <Text style={styles.blurb}>{dish.blurb}</Text>
          <NutritionCard dish={dish} plan={plan} />
          <Button
            label="Find this near me"
            variant="primary"
            onPress={() => openExternal(mapsSearchUrl(findNearMeQuery(dish)))}
          />
          <Button
            label="Share this idea"
            variant="outline"
            onPress={() => shareDish(dish, username)}
          />
        </ScrollView>
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

        <NutritionCard dish={dish} plan={plan} />

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

        <Button
          label="Share this dinner"
          variant="outline"
          onPress={() => shareDish(dish, username)}
          style={{ marginTop: 18 }}
        />

        <AdBanner slot="dish" />
      </ScrollView>
    </SafeAreaView>
  );
}

function NutritionCard({ dish, plan }: { dish: Dish; plan: ReturnType<typeof planLabel> }) {
  const e = estimateDish(dish);
  return (
    <View style={[styles.section, shadowCard]}>
      <Text style={styles.sectionTitle}>Rough nutrition</Text>
      <Text style={styles.nutriSub}>Estimated per portion — a guide, not the label.</Text>

      {plan && plan !== 'cals' && (
        <View style={styles.planPill}>
          <Text style={styles.planPillText}>
            ≈ {plan === 'sw' ? `${e.sw} Syns` : `${e.ww} Points`} · {PLAN_NAME[plan]}
          </Text>
        </View>
      )}

      <View style={styles.nutriGrid}>
        <Nutri label="Energy" value={`${e.kcal} kcal`} />
        <Nutri label="Fat" value={`${e.fat} g`} />
        <Nutri label="Sat fat" value={`${e.satFat} g`} />
        <Nutri label="Carbs" value={`${e.carbs} g`} />
        <Nutri label="Sugars" value={`${e.sugar} g`} />
        <Nutri label="Protein" value={`${e.protein} g`} />
        <Nutri label="Salt" value={`${e.salt} g`} />
        <Nutri label="Fibre" value={`${e.fibre} g`} />
      </View>

      <Text style={styles.nutriDisclaimer}>
        Worked out from the recipe style, not a lab test. Slimming World Syns and
        WeightWatchers Points are approximate — check your own app for the exact score.
      </Text>
    </View>
  );
}

function Nutri({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.nutri}>
      <Text style={styles.nutriValue}>{value}</Text>
      <Text style={styles.nutriLabel}>{label}</Text>
    </View>
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
  // nutrition
  nutriSub: { fontSize: 12.5, color: colors.inkSoft, marginTop: -2, marginBottom: 4 },
  planPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  planPillText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  nutriGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  nutri: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    minWidth: 78,
  },
  nutriValue: { fontSize: 15, fontWeight: '900', color: colors.ink },
  nutriLabel: { fontSize: 10.5, fontWeight: '800', color: colors.inkSoft, letterSpacing: 0.4, marginTop: 1 },
  nutriDisclaimer: { fontSize: 11, color: colors.inkSoft, lineHeight: 16, marginTop: 12 },
});
