import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wheel } from '@/components/Wheel';
import { Button } from '@/components/Button';
import { WHEEL_TITLES, DATASET_COUNTS } from '@/data/dishes';
import { useDecider } from '@/store/decider';
import { usePrefs } from '@/store/prefs';
import { colors } from '@/theme';

export default function Welcome() {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const hideHowItWorks = usePrefs((s) => s.hideHowItWorks);
  const start = useDecider((s) => s.start);

  const begin = () => {
    start();
    if (hideHowItWorks) router.replace('/question');
    else router.push('/how-it-works');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Pressable hitSlop={12} onPress={() => router.push('/remove-ads')}>
          <Text style={styles.settings}>⚙︎ Settings</Text>
        </Pressable>
      </View>
      <View style={styles.wheelArea}>
        <Wheel titles={WHEEL_TITLES} onRevealed={() => setRevealed(true)} />
      </View>

      <View style={styles.bottom}>
        {revealed && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.cta}>
            <Button label="Help me decide" onPress={begin} variant="primary" />
            <Text style={styles.count}>
              {DATASET_COUNTS.total.toLocaleString()} dinners in the deck
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topRow: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 4 },
  settings: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  wheelArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottom: { minHeight: 140, paddingHorizontal: 28, justifyContent: 'flex-start' },
  cta: { gap: 12, alignItems: 'stretch' },
  count: { textAlign: 'center', color: colors.inkSoft, fontSize: 13, fontWeight: '600' },
});
