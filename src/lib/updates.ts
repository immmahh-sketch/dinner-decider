import { useCallback, useState } from 'react';
import * as Updates from 'expo-updates';

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'ready' // downloaded, waiting for a restart to apply
  | 'up-to-date'
  | 'unavailable' // updates disabled (Expo Go / dev / not built with expo-updates)
  | 'error';

export interface AppUpdatesApi {
  status: UpdateStatus;
  /** current running update id, or "embedded" */
  currentLabel: string;
  /** run a manual check + download; safe to call anywhere */
  check: () => Promise<void>;
  /** apply a downloaded update by restarting the app */
  restart: () => Promise<void>;
}

export function useAppUpdates(): AppUpdatesApi {
  const [status, setStatus] = useState<UpdateStatus>('idle');

  const check = useCallback(async () => {
    if (!Updates.isEnabled) {
      setStatus('unavailable');
      return;
    }
    try {
      setStatus('checking');
      const res = await Updates.checkForUpdateAsync();
      if (!res.isAvailable) {
        setStatus('up-to-date');
        return;
      }
      setStatus('downloading');
      await Updates.fetchUpdateAsync();
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  const restart = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      setStatus('error');
    }
  }, []);

  const currentLabel = Updates.isEmbeddedLaunch
    ? 'built-in version'
    : (Updates.updateId ?? 'unknown').slice(0, 8);

  return { status, currentLabel, check, restart };
}

/**
 * Fire-and-forget check used at app start. expo-updates already checks on load
 * by default; this just downloads eagerly so the update is ready sooner. It
 * never throws and does nothing in Expo Go / dev.
 */
export async function prefetchUpdate() {
  try {
    if (!Updates.isEnabled) return;
    const res = await Updates.checkForUpdateAsync();
    if (res.isAvailable) await Updates.fetchUpdateAsync();
  } catch {
    // ignore — offline, disabled, or already current
  }
}
