import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePrefs } from '@/store/prefs';
import { useShoppingList } from '@/store/shoppingList';
import { loadCatalog } from '@/data/dishes';
import { prefetchUpdate, useAutoUpdate } from '@/lib/updates';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Shown instead of a hard crash if anything in the app tree throws while
// rendering. Keeps the message on screen so it can be reported.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: '#EEF2F6', paddingTop: 64 }}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#161D2B', marginBottom: 8 }}>
          Something went wrong
        </Text>
        <Text style={{ fontSize: 14, color: '#161D2B', marginBottom: 12 }}>
          {String(error?.message ?? error)}
        </Text>
        <Text selectable style={{ fontSize: 11, color: '#5B6B7C', lineHeight: 15 }}>
          {String(error?.stack ?? '').slice(0, 2000)}
        </Text>
        <Text
          onPress={retry}
          style={{ marginTop: 20, fontSize: 15, fontWeight: '800', color: '#0FB5A6' }}
        >
          Tap to retry
        </Text>
      </ScrollView>
    </View>
  );
}

export default function RootLayout() {
  const prefsHydrated = usePrefs((s) => s.hydrated);
  const listHydrated = useShoppingList((s) => s.hydrated);

  // Apply a freshly-downloaded OTA update at launch (see useAutoUpdate).
  useAutoUpdate();

  useEffect(() => {
    if (prefsHydrated && listHydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [prefsHydrated, listHydrated]);

  useEffect(() => {
    // Fail-safe: never let the splash sit forever if a store doesn't hydrate.
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    prefetchUpdate();
    loadCatalog();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="setup" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="how-it-works" options={{ animation: 'fade' }} />
          <Stack.Screen name="question" />
          <Stack.Screen name="pick" />
          <Stack.Screen name="search" />
          <Stack.Screen name="wheel" />
          <Stack.Screen name="results" />
          <Stack.Screen name="dish/[id]" />
          <Stack.Screen name="shopping-list" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="remove-ads" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
