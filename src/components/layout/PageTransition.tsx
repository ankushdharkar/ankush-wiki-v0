import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    x: -100,
    scale: 0.98,
  }
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.25, 0.8, 0.25, 1] as const,
  duration: 0.6
};

const getRouteColor = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'bg-black'; // Black for homepage
    case '/chillouts':
      return 'bg-pink-900'; // Dark pink for chillouts
    case '/real-dev-squad':
      return 'bg-blue-900'; // Navy blue for RDS
    case '/js-ts-guild':
      return 'bg-yellow-500'; // Slightly darker yellow for JS/TS
    case '/important-links':
      return 'bg-purple-900'; // Purple for important links
    default:
      return 'bg-black'; // Black for others
  }
};

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [overlayColor, setOverlayColor] = useState('bg-black');
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Skip transition on initial page load
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      return;
    }

    setIsTransitioning(true);
    setOverlayColor(getRouteColor(location.pathname));
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      
      {/* Transition Overlay - only render after first navigation */}
      {hasNavigated.current && (
        <motion.div
          className={`fixed inset-0 z-50 ${overlayColor} origin-top pointer-events-none`}
          animate={{
            scaleY: isTransitioning ? [0, 1, 0] : 0,
          }}
          transition={{
            duration: 0.8,
            times: [0, 0.5, 1],
            ease: "easeInOut"
          }}
        />
      )}
    </>
  );
}