import { ReactNode } from 'react';

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
  /**
   * ใช้ safe area padding หรือไม่
   * @default true
   */
  useSafeArea?: boolean;
}

/**
 * Safe Area Component
 * 
 * สำหรับจัดการ safe area insets บน iOS และ LINE LIFF
 * รองรับ notch และ bottom bar ของ iOS
 */
export default function SafeArea({ 
  children, 
  className = '',
  useSafeArea = true 
}: SafeAreaProps) {
  const safeAreaClasses = useSafeArea
    ? 'pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]'
    : '';

  return (
    <div className={`${safeAreaClasses} ${className}`}>
      {children}
    </div>
  );
}

