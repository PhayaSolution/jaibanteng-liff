'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CatIcon from '@/app/components/icons/cat-icon.component';
import { useAuth } from '@/app/hooks/use-auth';
import { isLiff } from '@/app/utils/liff.util';
import DebugPanel from '@/app/components/debug/debug-panel.component';

export default function SplashPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, error, login, isInitialized } = useAuth();

  useEffect(() => {
    // Auto-login when component mounts if not already authenticated
    // Only attempt login if we're initialized and not already authenticated
    if (isInitialized && !isAuthenticated && !isLoading) {
      console.log('[SplashPage] Attempting auto-login...');
      login();
    }
  }, [isInitialized, isAuthenticated, isLoading, login]);

  useEffect(() => {
    // Redirect to dashboard when login is successful
    if (isInitialized && isAuthenticated && !isLoading && user) {
      console.log('[SplashPage] Login successful, redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [isInitialized, isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white dark:bg-black p-4">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-24 h-24 sm:w-28 sm:h-28 text-black dark:text-white">
          <CatIcon className="w-full h-full" />
        </div>
        
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Jai Banteng
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            minimal budgeting
          </p>
        </div>

        {isLoading && (
          <div className="mt-8 flex justify-center">
            <div className="h-1.5 w-1.5 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-1.5 w-1.5 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
            <div className="h-1.5 w-1.5 bg-black dark:bg-white rounded-full animate-bounce"></div>
          </div>
        )}

        {error && !isLoading && (
          <div className="mt-4 text-center max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-sm text-rose-500 font-medium">
              {error.includes('Failed to initialize LIFF') || error.includes('LIFF is not ready')
                ? 'Please open in LINE app'
                : 'Connection failed'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-xs font-medium text-black dark:text-white border border-gray-200 dark:border-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Debug Panel - Hidden in production visually but accessible if needed */}
      {(process.env.NODE_ENV === 'development') && (
        <div className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
           <DebugPanel />
        </div>
      )}
    </div>
  );
}

