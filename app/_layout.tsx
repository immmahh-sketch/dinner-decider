// BISECT build 20 — providers (all fine per build 19) + ONE zustand store
// that uses persist + AsyncStorage (@/store/shoppingList), nothing else.
// Build 19 (providers only) launched; build 17 (providers + stores) crashed.
// If (20) crashes -> AsyncStorage / zustand-persist is the trigger.
// If (20) launches -> it's @/store/prefs (its @/engine/exclude ->
// dishText -> recipeTemplates.mjs chain / module-scope subscribe) or
// @/data/dishes.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useShoppingList } from '@/store/shoppingList';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const listHydrated = useShoppingList((s) => s.hydrated);
  // touch it so the store isn't tree-shaken
  if (listHydrated) SplashScreen.hideAsync().catch(() => {});

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
