import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadowCard } from '@/theme';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
  haptic = true,
}: Props) {
  const palette = VARIANTS[variant];
  return (
    <Pressable
      onPress={() => {
        if (disabled || loading) return;
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        variant !== 'ghost' && variant !== 'outline' && shadowCard,
        pressed && !disabled && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={palette.fg} />
        ) : (
          <>
            {icon}
            <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
  accent: { bg: colors.accent, fg: colors.ink, border: colors.accent },
  outline: { bg: 'transparent', fg: colors.ink, border: colors.ink },
  ghost: { bg: 'transparent', fg: colors.inkSoft, border: 'transparent' },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.pill,
    borderWidth: 2,
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  label: { fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  disabled: { opacity: 0.45 },
});
