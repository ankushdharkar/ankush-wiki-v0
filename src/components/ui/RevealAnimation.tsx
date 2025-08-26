import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealAnimationProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export default function RevealAnimation({ 
  children, 
  delay = 0, 
  direction = "up",
  className = ""
}: RevealAnimationProps) {
  const directionVariants = {
    up: { y: 60, opacity: 0 },
    down: { y: -60, opacity: 0 },
    left: { x: 60, opacity: 0 },
    right: { x: -60, opacity: 0 },
  };

  return (
    <motion.div
      initial={directionVariants[direction]}
      animate={{ 
        x: 0, 
        y: 0, 
        opacity: 1 
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.8, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}