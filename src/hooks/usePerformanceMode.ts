import { useEffect, useMemo, useState } from 'react';

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

type NavigatorWithPerformanceHints = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
  deviceMemory?: number;
};

type MediaQueryListWithLegacyListeners = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

const LOW_END_CPU_CORES = 4;
const LOW_END_MEMORY_GB = 3;

const getConnection = (navigatorRef: NavigatorWithPerformanceHints) =>
  navigatorRef.connection ?? navigatorRef.mozConnection ?? navigatorRef.webkitConnection;

const shouldUseLiteMode = (prefersReducedMotion: boolean) => {
  if (typeof navigator === 'undefined') return false;

  const navigatorRef = navigator as NavigatorWithPerformanceHints;
  const connection = getConnection(navigatorRef);
  const hardwareConcurrency = navigatorRef.hardwareConcurrency ?? 8;
  const deviceMemory = navigatorRef.deviceMemory ?? 8;

  const saveDataEnabled = connection?.saveData === true;
  const effectiveType = connection?.effectiveType ?? '';
  const hasSlowConnection = effectiveType === '2g' || effectiveType === 'slow-2g';
  const isLowEndHardware =
    hardwareConcurrency <= LOW_END_CPU_CORES || deviceMemory <= LOW_END_MEMORY_GB;

  return prefersReducedMotion || saveDataEnabled || hasSlowConnection || isLowEndHardware;
};

export function usePerformanceMode() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLiteMode, setIsLiteMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ) as MediaQueryListWithLegacyListeners;
    const navigatorRef = navigator as NavigatorWithPerformanceHints;
    const connection = getConnection(navigatorRef);

    const applyPerformanceProfile = () => {
      const nextPrefersReducedMotion = motionQuery.matches;
      setPrefersReducedMotion(nextPrefersReducedMotion);
      setIsLiteMode(shouldUseLiteMode(nextPrefersReducedMotion));
    };

    applyPerformanceProfile();

    const onMotionPreferenceChange = () => {
      applyPerformanceProfile();
    };

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', onMotionPreferenceChange);
    } else {
      motionQuery.addListener?.(onMotionPreferenceChange);
    }

    const onConnectionChange = () => {
      applyPerformanceProfile();
    };

    connection?.addEventListener?.('change', onConnectionChange);

    return () => {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', onMotionPreferenceChange);
      } else {
        motionQuery.removeListener?.(onMotionPreferenceChange);
      }

      connection?.removeEventListener?.('change', onConnectionChange);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.toggle('perf-mode-lite', isLiteMode);
    root.classList.toggle('reduce-motion', prefersReducedMotion);

    return () => {
      root.classList.remove('perf-mode-lite');
      root.classList.remove('reduce-motion');
    };
  }, [isLiteMode, prefersReducedMotion]);

  return useMemo(
    () => ({
      isLiteMode,
      prefersReducedMotion,
      scrollBehavior: isLiteMode || prefersReducedMotion ? ('auto' as const) : ('smooth' as const),
    }),
    [isLiteMode, prefersReducedMotion]
  );
}
