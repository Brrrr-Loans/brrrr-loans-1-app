"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` during SSR and the hydration render, `true` afterwards.
 * Replaces the `useState(false)` + `useEffect(() => setMounted(true))` pattern
 * without a post-mount state update.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
