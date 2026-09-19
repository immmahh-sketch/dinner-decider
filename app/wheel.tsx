import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/Button';
import { ALL_DISHES, dishById } from '@/data/dishes';
import { useCatalogVersion } from '@/store/catalog';
import { randomDishes } from '@/engine/spin';
import { hydrateDish } from '@/engine/hydrate';
import { Dish } from '@/engine/types';
import { useWheelPicks } from '@/store/wheelPicks';
import { colors, radius, shadowCard, wheelColors } from '@/theme';

const SIZE = 300;
const R = SIZE / 2;
const RANDOM_N = 20;
const SPIN_MS = 3900;

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
  const dist = R * 0.63;
  return { x: R + dist * Math.cos(rad), y: R + dist * Math.sin(rad), rotate: mid };
}

/** Resolve the favourites picked on /wheel-build, or null if there aren't at least 2. */
function resolveCustom(ids: string[] | null): Dish[] | null {
  if (!ids || ids.length < 2) return null;
  const ds = ids.map((id) => hydrateDish(dishById(id))).filter((d): d is Dish => !!d);
  return ds.length >= 2 ? ds : null;
}

export default function WheelPick() {
  const router = useRouter();
  const catVersion = useCatalogVersion();
  const customIds = useWheelPicks((s) => s.customIds);
  const setCustomIds = useWheelPicks((s) => s.setCustomIds);

  const [isCustom, setIsCustom] = useState(() => resolveCustom(customIds) != null);
  const [dishes, setDishes] = useState<Dish[]>(
    () => resolveCustom(customIds) ?? randomDishes(ALL_DISHES, RANDOM_N),
  );
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  // one-shot handoff: consume it once on mount so a later plain "Spin the
  // wheel" from the home screen doesn't silently reuse an old custom pick.
  useEffect(() => {
    setCustomIds(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const n = dishes.length;
  const seg = 360 / n;

  const rot = useSharedValue(0);
  const net = useRef(0); // net degrees applied so far

  const wheelStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));

  const spin = () => {
    if (phase === 'spinning') return;
    setPhase('spinning');
    setPickedIndex(null);

    const k = Math.floor(Math.random() * n);
    const turns = 5 + Math.floor(Math.random() * 3); // 5–7 whole turns
    const base = ((net.current % 360) + 360) % 360;
    const want = ((360 - (k + 0.5) * seg) % 360 + 360) % 360;
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const delta = 360 * turns + ((want - base + 360) % 360) + jitter;
    net.current += delta;

    rot.value = withTiming(net.current, { duration: SPIN_MS, easing: Easing.out(Easing.cubic) });
    setTimeout(() => {
      setPickedIndex(k);
      setPhase('result');
    }, SPIN_MS + 120);
  };

  const again = () => {
    // custom mode spins the same hand-picked set again; random mode gets a fresh 20
    if (!isCustom) setDishes(randomDishes(ALL_DISHES, RANDOM_N));
    setPickedIndex(null);
    setPhase('idle');
  };

  const spinRandomInstead = () => {
    setCustomIds(null);
    setIsCustom(false);
    setDishes(randomDishes(ALL_DISHES, RANDOM_N));
    setPickedIndex(null);
    setPhase('idle');
  };

  const picked = pickedIndex != null ? dishes[pickedIndex] : null;

  // keep a stable label list for the current 20
  const labels = useMemo(
    () => dishes.map((d) => (d.name.length > 15 ? d.name.slice(0, 14) + '…' : d.name)),
    [dishes],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Spin the wheel" onBack={() => router.back()} />

      <View style={styles.head}>
        <Text style={styles.h1}>Let fate decide</Text>
        <Text style={styles.sub}>
          {isCustom
            ? `${n} of your favourites on the wheel — spin as many times as you like.`
            : `${n} dinners on the wheel — a new ${n} every spin. Give it a whirl.`}
        </Text>
        <Pressable
          hitSlop={8}
          onPress={isCustom ? spinRandomInstead : () => router.push('/wheel-build')}
        >
          <Text style={styles.modeLink}>
            {isCustom ? '🎲 Spin randomly instead' : '❤️ Build from favourites'}
          </Text>
        </Pressable>
      </View>

      <View key={catVersion} style={styles.stage}>
        <View style={styles.wheelWrap}>
          <Animated.View style={wheelStyle}>
            <Svg width={SIZE} height={SIZE}>
              <G>
                {dishes.map((_, i) => (
                  <Path
                    key={`w-${i}`}
                    d={wedgePath(i, n)}
                    fill={wheelColors[i % wheelColors.length]}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                ))}
                {labels.map((t, i) => {
                  const { x, y, rotate } = labelPos(i, n);
                  return (
                    <SvgText
                      key={`t-${i}`}
                      x={x}
                      y={y}
                      fill="#ffffff"
                      fontSize={8}
                      fontWeight="bold"
                      textAnchor="middle"
                      transform={`rotate(${rotate} ${x} ${y})`}
                    >
                      {t}
                    </SvgText>
                  );
                })}
                <Circle cx={R} cy={R} r={28} fill="#ffffff" stroke={colors.ink} strokeWidth={4} />
              </G>
            </Svg>
          </Animated.View>
          <View pointerEvents="none" style={styles.pointer}>
            <Svg width={34} height={30}>
              <Polygon points="17,30 2,2 32,2" fill={colors.ink} />
            </Svg>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        {phase === 'result' && picked ? (
          <Animated.View entering={FadeIn.duration(300)} style={[styles.resultCard, shadowCard]}>
            <Text style={styles.resultKicker}>🎉 Tonight you&apos;re having</Text>
            <Text style={styles.resultName}>{picked.name}</Text>
            <Text style={styles.resultBlurb} numberOfLines={2}>
              {picked.blurb}
            </Text>
            <View style={styles.resultActions}>
              <Button
                label="See the recipe"
                variant="primary"
                onPress={() => router.push({ pathname: '/dish/[id]', params: { id: picked.id } })}
                style={{ flex: 1 }}
              />
              <Button label="Spin again" variant="outline" onPress={again} style={{ flex: 1 }} />
            </View>
          </Animated.View>
        ) : (
          <Button
            label={phase === 'spinning' ? 'Spinning…' : 'Spin'}
            variant="accent"
            onPress={spin}
            disabled={phase === 'spinning'}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4 },
  h1: { fontSize: 24, fontWeight: '900', color: colors.ink },
  sub: { fontSize: 13.5, color: colors.inkSoft, marginTop: 4, lineHeight: 19 },
  modeLink: { fontSize: 13, fontWeight: '800', color: colors.accent, marginTop: 8 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wheelWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  pointer: { position: 'absolute', top: -6, alignItems: 'center' },
  bottom: { minHeight: 150, paddingHorizontal: 24, paddingBottom: 10, justifyContent: 'center' },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
  },
  resultKicker: { fontSize: 13, fontWeight: '800', color: colors.inkSoft },
  resultName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
    textAlign: 'center',
    marginTop: 4,
  },
  resultBlurb: {
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resultActions: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 16 },
});
