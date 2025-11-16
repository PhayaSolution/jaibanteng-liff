'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initLiff, getLiffId } from '@/app/utils/liff.util';

interface LiffContextType {
  isInitialized: boolean;
  isReady: boolean;
  error: string | null;
}

const LiffContext = createContext<LiffContextType>({
  isInitialized: false,
  isReady: false,
  error: null,
});

export function useLiffContext() {
  return useContext(LiffContext);
}

export function LiffProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiffContextType>({
    isInitialized: false,
    isReady: false,
    error: null,
  });

  console.log('LiffProvider', state);

  useEffect(() => {
    // Only initialize if in client-side
    if (typeof window === 'undefined') {
      return;
    }

    // Check for LIFF ID before attempting initialization
    const liffId = getLiffId();
    if (!liffId) {
      // No LIFF ID configured - mark as initialized but not ready
      // This allows the app to work in non-LIFF environments
      console.log('[LiffProvider] No LIFF ID configured - skipping initialization');
      // Use queueMicrotask to avoid synchronous setState in effect
      queueMicrotask(() => {
        setState({
          isInitialized: true,
          isReady: false,
          error: 'NEXT_PUBLIC_LINE_LIFF_ID environment variable is not set',
        });
      });
      return;
    }

    // Always try to initialize if we have LIFF ID
    // Don't check isLiff() first - let the SDK determine if we're in LIFF
    console.log('[LiffProvider] Starting LIFF initialization with ID:', liffId);

    // Initialize LIFF
    const initializeLiff = async () => {
      try {
        const initialized = await initLiff();
        console.log('[LiffProvider] Initialization result:', initialized);
        
        if (!initialized) {
          setState({
            isInitialized: true,
            isReady: false,
            error: 'Failed to initialize LIFF - initLiff() returned false',
          });
          return;
        }

        setState({
          isInitialized: true,
          isReady: true,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[LiffProvider] Initialization error:', error);
        setState({
          isInitialized: true,
          isReady: false,
          error: `LIFF initialization failed: ${errorMessage}`,
        });
      }
    };

    initializeLiff();
  }, []);

  return (
    <LiffContext.Provider value={state}>
      {children}
    </LiffContext.Provider>
  );
}

