import { Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFavourites } from '@/store/favourites';
import { colors } from '@/theme';

export function FavouriteButton({ dishId, size = 30 }: { dishId: string; size?: number }) {
  const isFav = useFavourites((s) => s.ids.includes(dishId));
  const toggle = useFavourites((s) => s.toggle);

  return (
    <Pressable
      hitSlop={12}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        toggle(dishId);
      }}
      style={[
        styles.btn,
        { width: size, height: size, borderRadius: size / 2 },
        isFav && styles.btnActive,
      ]}
    >
      <Text style={[styles.icon, { fontSize: size * 0.52 }, isFav && styles.iconActive]}>
        {isFav ? '♥' : '♡'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  btnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  icon: { fontWeight: '900', color: colors.accent },
  iconActive: { color: '#fff' },
});
