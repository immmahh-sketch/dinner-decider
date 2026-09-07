import { StyleSheet, Text, View } from 'react-native';
import { usePrefs } from '@/store/prefs';
import { colors, radius } from '@/theme';

/**
 * Ad slot placeholder.
 *
 * Monetisation is scaffolded but not wired to a live network yet. To switch on
 * real ads later (see MONETISATION.md):
 *   1. `npx expo install react-native-google-mobile-ads`
 *   2. add the plugin + app IDs to app.json
 *   3. replace the <View> below with <BannerAd unitId={UNIT_IDS.banner} ... />
 *
 * Google's official test unit IDs, safe to ship during development:
 */
export const UNIT_IDS = {
  // banner test id
  banner: 'ca-app-pub-3940256099942544/6300978111',
  // interstitial test id
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};

interface Props {
  /** where in the app this slot sits, for future targeting/analytics */
  slot?: string;
}

export function AdBanner({ slot = 'generic' }: Props) {
  const adsRemoved = usePrefs((s) => s.adsRemoved);
  if (adsRemoved) return null;

  return (
    <View style={styles.wrap} accessibilityLabel={`advertisement (${slot})`}>
      <Text style={styles.kicker}>ADVERTISEMENT</Text>
      <Text style={styles.body}>Your ad could be here</Text>
      <Text style={styles.hint}>Remove ads for £2.99 in Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  kicker: { fontSize: 10, fontWeight: '800', color: colors.inkSoft, letterSpacing: 1 },
  body: { fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 2 },
  hint: { fontSize: 11, color: colors.inkSoft, marginTop: 2 },
});
