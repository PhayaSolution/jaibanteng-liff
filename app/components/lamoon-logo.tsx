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
