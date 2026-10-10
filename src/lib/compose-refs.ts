import * as React from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") {
    return ref(value);
  }

  if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
}

/**
 * A utility to compose multiple refs together
 * Accepts callback refs and RefObject(s)
 */
function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });

    // React <19 will log an error to the console if a callback ref returns a
    // value. We don't use ref cleanups internally so this will only happen if a
    // user's ref callback returns a value, which we only expect if they are
    // using the cleanup functionality added in React 19.
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}

/**
 * A custom hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 */
function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  const refsRef = React.useRef(refs);
  const nodeRef = React.useRef<T | null>(null);
  const cleanupRef = React.useRef<(() => void) | undefined>(undefined);

  React.useLayoutEffect(() => {
    const prev = refsRef.current;
    const changed =
      prev.length !== refs.length || prev.some((ref, i) => ref !== refs[i]);
    if (!changed) return;
    refsRef.current = refs;
    const node = nodeRef.current;
    if (node === null) return;
    if (cleanupRef.current) {
      cleanupRef.current();
    } else {
      for (const ref of prev) setRef(ref, null);
    }
    const cleanup = composeRefs(...refs)(node);
    cleanupRef.current = typeof cleanup === "function" ? cleanup : undefined;
  });

  return React.useCallback((node: T | null) => {
    nodeRef.current = node;
    const cleanup = composeRefs(...refsRef.current)(node);
    if (typeof cleanup !== "function") {
      cleanupRef.current = undefined;
      return;
    }
    cleanupRef.current = cleanup;
    return () => {
      cleanup();
      cleanupRef.current = undefined;
      nodeRef.current = null;
    };
  }, []);
}

export { composeRefs, useComposedRefs };
