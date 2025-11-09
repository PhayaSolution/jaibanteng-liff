import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'mobile' | 'tablet' | 'desktop' | 'full';
}

/**
 * Responsive Container Component
 * 
 * สำหรับ LINE LIFF และ iPad:
 * - Mobile: full width with padding
 * - Tablet (iPad): max-width 768px, centered
 * - Desktop/iPad Pro: max-width 1024px, centered
 */
export default function Container({ 
  children, 
  className = '',
  maxWidth = 'full' 
}: ContainerProps) {
  const maxWidthClasses = {
    mobile: 'max-w-full',
    tablet: 'max-w-2xl md:max-w-3xl',
    desktop: 'max-w-4xl lg:max-w-5xl',
    full: 'max-w-full',
  };

  return (
    <div 
      className={`
        w-full 
        mx-auto 
        px-4 
        sm:px-6 
        md:px-8
        ${maxWidthClasses[maxWidth]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

