"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { LazyCanvasRevealEffect as CanvasRevealEffect } from "./LazyCanvasRevealEffect";

export function HomePageCanvasReveal() {
  const navigate = useNavigate();

  return (
    <div className="py-20 flex flex-col lg:flex-row items-center justify-center bg-black w-full gap-4 mx-auto px-8">
      <Card 
        title="Real Dev Squad" 
        icon={<RDSIcon />} 
        bgColor="bg-blue-950/50"
        onClick={() => navigate("/real-dev-squad")}
      >
        <CanvasRevealEffect
          animationSpeed={3.5}
          containerClassName="bg-purple-900"
          colors={[
            [102, 126, 234],
            [118, 75, 162],
          ]}
          dotSize={8}
        />
      </Card>
      <Card 
        title="JS TS Guild" 
        icon={<JSTSIcon />} 
        bgColor="bg-yellow-950/50"
        onClick={() => navigate("/js-ts-guild")}
      >
        <CanvasRevealEffect
          animationSpeed={4}
          containerClassName="bg-pink-900"
          colors={[
            [236, 72, 153],
            [232, 121, 222],
          ]}
          dotSize={8}
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/50 dark:bg-black/90" />
      </Card>
      <Card 
        title="Chillouts" 
        icon={<ChilloutsIcon />} 
        bgColor="bg-pink-950/50"
        onClick={() => navigate("/chillouts")}
      >
        <CanvasRevealEffect
          animationSpeed={3}
          containerClassName="bg-cyan-900"
          colors={[
            [34, 197, 246],
            [0, 242, 254],
          ]}
          dotSize={8}
        />
      </Card>
    </div>
  );
}

const Card = ({
  title,
  icon,
  children,
  bgColor = "",
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  bgColor?: string;
  onClick?: () => void;
}) => {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={`border border-white/[0.2] group/canvas-card flex items-center justify-center max-w-sm w-full mx-auto p-4 relative h-[30rem] cursor-pointer ${bgColor}`}
    >
      <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white" />

      {hovered && (
        <div className="h-full w-full absolute inset-0">
          {children}
        </div>
      )}

      <div className="relative z-20">
        <div className="text-center group-hover/canvas-card:translate-y-2 transition duration-200 w-full mx-auto flex items-center justify-center">
          {icon}
        </div>
        <h2 className="dark:text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-white mt-4 font-bold group-hover/canvas-card:-translate-y-2 transition duration-200">
          {title}
        </h2>
      </div>
    </div>
  );
};


export const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};

const RDSIcon = () => {
  return (
    <img 
      src="/images/Real-Dev-Squad-logo.png" 
      className="h-10 w-10 text-white group-hover/canvas-card:text-white"
      alt="Real Dev Squad Logo"
      loading="lazy"
    />
  );
};

const JSTSIcon = () => {
  return (
    <img 
      src="/images/JS-TS-Guild-logo.jpeg" 
      className="h-10 w-10 text-white group-hover/canvas-card:text-white rounded-lg"
      alt="JS TS Guild Logo"
      loading="lazy"
    />
  );
};

const ChilloutsIcon = () => {
  return (
    <div className="text-4xl">💝</div>
  );
};
