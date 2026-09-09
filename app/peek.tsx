import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { FadeInView } from '@/components/FadeInView';
import { colors, radius, shadowCard } from '@/theme';

export default function Peek() {
  const router = useRouter();
  const { count, ignored } = useLocalSearchParams<{ count: string; ignored: string }>();
  const n = Number(count ?? 0);
  const wasIgnored = ignored === '1';

  return (
    <FadeInView from="none" duration={180} style={styles.backdrop}>
      <FadeInView from="none" duration={220} style={[styles.card, shadowCard]}>
        <Text style={styles.big}>{n}</Text>
        <Text style={styles.label}>
          {n === 1 ? 'dinner idea matches' : 'dinner ideas match so far'}
        </Text>

        {wasIgnored && (
          <Text style={styles.note}>
            Nothing matched that one exactly, so we kept your previous options.
          </Text>
        )}

        <View style={styles.actions}>
          <Button
            label={`Show me the ${n}`}
            variant="accent"
            onPress={() => router.replace('/results')}
          />
          <Button label="Keep narrowing it down" variant="outline" onPress={() => router.back()} />
        </View>
      </FadeInView>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(43,33,24,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 26,
    alignItems: 'center',
  },
  big: { fontSize: 64, fontWeight: '900', color: colors.primary, lineHeight: 70 },
  label: { fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: 2 },
  note: {
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  actions: { alignSelf: 'stretch', gap: 10, marginTop: 22 },
});
