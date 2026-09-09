import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePrefs } from '@/store/prefs';
import { useShoppingList } from '@/store/shoppingList';
import { loadCatalog } from '@/data/dishes';
import { prefetchUpdate } from '@/lib/updates';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const prefsHydrated = usePrefs((s) => s.hydrated);
  const listHydrated = useShoppingList((s) => s.hydrated);

  useEffect(() => {
    if (prefsHydrated && listHydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [prefsHydrated, listHydrated]);

  useEffect(() => {
    // Eagerly pull any OTA update so it is ready to apply on the next launch.
    prefetchUpdate();
    // Fetch the full hosted catalogue in the background; the app runs on the
    // bundled deck until it arrives.
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
          <Stack.Screen name="peek" options={{ animation: 'fade', presentation: 'transparentModal' }} />
          <Stack.Screen name="results" />
          <Stack.Screen name="dish/[id]" />
          <Stack.Screen name="shopping-list" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="remove-ads" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
