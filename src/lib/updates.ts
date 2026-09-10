import { useCallback, useEffect, useRef, useState } from 'react';
import * as Updates from 'expo-updates';

/**
 * Auto-applies an OTA update the moment it finishes downloading — but only in
 * the first few seconds after launch, so it never yanks someone out of the
 * quiz mid-flow. After that window it just waits for the next cold launch
 * (expo-updates has already cached it, so that launch runs the new code).
 *
 * Pair with app.json `updates.checkAutomatically: "ON_LOAD"` +
 * `fallbackToCacheTimeout: 0`: launch is never blocked, the check + download
 * run in the background, and this reload swaps to the new bundle as soon as
 * it's ready.
 */
export function useAutoUpdate(): void {
  const launchedAt = useRef(Date.now());
  const reloaded = useRef(false);
  const { isUpdatePending } = Updates.useUpdates();
  useEffect(() => {
    if (!isUpdatePending || reloaded.current) return;
    if (Date.now() - launchedAt.current > 12_000) return;
    reloaded.current = true;
    Updates.reloadAsync().catch(() => {});
  }, [isUpdatePending]);
}

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
