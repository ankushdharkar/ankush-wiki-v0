"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { LazyCanvasRevealEffect as CanvasRevealEffect } from "./LazyCanvasRevealEffect";
import { trackExternalLink } from "../../services/analytics";

export function HomePageCanvasReveal() {
  const navigate = useNavigate();

  const handleExternalClick = (url: string, name: string) => {
    trackExternalLink(url, name);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-20 flex flex-wrap items-center justify-center bg-black w-full gap-x-4 gap-y-12 mx-auto px-8">
      {/* Premium Products - First Row */}
      <Card
        title="RealDSA"
        icon={<RealDSAIcon />}
        bgColor="bg-pink-950/50"
        onClick={() => handleExternalClick('https://realdsa.com', 'RealDSA Hero Card')}
        order="order-1"
        badge="Premium"
        badgeColor="bg-pink-500"
      >
        <CanvasRevealEffect
          animationSpeed={3}
          containerClassName="bg-pink-900"
          colors={[
            [236, 72, 153],
            [168, 85, 247],
          ]}
          dotSize={8}
        />
      </Card>
      <Card
        title="Get Shortlisted"
        icon={<ResumeIcon />}
        bgColor="bg-orange-950/50"
        onClick={() => handleExternalClick('https://myresumeisnotgettingshortlisted.com/', 'Get Shortlisted Hero Card')}
        order="order-2"
        badge="New"
        badgeColor="bg-yellow-400 text-yellow-900"
      >
        <CanvasRevealEffect
          animationSpeed={2.5}
          containerClassName="bg-orange-900"
          colors={[
            [251, 146, 60],
            [245, 158, 11],
          ]}
          dotSize={8}
        />
      </Card>
      {/* Communities - Second Row */}
      <Card
        title="Real Dev Squad"
        icon={<RDSIcon />}
        bgColor="bg-blue-950/50"
        onClick={() => navigate("/real-dev-squad")}
        order="order-3"
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
        order="order-4"
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
        order="order-5"
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
      <Card
        title="Important Links"
        icon={<ImportantLinksIcon />}
        bgColor="bg-purple-950/50"
        onClick={() => navigate("/important-links")}
        order="order-6"
      >
        <CanvasRevealEffect
          animationSpeed={2.5}
          containerClassName="bg-purple-900"
          colors={[
            [147, 51, 234],
            [168, 85, 247],
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
  order = "",
  badge,
  badgeColor = "bg-green-500",
}: {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  bgColor?: string;
  onClick?: () => void;
  order?: string;
  badge?: string;
  badgeColor?: string;
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={`border border-white/[0.2] group/canvas-card flex items-center justify-center max-w-[180px] md:max-w-sm w-full mx-auto p-2 md:p-4 relative aspect-[1/1.414] cursor-pointer ${bgColor} ${order}`}
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute -top-2 -right-2 md:-top-3 md:-right-3 px-2 py-0.5 md:px-3 md:py-1 ${badgeColor} text-white text-[10px] md:text-xs font-bold rounded-full z-30 shadow-lg`}>
          {badge}
        </div>
      )}

      <Icon className="absolute h-4 w-4 md:h-6 md:w-6 -top-2 -left-2 md:-top-3 md:-left-3 text-white" />
      <Icon className="absolute h-4 w-4 md:h-6 md:w-6 -bottom-2 -left-2 md:-bottom-3 md:-left-3 text-white" />
      {!badge && <Icon className="absolute h-4 w-4 md:h-6 md:w-6 -top-2 -right-2 md:-top-3 md:-right-3 text-white" />}
      <Icon className="absolute h-4 w-4 md:h-6 md:w-6 -bottom-2 -right-2 md:-bottom-3 md:-right-3 text-white" />

      {hovered && (
        <div className="h-full w-full absolute inset-0">
          {children}
        </div>
      )}

      <div className="relative z-20">
        <div className="text-center group-hover/canvas-card:translate-y-2 transition duration-200 w-full mx-auto flex items-center justify-center">
          {icon}
        </div>
        <h2 className="dark:text-white text-sm md:text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-white mt-2 md:mt-4 font-bold group-hover/canvas-card:-translate-y-2 transition duration-200">
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

const ImportantLinksIcon = () => {
  return (
    <div className="text-4xl">🔗</div>
  );
};

const RealDSAIcon = () => {
  return (
    <img
      src="/images/Real DSA.png"
      className="h-10 w-10 text-white group-hover/canvas-card:text-white"
      alt="RealDSA Logo"
      loading="lazy"
    />
  );
};

const ResumeIcon = () => {
  return (
    <div className="text-4xl">🔥</div>
  );
};
