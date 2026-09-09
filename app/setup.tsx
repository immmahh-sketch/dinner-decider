import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { looksLikePostcode, tidyPostcode, usePrefs } from '@/store/prefs';
import { colors, radius, shadowCard } from '@/theme';

export default function Setup() {
  const router = useRouter();
  const username = usePrefs((s) => s.username);
  const postcode = usePrefs((s) => s.postcode);
  const setUsername = usePrefs((s) => s.setUsername);
  const setPostcode = usePrefs((s) => s.setPostcode);
  const setOnboarded = usePrefs((s) => s.setOnboarded);

  const [pcText, setPcText] = useState(postcode);
  const pcOk = pcText.trim() === '' || looksLikePostcode(pcText);

  const finish = () => {
    if (pcText.trim() && looksLikePostcode(pcText)) setPostcode(pcText);
    setOnboarded(true);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Quick set-up</Text>
          <Text style={styles.sub}>Two optional bits. You can change or skip either.</Text>

          <View style={[styles.card, shadowCard]}>
            <Text style={styles.label}>Your name</Text>
            <Text style={styles.hint}>Shown when you share a dinner idea — “Sam reckons…”.</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="e.g. Sam"
              placeholderTextColor={colors.inkSoft}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={24}
              style={styles.input}
            />
          </View>

          <View style={[styles.card, shadowCard]}>
            <Text style={styles.label}>Your postcode</Text>
            <Text style={styles.hint}>
              Used to open Just Eat, Deliveroo, Uber Eats and local searches for the right
              area. Saved on this phone only — never sent anywhere else.
            </Text>
            <TextInput
              value={pcText}
              onChangeText={(t) => setPcText(tidyPostcode(t))}
              onBlur={() => pcText.trim() && looksLikePostcode(pcText) && setPostcode(pcText)}
              placeholder="e.g. SW1A 1AA"
              placeholderTextColor={colors.inkSoft}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="postal-code"
              maxLength={8}
              style={[styles.input, !pcOk && styles.inputError]}
            />
            {!pcOk && <Text style={styles.err}>That doesn’t look like a UK postcode.</Text>}
          </View>

          <Button label="Done" variant="primary" onPress={finish} style={{ marginTop: 8 }} />
          <Pressable onPress={finish} hitSlop={12} style={{ alignSelf: 'center', marginTop: 14 }}>
            <Text style={styles.skip}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 24, paddingTop: 32, gap: 14 },
  h1: { fontSize: 28, fontWeight: '900', color: colors.ink },
  sub: { fontSize: 14.5, color: colors.inkSoft, marginTop: 4, marginBottom: 6, lineHeight: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  label: { fontSize: 16, fontWeight: '900', color: colors.ink },
  hint: { fontSize: 12.5, color: colors.inkSoft, marginTop: 4, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    backgroundColor: colors.bg,
    marginTop: 12,
  },
  inputError: { borderColor: colors.danger },
  err: { color: colors.danger, fontSize: 12, marginTop: 6 },
  skip: { fontSize: 14, fontWeight: '800', color: colors.inkSoft },
});
