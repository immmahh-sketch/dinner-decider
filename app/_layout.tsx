// MINIMAL SHELL (bisect build 14) — everything stripped to isolate the
// TestFlight launch crash. No stores, no gesture-handler, no safe-area
// provider, no splash-screen calls, no networking. Just expo-router.
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
