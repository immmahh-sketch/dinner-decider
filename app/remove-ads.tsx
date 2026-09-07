import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { usePrefs } from '@/store/prefs';
import { openExternal } from '@/lib/links';
import { useAppUpdates } from '@/lib/updates';
import { colors, radius, shadowCard } from '@/theme';

// Placeholder hosted-checkout link. Swap for a real Stripe Payment Link or
// Gumroad product URL, then deliver the unlock code on success. See MONETISATION.md.
const CHECKOUT_URL = 'https://example.com/dinner-decider/remove-ads';
const UNLOCK_CODE = 'DINNER2025';

function updateBlurb(status: string, current: string): string {
  switch (status) {
    case 'ready':
      return 'A new version has been downloaded. Restart to apply it.';
    case 'downloading':
      return 'Downloading the latest version…';
    case 'checking':
      return 'Checking for a newer version…';
    case 'up-to-date':
      return `You are on the latest version (${current}).`;
    case 'unavailable':
      return 'Over-the-air updates are only active in the installed app, not in Expo Go.';
    case 'error':
      return 'Could not check right now. Try again when you have signal.';
    default:
      return `Running ${current}. Updates download automatically; you can also check now.`;
  }
}

export default function RemoveAds() {
  const router = useRouter();
  const adsRemoved = usePrefs((s) => s.adsRemoved);
  const setAdsRemoved = usePrefs((s) => s.setAdsRemoved);
  const setHideHowItWorks = usePrefs((s) => s.setHideHowItWorks);
  const updates = useAppUpdates();

  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const redeem = () => {
    if (code.trim().toUpperCase() === UNLOCK_CODE) {
      setAdsRemoved(true);
      setError('');
    } else {
      setError('That code did not work. Check your email receipt.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.h1}>Settings</Text>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Text style={styles.close}>Done</Text>
        </Pressable>
      </View>

      <View style={[styles.card, shadowCard]}>
        <Text style={styles.badge}>ONE-TIME · £2.99</Text>
        <Text style={styles.cardTitle}>Remove ads</Text>
        <Text style={styles.cardBody}>
          Support the app and lose every ad slot, forever, on this device.
        </Text>

        {adsRemoved ? (
          <View style={styles.doneRow}>
            <Text style={styles.doneText}>✅ Ads are off. Thank you!</Text>
            <Pressable onLongPress={() => setAdsRemoved(false)}>
              <Text style={styles.restoreHint}>(long-press to re-enable for testing)</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Button
              label="Continue to checkout"
              variant="primary"
              onPress={() => openExternal(CHECKOUT_URL)}
              style={{ marginTop: 16 }}
            />
            <Pressable onPress={() => setShowCode((v) => !v)} style={{ marginTop: 12 }}>
              <Text style={styles.codeToggle}>Have an unlock code?</Text>
            </Pressable>
            {showCode && (
              <View style={styles.codeBox}>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="Enter code"
                  placeholderTextColor={colors.inkSoft}
                  style={styles.input}
                />
                <Button label="Redeem" variant="accent" onPress={redeem} />
              </View>
            )}
            {!!error && <Text style={styles.error}>{error}</Text>}
          </>
        )}
      </View>

      <View style={[styles.card, shadowCard]}>
        <Text style={styles.cardTitle}>App updates</Text>
        <Text style={styles.cardBody}>{updateBlurb(updates.status, updates.currentLabel)}</Text>
        {updates.status === 'ready' ? (
          <Button
            label="Restart to update"
            variant="accent"
            onPress={updates.restart}
            style={{ marginTop: 14 }}
          />
        ) : (
          <Button
            label={updates.status === 'checking' || updates.status === 'downloading' ? 'Checking…' : 'Check for updates'}
            variant="outline"
            onPress={updates.check}
            disabled={updates.status === 'checking' || updates.status === 'downloading'}
            style={{ marginTop: 14 }}
          />
        )}
      </View>

      <View style={[styles.card, shadowCard]}>
        <Text style={styles.cardTitle}>Show me how it works again</Text>
        <Text style={styles.cardBody}>Bring back the intro screen next time you start.</Text>
        <Button
          label="Re-enable intro"
          variant="outline"
          onPress={() => setHideHowItWorks(false)}
          style={{ marginTop: 14 }}
        />
      </View>

      <Text style={styles.legal}>
        In-app purchases are not available on sideloaded builds, so “Remove ads” uses a web
        checkout that emails an unlock code. Ads currently show a placeholder until an ad
        network is connected.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  h1: { fontSize: 24, fontWeight: '900', color: colors.ink },
  close: { fontSize: 16, fontWeight: '800', color: colors.primary },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  badge: { fontSize: 11, fontWeight: '900', color: colors.primary, letterSpacing: 1 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: colors.ink, marginTop: 4 },
  cardBody: { fontSize: 13.5, color: colors.inkSoft, marginTop: 4, lineHeight: 19 },
  doneRow: { marginTop: 14, gap: 4 },
  doneText: { fontSize: 15, fontWeight: '800', color: colors.mint },
  restoreHint: { fontSize: 11, color: colors.inkSoft },
  codeToggle: { fontSize: 13, fontWeight: '800', color: colors.primary },
  codeBox: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    backgroundColor: colors.bg,
  },
  error: { color: colors.danger, fontSize: 12.5, marginTop: 8 },
  legal: { fontSize: 11, color: colors.inkSoft, lineHeight: 16, marginTop: 4 },
});
