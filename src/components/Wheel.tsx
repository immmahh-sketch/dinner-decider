import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { colors, wheelColors } from '@/theme';

const SIZE = 300;
const R = SIZE / 2;

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

function labelTransform(index: number, total: number) {
  const seg = 360 / total;
  const mid = index * seg + seg / 2 - 90;
  const rad = (mid * Math.PI) / 180;
  const dist = R * 0.6;
  const x = R + dist * Math.cos(rad);
  const y = R + dist * Math.sin(rad);
  return { x, y, rotate: mid };
}

interface Props {
  titles: string[];
  /** Fires once the intro spin + title reveal has finished. */
  onRevealed?: () => void;
}

export function Wheel({ titles, onRevealed }: Props) {
  const spin = useSharedValue(0);
  const titleScale = useSharedValue(0);
  const titleRotate = useSharedValue(-8);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const turns = 4 + Math.random() * 2;
    spin.value = withTiming(
      360 * turns + Math.random() * 360,
      { duration: 3200, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          titleRotate.value = withSpring(0, { damping: 6, stiffness: 120 });
          titleScale.value = withSequence(
            withSpring(1.18, { damping: 5, stiffness: 140 }),
            withSpring(1, { damping: 8, stiffness: 120 }, (done) => {
              if (done) runOnJS(finish)();
            }),
          );
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    setRevealed(true);
    onRevealed?.();
  }

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }, { rotate: `${titleRotate.value}deg` }],
    opacity: titleScale.value === 0 ? 0 : 1,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: withDelay(150, withTiming(revealed ? 1 : 0, { duration: 400 })),
  }));

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
              const { x, y, rotate } = labelTransform(i, titles.length);
              return (
                <SvgText
                  key={`t-${i}`}
                  x={x}
                  y={y}
                  fill="#ffffff"
                  fontSize={9}
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(${rotate} ${x} ${y})`}
                >
                  {t.length > 15 ? t.slice(0, 14) + '…' : t}
                </SvgText>
              );
            })}
            <Circle cx={R} cy={R} r={26} fill="#ffffff" stroke={colors.ink} strokeWidth={3} />
          </G>
        </Svg>
      </Animated.View>

      {/* Fixed pointer */}
      <View pointerEvents="none" style={styles.pointer}>
        <Svg width={34} height={30}>
          <Polygon points="17,30 2,2 32,2" fill={colors.ink} />
        </Svg>
      </View>

      {/* Expanding cartoon title */}
      <Animated.View pointerEvents="none" style={[styles.titleWrap, titleStyle]}>
        <CartoonWord text="DINNER" />
        <CartoonWord text="DECIDER" offset />
      </Animated.View>

      <Animated.Text style={[styles.tagline, subtitleStyle]}>
        Spin the wheel. Answer a few questions. Eat well.
      </Animated.Text>
    </View>
  );
}

function CartoonWord({ text, offset }: { text: string; offset?: boolean }) {
  return (
    <View style={[styles.wordStack, offset && { marginTop: -6 }]}>
      {/* faux outline / drop-shadow layers */}
      <Text style={[styles.word, styles.wordShadow, { left: 3, top: 3 }]}>{text}</Text>
      <Text style={[styles.word, styles.wordShadow, { left: -2, top: 2 }]}>{text}</Text>
      <Text style={[styles.word, styles.wordFront]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  pointer: { position: 'absolute', top: -6, alignItems: 'center' },
  titleWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  wordStack: { alignItems: 'center', justifyContent: 'center' },
  word: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  wordFront: { color: colors.accent, position: 'relative' },
  wordShadow: { color: colors.ink, position: 'absolute' },
  tagline: {
    position: 'absolute',
    bottom: -54,
    width: SIZE + 60,
    textAlign: 'center',
    color: colors.inkSoft,
    fontSize: 14,
    fontWeight: '600',
  },
});
