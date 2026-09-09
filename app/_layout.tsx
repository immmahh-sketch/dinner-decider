// BISECT build 22 — providers + @/store/prefs + @/data/dishes.
// (= crashing build 17's _layout, minus @/store/shoppingList, which
// build 21 proved is fine.)
// crash -> it's @/store/prefs (engine chain / module-scope subscribe) or
//          @/data/dishes (require.context of ~2177 JSON).
// launch -> the crash needs shoppingList present too (interaction).
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePrefs } from '@/store/prefs';
import { loadCatalog } from '@/data/dishes';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const prefsHydrated = usePrefs((s) => s.hydrated);

  useEffect(() => {
    if (prefsHydrated) SplashScreen.hideAsync().catch(() => {});
  }, [prefsHydrated]);

  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadCatalog();
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
