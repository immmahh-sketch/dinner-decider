// BISECT build 18 — providers only, NO stores / data / lib imports.
// Build 15 (bare Stack) launched; build 17 (full _layout) crashed.
// This tests: GestureHandlerRootView + SafeAreaProvider + StatusBar +
// module-scope SplashScreen.preventAutoHideAsync. If (18) crashes -> a
// provider native module. If (18) launches -> the zustand stores / their
// transitive imports.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
