import { lazy, Suspense, useSyncExternalStore } from 'react';

const CanvasRevealEffect = lazy(() => import('./CanvasRevealEffect').then(module => ({
  default: module.CanvasRevealEffect
})));

// The page counts as loaded once the window has finished loading
const subscribeToPageLoad = (onLoad: () => void) => {
  window.addEventListener('load', onLoad);
  return () => window.removeEventListener('load', onLoad);
};
const getIsPageLoaded = () => document.readyState === 'complete';

export function LazyCanvasRevealEffect(props: Parameters<typeof CanvasRevealEffect>[0]) {
  const isPageLoaded = useSyncExternalStore(subscribeToPageLoad, getIsPageLoaded);

  if (!isPageLoaded) {
    return <div className="h-full w-full bg-gray-800 animate-pulse" />;
  }

  return (
    <Suspense fallback={<div className="h-full w-full bg-gray-800 animate-pulse" />}>
      <CanvasRevealEffect {...props} />
    </Suspense>
  );
}
