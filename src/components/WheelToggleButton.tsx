import { Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWheelPicks } from '@/store/wheelPicks';
import { colors } from '@/theme';

/** Quick-add/remove a dish to/from tonight's wheel, independent of favouriting it. */
export function WheelToggleButton({ dishId, size = 30 }: { dishId: string; size?: number }) {
  const onWheel = useWheelPicks((s) => s.ids.includes(dishId));
  const toggle = useWheelPicks((s) => s.toggle);

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
        onWheel && styles.btnActive,
      ]}
    >
      <Text style={[styles.icon, { fontSize: size * 0.5 }]}>🎡</Text>
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
  btnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  icon: { fontWeight: '900' },
});
