"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export const FollowerPointerCard = ({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseEnter = () => {
    setIsInside(true);
  };

  const handleMouseLeave = () => {
    setIsInside(false);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative", className)}
      style={{ cursor: isInside ? "none" : "default" }}
    >
      <AnimatePresence>
        {isInside && (
          <FollowPointer 
            x={mousePosition.x} 
            y={mousePosition.y} 
            title={title} 
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};

export const FollowPointer = ({
  x,
  y,
  title,
}: {
  x: number;
  y: number;
  title?: string | React.ReactNode;
}) => {
  const colors = [
    "#0ea5e9",
    "#14b8a6", 
    "#22c55e",
    "#3b82f6",
    "#ef4444",
    "#eab308",
    "#8b5cf6",
    "#f97316",
    "#ec4899"
  ];

  const bgColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      style={{
        left: x,
        top: y,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="relative">
        {/* Aceternity-style cursor arrow */}
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="1"
          viewBox="0 0 16 16"
          className="h-6 w-6 text-sky-500 transform -translate-x-[12px] -translate-y-[10px] -rotate-[70deg] drop-shadow-lg"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
        </svg>
        
        {/* Tooltip */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            backgroundColor: bgColor,
          }}
          className="absolute left-4 top-2 px-2 py-2 text-white whitespace-nowrap min-w-max text-xs rounded-full shadow-lg"
        >
          {title || "Following pointer"}
        </motion.div>
      </div>
    </motion.div>
  );
};

export const TitleComponent = ({
  title,
  avatar,
}: {
  title: string;
  avatar: string;
}) => (
  <div className="flex space-x-2 items-center">
    <img
      src={avatar}
      alt="thumbnail"
      width="20"
      height="20"
      className="rounded-full border-2 border-white"
    />
    <p>{title}</p>
  </div>
);