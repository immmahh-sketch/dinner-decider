import { useCallback, useState } from 'react';

// expo-updates is temporarily removed while we chase a launch crash on
// TestFlight builds. This stub keeps the call sites (_layout, remove-ads)
// compiling and behaving sanely — OTA is simply "unavailable" for now.
// Once the app launches cleanly we reintroduce expo-updates deliberately.

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'ready'
  | 'up-to-date'
  | 'unavailable'
  | 'error';

export interface AppUpdatesApi {
  status: UpdateStatus;
  currentLabel: string;
  check: () => Promise<void>;
  restart: () => Promise<void>;
}

export function useAppUpdates(): AppUpdatesApi {
  const [status, setStatus] = useState<UpdateStatus>('unavailable');
  const check = useCallback(async () => {
    setStatus('unavailable');
  }, []);
  const restart = useCallback(async () => {}, []);
  return { status, currentLabel: 'built-in version', check, restart };
}

/** No-op: OTA updates are disabled for now. */
export async function prefetchUpdate(): Promise<void> {}
