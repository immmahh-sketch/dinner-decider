// BISECT build 24 — providers + ONLY @/store/prefs (its @/engine/exclude
// -> dishText -> recipeTemplates.mjs chain + module-scope
// syncExcluder/subscribe). NO @/data/dishes, NO @/store/shoppingList.
// Run in parallel with build 23 (providers + prefs + data/dishes):
//   23 crash + 24 crash  -> @/store/prefs is the trigger
//   23 crash + 24 launch -> @/data/dishes is the trigger
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePrefs } from '@/store/prefs';

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
