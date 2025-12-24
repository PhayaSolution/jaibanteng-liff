import React from 'react';

interface LamoonLogoProps {
  className?: string;
  size?: number;
}

export const LamoonLogo: React.FC<LamoonLogoProps> = ({ className, size = 120 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Cloud-like shape with a coin */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-logo-float"
      >
        {/* The Cloud/Bubble */}
        <path
          d="M30 40C20 40 15 50 15 60C15 75 25 85 45 85H65C80 85 85 75 85 65C85 55 80 45 70 45C70 30 60 20 45 20C35 20 30 30 30 40Z"
          fill="#81D8D0"
          className="opacity-80"
        />
        <path
          d="M35 45C28 45 25 50 25 58C25 68 32 75 45 75H65C75 75 80 68 80 60C80 52 75 48 68 48C68 38 62 30 50 30C42 30 38 38 35 45Z"
          fill="white"
          className="opacity-40"
        />
        
        {/* Soft Flow coin */}
        <circle cx="50" cy="55" r="12" fill="white" className="drop-shadow-sm" />
        <path
          d="M46 55H54M50 51V59"
          stroke="#81D8D0"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Optional: Text under logo if needed by caller */}
    </div>
  );
};
