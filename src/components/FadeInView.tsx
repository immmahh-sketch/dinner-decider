import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

/**
 * A drop-in replacement for the handful of reanimated `entering` animations the
 * app used (FadeIn / FadeInDown / FadeInRight). Built on React Native's core
 * Animated API — no native module, no worklets — so it works on any build.
 */
export function FadeInView({
  children,
  style,
  delay = 0,
  duration = 350,
  from = 'down',
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  duration?: number;
  from?: 'down' | 'up' | 'right' | 'left' | 'none';
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(t, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [t, delay, duration]);

  const offset = 14;
  const translateX =
    from === 'right'
      ? t.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] })
      : from === 'left'
        ? t.interpolate({ inputRange: [0, 1], outputRange: [-offset, 0] })
        : 0;
  const translateY =
    from === 'down'
      ? t.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] })
      : from === 'up'
        ? t.interpolate({ inputRange: [0, 1], outputRange: [-offset, 0] })
        : 0;

  return (
    <Animated.View style={[style, { opacity: t, transform: [{ translateX }, { translateY }] }]}>
      {children}
    </Animated.View>
  );
}
