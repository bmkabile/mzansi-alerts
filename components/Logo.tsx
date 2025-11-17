import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative h-9 w-9">
        {/* Pulsing rings for animation */}
        <div className="ring-1 ring-secondary/60 rounded-full absolute inset-0 animate-ping-slow"></div>
        <div className="ring-1 ring-white/40 rounded-full absolute inset-0 animate-ping-medium"></div>

        {/* Custom SVG Logo Icon */}
        <svg
          className="relative z-10 w-full h-full drop-shadow-lg"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradient for the pin body */}
            <linearGradient id="pinGradient" x1="24" y1="0" x2="24" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00695C" />
              <stop offset="1" stopColor="#004D40" />
            </linearGradient>
            {/* Filter for the glowing star */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Pin Body */}
          <path
            d="M24 0C12.954 0 4 8.954 4 20C4 35 24 48 24 48S44 35 44 20C44 8.954 35.046 0 24 0Z"
            fill="url(#pinGradient)"
            stroke="white"
            strokeWidth="1.5"
          />

          {/* Glowing Protea/Star Shape */}
          <g filter="url(#glow)">
            <path
              d="M24 16L26.316 21.06L32 22.064L28 26.216L28.824 32L24 29.2L19.176 32L20 26.216L16 22.064L21.684 21.06L24 16Z"
              fill="#FFD700" 
            />
            <path
              transform="rotate(45 24 24)"
              d="M24 16L26.316 21.06L32 22.064L28 26.216L28.824 32L24 29.2L19.176 32L20 26.216L16 22.064L21.684 21.06L24 16Z"
              fill="#FFC107"
            />
          </g>
        </svg>
      </div>
      
      {/* Dynamic Typography */}
      <h1 className="text-xl font-bold tracking-tight">
        <span className="text-secondary">Mzansi</span>
        <span className="text-white">Alerts</span>
      </h1>
    </div>
  );
};

export default Logo;