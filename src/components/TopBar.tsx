import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useShoppingList } from '@/store/shoppingList';
import { colors } from '@/theme';

interface Props {
  title?: string;
  showBack?: boolean;
  showBasket?: boolean;
  onBack?: () => void;
}

export function TopBar({ title, showBack = true, showBasket = true, onBack }: Props) {
  const router = useRouter();
  const count = useShoppingList((s) => s.items.length);

  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {showBack && (
          <Pressable
            hitSlop={12}
            onPress={() => (onBack ? onBack() : router.back())}
            style={styles.iconBtn}
          >
            <Text style={styles.chevron}>‹</Text>
          </Pressable>
        )}
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title ?? ''}
      </Text>

      <View style={[styles.side, { alignItems: 'flex-end' }]}>
        {showBasket && (
          <Pressable
            hitSlop={12}
            onPress={() => router.push('/shopping-list')}
            style={styles.iconBtn}
          >
            <Text style={styles.basket}>🧺</Text>
            {count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 48,
  },
  side: { width: 56, justifyContent: 'center' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { fontSize: 34, lineHeight: 36, color: colors.ink, fontWeight: '800' },
  basket: { fontSize: 22 },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: colors.ink },
  badge: {
    position: 'absolute',
    right: 0,
    top: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
