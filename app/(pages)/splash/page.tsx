'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CatIcon from '@/app/components/icons/cat-icon.component';
import { useAuth } from '@/app/hooks/use-auth';
import { isLiff } from '@/app/utils/liff.util';
import DebugPanel from '@/app/components/debug/debug-panel.component';

export default function SplashPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, error, login, isInitialized } = useAuth();
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    // Auto-login when component mounts if not already authenticated
    if (isInitialized && !isAuthenticated && !isLoading) {
      console.log('[SplashPage] Attempting auto-login...');
      login();
    }
  }, [isInitialized, isAuthenticated, isLoading, login]);

  useEffect(() => {
    // Redirect to dashboard when login is successful
    if (isInitialized && isAuthenticated && !isLoading && user) {
      const timer = setTimeout(() => {
        console.log('[SplashPage] Login successful, redirecting to dashboard...');
        router.push('/dashboard');
      }, 800); // Small delay for UX transition
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isAuthenticated, isLoading, user, router]);

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
    <div className="flex min-h-dvh flex-col items-center justify-center premium-gradient animate-gradient-xy p-6 overflow-hidden relative">
      <div className="flex flex-col items-center gap-8 z-10">
        {/* Logo Section */}
        <div 
          onClick={handleLogoTap}
          className="relative group cursor-pointer"
        >
          <div className="absolute -inset-4 bg-black/5 dark:bg-white/5 rounded-full blur-2xl group-active:scale-95 transition-transform"></div>
          <div className="w-28 h-28 sm:w-32 sm:h-32 text-black dark:text-white relative animate-float">
            <CatIcon className="w-full h-full drop-shadow-2xl" />
          </div>
        </div>
        
        {/* Text Section */}
        <div className="space-y-3 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
            Jai Banteng
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-4 bg-black/20 dark:bg-white/20"></div>
            <p className="text-sm text-black/50 dark:text-white/40 font-medium uppercase tracking-[0.2em]">
              minimal budgeting
            </p>
            <div className="h-px w-4 bg-black/20 dark:bg-white/20"></div>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="w-48 mt-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-black dark:bg-white rounded-full animate-reveal origin-left"></div>
              </div>
              <p className="text-[10px] text-center text-black/40 dark:text-white/30 font-medium uppercase tracking-widest animate-pulse">
                Initializing Session...
              </p>
            </div>
          ) : error && (
             <div className="text-center animate-in fade-in zoom-in duration-500">
              <p className="text-sm text-rose-500 font-medium mb-4">
                {error.includes('Failed to initialize LIFF') || error.includes('LIFF is not ready')
                  ? 'Please open in LINE app'
                  : 'Connection failed'}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 text-xs font-semibold text-white dark:text-black bg-black dark:bg-white rounded-full hover:opacity-90 transition-all active:scale-95 shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/[0.02] dark:bg-white/[0.02] rounded-full blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/[0.02] dark:bg-white/[0.02] rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>

      {/* Debug Panel - Only if enabled in localStorage */}
      {typeof window !== 'undefined' && localStorage.getItem('vconsole_enabled') === 'true' && (
        <div className="fixed bottom-4 right-4 z-50">
           <DebugPanel />
        </div>
      )}
    </div>
  );
}

