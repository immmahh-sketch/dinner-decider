import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Dish, isHome, isRestaurant, isTakeaway } from '@/engine/types';
import { Plan, planChip } from '@/engine/estimate';
import { colors, radius, shadowCard } from '@/theme';

const VENUE_ICON: Record<string, string> = {
  home: '🍳',
  takeaway: '🛵',
  restaurant: '🍽️',
};

function spiceLabel(n: number) {
  return n === 0 ? '' : '🌶️'.repeat(n);
}

export function DishCard({
  dish,
  onPress,
  plan,
  onShare,
}: {
  dish: Dish;
  onPress: () => void;
  plan?: Plan | null;
  onShare?: () => void;
}) {
  const tags: string[] = [];
  if (isHome(dish)) {
    tags.push(`${dish.timeMinutes} min`);
    if (dish.onePan) tags.push('one pan');
  }
  if (isTakeaway(dish)) tags.push(dish.takeawayType.replace('-', ' '));
  if (isRestaurant(dish)) tags.push('££'.slice(0, dish.priceTier) || '£');
  if (dish.spicy > 0) tags.push(spiceLabel(dish.spicy));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, shadowCard, pressed && styles.pressed]}
    >
      <View style={styles.headRow}>
        <Text style={styles.icon}>{VENUE_ICON[dish.venue]}</Text>
        <Text style={styles.name}>{dish.name}</Text>
        {onShare && (
          <Pressable hitSlop={12} onPress={onShare} style={styles.shareBtn}>
            <Text style={styles.shareIcon}>↗</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.blurb} numberOfLines={2}>
        {dish.blurb}
      </Text>
      <View style={styles.tagRow}>
        {plan && (
          <View style={[styles.tag, styles.planTag]}>
            <Text style={[styles.tagText, styles.planText]}>{planChip(dish, plan)}</Text>
          </View>
        )}
        {tags.filter(Boolean).map((t, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{t}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.95 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 20 },
  name: { fontSize: 18, fontWeight: '800', color: colors.ink, flex: 1 },
  shareBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  shareIcon: { fontSize: 15, fontWeight: '900', color: colors.primary },
  blurb: { fontSize: 13.5, color: colors.inkSoft, marginTop: 6, lineHeight: 19 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: {
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tagText: { fontSize: 11.5, fontWeight: '700', color: colors.inkSoft },
  planTag: { backgroundColor: colors.primary, borderColor: colors.primary },
  planText: { color: '#fff', fontWeight: '900' },
});
