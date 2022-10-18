import { DependencyList, EffectCallback, useEffect } from 'react';

export const useBrowserEffect = (
  effect: EffectCallback,
  deps?: DependencyList[]
) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    return effect();
  }, deps);
};
