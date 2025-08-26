import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

interface RouteCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

export default function RouteCard({ title, description, href, icon }: RouteCardProps) {
  const [hovered, setHovered] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    if (!hovered) {
      setAnimationTime(0);
      return;
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setAnimationTime(elapsed);
      if (hovered && elapsed < 2) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [hovered]);

  const createDots = () => {
    const dots = [];
    const rows = 8;
    const cols = 12;
    const centerRow = rows / 2;
    const centerCol = cols / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const distanceFromCenter = Math.sqrt(
          Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
        );
        
        // Wave animation delay based on distance from center
        const delay = distanceFromCenter * 0.1;
        const opacity = hovered 
          ? Math.max(0, Math.min(1, (animationTime - delay) * 2))
          : 0;

        dots.push(
          <div
            key={`${row}-${col}`}
            className="absolute w-1 h-1 bg-white rounded-full transition-opacity duration-200"
            style={{
              left: `${(col / (cols - 1)) * 100}%`,
              top: `${(row / (rows - 1)) * 100}%`,
              opacity: opacity,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      }
    }
    return dots;
  };

  return (
    <Link to={href} className="block">
      <motion.div
        className="relative h-80 p-8 rounded-lg border border-gray-600 bg-black/20 overflow-hidden cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {/* Dot Matrix */}
        <div className="absolute inset-0">
          {createDots()}
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
          <motion.div
            animate={{ 
              opacity: hovered ? 0.3 : 1,
              scale: hovered ? 0.8 : 1 
            }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            {icon && (
              <div className="text-4xl text-gray-400 mb-4">
                {icon}
              </div>
            )}
          </motion.div>

          <motion.h3 
            className="text-2xl font-semibold mb-3"
            animate={{ 
              color: hovered ? "#ffffff" : "#e5e7eb",
              y: hovered ? -10 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>
          
          <motion.p 
            className="text-gray-400 text-sm leading-relaxed max-w-xs"
            animate={{ 
              opacity: hovered ? 0.8 : 0.7,
            }}
            transition={{ duration: 0.3 }}
          >
            {description}
          </motion.p>
        </div>
      </motion.div>
    </Link>
  );
}