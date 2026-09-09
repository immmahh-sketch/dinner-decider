import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wheel } from '@/components/Wheel';
import { FadeInView } from '@/components/FadeInView';
import { Button } from '@/components/Button';
import { WHEEL_TITLES } from '@/data/dishes';
import { useDecider } from '@/store/decider';
import { useCatalogStats } from '@/store/catalog';
import { usePrefs } from '@/store/prefs';
import { UPDATED_AT } from '@/meta';
import { colors } from '@/theme';

export default function Welcome() {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const hideHowItWorks = usePrefs((s) => s.hideHowItWorks);
  const username = usePrefs((s) => s.username);
  const postcode = usePrefs((s) => s.postcode);
  const onboarded = usePrefs((s) => s.onboarded);
  const prefsHydrated = usePrefs((s) => s.hydrated);
  const start = useDecider((s) => s.start);
  const stats = useCatalogStats();

  // First launch: send the user through the one-time set-up screen.
  if (prefsHydrated && !onboarded) {
    return <Redirect href="/setup" />;
  }

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
          <FadeInView from="down" duration={400} style={styles.cta}>
            <Button label="Help me decide" onPress={begin} variant="primary" />
            <Text style={styles.count}>
              {stats.total.toLocaleString()} dinners in the deck
              {stats.source === 'bundled' ? ' · loading the full menu…' : ''}
            </Text>
            {(!username || !postcode) && (
              <Pressable onPress={() => router.push('/remove-ads')}>
                <Text style={styles.nameNudge}>
                  {!username && !postcode
                    ? '＋ Add your name & postcode in Settings'
                    : !username
                      ? '＋ Add your name so you can share picks'
                      : '＋ Add your postcode to order takeaways faster'}
                </Text>
              </Pressable>
            )}
          </FadeInView>
        )}
      </View>

      <Text style={styles.updated}>Updated {UPDATED_AT}</Text>
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
  nameNudge: {
    textAlign: 'center',
    color: colors.primary,
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 2,
  },
  updated: {
    textAlign: 'center',
    color: colors.inkSoft,
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.45,
    paddingBottom: 10,
  },
});
