'use client';

import { useState, useEffect, useMemo } from 'react';
import DebugPanel from '@/app/components/debug/debug-panel.component';


interface SplashScreenProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function SplashScreen({ isLoading, error, onRetry }: SplashScreenProps) {
  const [tapCount, setTapCount] = useState(0);
  const [debugEnabled, setDebugEnabled] = useState(false);

  useEffect(() => {
    // Check localStorage for debug panel after mount (client-side only)
    if (typeof window !== 'undefined') {
      setDebugEnabled(localStorage.getItem('vconsole_enabled') === 'true');
    }
  }, []);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 10) {
      const currentlyEnabled = localStorage.getItem('vconsole_enabled') === 'true';
      const newState = !currentlyEnabled;
      localStorage.setItem('vconsole_enabled', newState.toString());
      setDebugEnabled(newState);
      alert(`vConsole ${newState ? 'Enabled' : 'Disabled'}! Please reload the app.`);
      setTapCount(0);
    }
  };

  // Deterministic particle positions using seeded PRNG
  // This ensures SSR and client render the same initial values
  const particleStyles = useMemo(() => {
    // Simple seeded PRNG for deterministic randomness
    let seed = 12345;
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    return Array.from({ length: 6 }, (_, i) => ({
      left: `${seededRandom() * 100}%`,
      animationDelay: `${seededRandom() * 5}s`,
      animationDuration: `${6 + seededRandom() * 4}s`,
    }));
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Premium background particles and gradients */}
      <div className="absolute inset-0 premium-gradient opacity-60 dark:opacity-40 animate-gradient-xy pointer-events-none" />
      
      {/* Floating particles */}
      {particleStyles.map((style, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/20 animate-particle-float pointer-events-none"
          style={style}
        />
      ))}

      {/* Main content card with glassmorphism */}
      <div className="relative z-10 flex flex-col items-center px-8 py-12 glass rounded-[2.5rem] shadow-2xl mx-6 animate-fade-in-up">


        {/* Brand name with Mali font for friendly feel */}
        <h1 
          onClick={handleLogoTap}
          className="text-4xl font-bold text-foreground mb-3 tracking-tight animate-text-glow cursor-pointer active:scale-95 transition-transform"
        >
          ละมุน
        </h1>
        <p className="text-lg font-medium text-foreground/60 mb-12 font-prompt">
          Lamoon
        </p>

        {/* Loading / Error state */}
        <div className="w-full max-w-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-6">
              {/* Premium Loading Bar */}
              <div className="w-full h-2.5 bg-foreground/10 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 loading-bar-gradient animate-loading-progress rounded-full" />
                <div className="absolute inset-0 bg-white/30 animate-shimmer" />
              </div>
              <p className="text-sm font-medium text-foreground/40 animate-pulse font-prompt tracking-wide">
                กําลังเตรียมความละมุน...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-6">
              {/* Friendly Error state */}
              <div className="w-14 h-14 rounded-3xl bg-destructive/10 flex items-center justify-center animate-bounce">
                <svg className="w-7 h-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm font-prompt text-foreground/70 text-center leading-relaxed">
                {error.includes('Failed to initialize LIFF') || error.includes('LIFF is not ready')
                  ? 'ดูเหมือนจะไม่ได้เปิดจาก LINE นะครับ'
                  : 'การเชื่อมต่อขัดข้องนิดหน่อยครับ'}
              </p>
              <button 
                onClick={onRetry}
                className="w-full py-3.5 text-sm font-bold text-white bg-primary rounded-2xl hover:brightness-105 transition-all active:scale-[0.97] shadow-lg shadow-primary/25 font-prompt"
              >
                ลองอีกครั้งนะ
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-xs font-prompt text-foreground/30 font-medium tracking-widest uppercase">
          Financial Serenity • 2024
        </p>
      </div>

      {/* Debug Panel - Only if enabled in localStorage */}
      {debugEnabled && (
        <div className="fixed bottom-4 right-4 z-50">
          <DebugPanel />
        </div>
      )}
    </div>
  );
}
