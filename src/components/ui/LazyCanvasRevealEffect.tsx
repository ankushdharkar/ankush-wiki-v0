import { lazy, Suspense, useState, useEffect } from 'react';

const CanvasRevealEffect = lazy(() => import('./CanvasRevealEffect').then(module => ({
  default: module.CanvasRevealEffect
})));

export function LazyCanvasRevealEffect(props: Parameters<typeof CanvasRevealEffect>[0]) {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Check if document is already loaded
    if (document.readyState === 'complete') {
      setIsPageLoaded(true);
    } else {
      // Wait for the window to finish loading
      const handleLoad = () => setIsPageLoaded(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!isPageLoaded) {
    return <div className="h-full w-full bg-gray-800 animate-pulse" />;
  }

  return (
    <Suspense fallback={<div className="h-full w-full bg-gray-800 animate-pulse" />}>
      <CanvasRevealEffect {...props} />
    </Suspense>
  );
}