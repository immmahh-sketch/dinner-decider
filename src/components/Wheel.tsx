import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { colors, wheelColors } from '@/theme';

const SIZE = 300;
const R = SIZE / 2;
const SPIN_MS = 3000;

function wedgePath(index: number, total: number) {
  const seg = (2 * Math.PI) / total;
  const a1 = index * seg - Math.PI / 2;
  const a2 = a1 + seg;
  const x1 = R + R * Math.cos(a1);
  const y1 = R + R * Math.sin(a1);
  const x2 = R + R * Math.cos(a2);
  const y2 = R + R * Math.sin(a2);
  return `M ${R} ${R} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

function labelPos(index: number, total: number) {
  const seg = 360 / total;
  const mid = index * seg + seg / 2 - 90;
  const rad = (mid * Math.PI) / 180;
  const dist = R * 0.62;
  return {
    x: R + dist * Math.cos(rad),
    y: R + dist * Math.sin(rad),
    rotate: mid,
  };
}

interface Props {
  titles: string[];
  /** Fires once the intro spin + title reveal has finished. */
  onRevealed?: () => void;
}

export function Wheel({ titles, onRevealed }: Props) {
  const spin = useSharedValue(0);
  const titleScale = useSharedValue(0);
  const titleRotate = useSharedValue(-9);
  const taglineOpacity = useSharedValue(0);
  const started = useRef(false);
  const done = useRef(false);

  useEffect(() => {
    if (started.current) return; // guard against dev double-invoke / fast refresh
    started.current = true;

    const turns = 4 + Math.random() * 2;
    spin.value = withTiming(360 * turns + Math.random() * 300, {
      duration: SPIN_MS,
      easing: Easing.out(Easing.cubic),
    });

    // Reveal is driven by plain JS timers, and the pop uses withTiming + a back
    // easing so it always settles at exactly 1 (springs can overshoot on web).
    const revealAt = setTimeout(() => {
      titleRotate.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
      titleScale.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.back(2.2)) });
      taglineOpacity.value = withDelay(400, withTiming(1, { duration: 350 }));
    }, SPIN_MS - 250);

    const finishAt = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      onRevealed?.();
    }, SPIN_MS + 500);

    return () => {
      clearTimeout(revealAt);
      clearTimeout(finishAt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleScale.value <= 0.01 ? 0 : 1,
    transform: [{ scale: titleScale.value }, { rotate: `${titleRotate.value}deg` }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={wheelStyle}>
        <Svg width={SIZE} height={SIZE}>
          <G>
            {titles.map((t, i) => (
              <Path
                key={`w-${i}`}
                d={wedgePath(i, titles.length)}
                fill={wheelColors[i % wheelColors.length]}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            ))}
            {titles.map((t, i) => {
              const { x, y, rotate } = labelPos(i, titles.length);
              return (
                <SvgText
                  key={`t-${i}`}
                  x={x}
                  y={y}
                  fill="#ffffff"
                  fontSize={8.5}
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(${rotate} ${x} ${y})`}
                >
                  {t.length > 15 ? t.slice(0, 14) + '…' : t}
                </SvgText>
              );
            })}
            <Circle cx={R} cy={R} r={30} fill="#ffffff" stroke={colors.ink} strokeWidth={4} />
          </G>
        </Svg>
      </Animated.View>

      {/* Fixed pointer */}
      <View pointerEvents="none" style={styles.pointer}>
        <Svg width={34} height={30}>
          <Polygon points="17,30 2,2 32,2" fill={colors.ink} />
        </Svg>
      </View>

      {/* Cartoon title that pops out from the centre */}
      <Animated.View pointerEvents="none" style={[styles.titleWrap, titleStyle]}>
        <View style={styles.titlePlate}>
          <CartoonWord text="DINNER" />
          <CartoonWord text="DECIDER" />
        </View>
      </Animated.View>

      <Animated.Text style={[styles.tagline, taglineStyle]}>
        Spin • Answer a few questions • Eat well
      </Animated.Text>
    </View>
  );
}

function CartoonWord({ text }: { text: string }) {
  return (
    <View style={styles.wordStack}>
      <Text numberOfLines={1} style={[styles.word, styles.wordShadow, { left: 3, top: 3 }]}>
        {text}
      </Text>
      <Text numberOfLines={1} style={[styles.word, styles.wordFront]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  pointer: { position: 'absolute', top: -6, alignItems: 'center' },
  titleWrap: {
    position: 'absolute',
    width: SIZE + 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePlate: {
    backgroundColor: colors.ink,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
  },
  wordStack: { alignItems: 'center', justifyContent: 'center' },
  word: { fontSize: 30, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center' },
  wordFront: { color: colors.accent, position: 'relative' },
  wordShadow: { color: colors.primary, position: 'absolute' },
  tagline: {
    position: 'absolute',
    bottom: -52,
    width: SIZE + 80,
    textAlign: 'center',
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: '700',
  },
});
