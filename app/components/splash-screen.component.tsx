'use client';

import { useState } from 'react';
import DebugPanel from '@/app/components/debug/debug-panel.component';

interface SplashScreenProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function SplashScreen({ isLoading, error, onRetry }: SplashScreenProps) {
  const [tapCount, setTapCount] = useState(0);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 10) {
      const currentlyEnabled = localStorage.getItem('vconsole_enabled') === 'true';
      const newState = !currentlyEnabled;
      localStorage.setItem('vconsole_enabled', newState.toString());
      alert(`vConsole ${newState ? 'Enabled' : 'Disabled'}! Please reload the app.`);
      setTapCount(0);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white dark:bg-zinc-950 relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-50 via-transparent to-transparent dark:from-indigo-950/30 dark:via-transparent opacity-60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-50 to-transparent dark:from-blue-950/20 opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-violet-50 to-transparent dark:from-violet-950/20 opacity-50 blur-3xl pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Brand name */}
        <h1 
          onClick={handleLogoTap}
          className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2 cursor-pointer select-none"
        >
          Jai Banteng
        </h1>

        {/* Tagline */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-12">
          Simple expense tracking
        </p>

        {/* Loading / Error state */}
        <div className="w-full max-w-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              {/* Modern spinner */}
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900 dark:border-t-white animate-spin" />
              </div>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Loading...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4">
              {/* Error state */}
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                {error.includes('Failed to initialize LIFF') || error.includes('LIFF is not ready')
                  ? 'Please open in LINE app'
                  : 'Connection failed'}
              </p>
              <button 
                onClick={onRetry}
                className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors active:scale-[0.98]"
              >
                Try again
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          © 2024 Jai Banteng
        </p>
      </div>

      {/* Debug Panel - Only if enabled in localStorage */}
      {typeof window !== 'undefined' && localStorage.getItem('vconsole_enabled') === 'true' && (
        <div className="fixed bottom-4 right-4 z-50">
          <DebugPanel />
        </div>
      )}
    </div>
  );
}
