'use client';

import { useEffect } from 'react';
import { isLiff } from '@/app/utils/liff.util';

let vConsoleInstance: any = null;

export function VConsoleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only enable vConsole in development or LIFF environment
    const shouldEnable = 
      process.env.NODE_ENV === 'development' || 
      (typeof window !== 'undefined' && isLiff());

    if (!shouldEnable || typeof window === 'undefined') {
      return;
    }

    // Check localStorage for vConsole state
    const stored = localStorage.getItem('vconsole_enabled');
    const enabled = stored === 'true' || (stored === null && shouldEnable);

    if (enabled) {
      initVConsole();
    }

    // Listen for toggle events
    const handleToggle = (event: CustomEvent) => {
      const { enabled: toggleEnabled } = event.detail;
      if (toggleEnabled && !vConsoleInstance) {
        initVConsole();
      } else if (!toggleEnabled && vConsoleInstance) {
        destroyVConsole();
      }
    };

    window.addEventListener('vconsole-toggle' as any, handleToggle);

    return () => {
      window.removeEventListener('vconsole-toggle' as any, handleToggle);
    };
  }, []);

  return <>{children}</>;
}

async function initVConsole() {
  if (vConsoleInstance || typeof window === 'undefined') {
    return;
  }

  try {
    // vConsole uses UMD format, try different import methods
    let VConsole: any;
    try {
      const vconsoleModule = await import('vconsole');
      VConsole = vconsoleModule.default || vconsoleModule;
    } catch (e) {
      // Fallback: use global VConsole if available
      VConsole = (window as any).VConsole;
      if (!VConsole) {
        throw new Error('VConsole not found');
      }
    }

    if (!VConsole) {
      throw new Error('VConsole class not available');
    }

    vConsoleInstance = new VConsole({
      theme: 'dark',
      defaultPlugins: ['system', 'network', 'element', 'storage'],
      maxLogNumber: 1000,
      onReady: () => {
        console.log('[VConsole] ✅ Ready - Mobile debug console is now available');
      },
      onClearLog: () => {
        console.log('[VConsole] Log cleared');
      },
    });
    localStorage.setItem('vconsole_enabled', 'true');
    console.log('[VConsole] Initialized successfully');
  } catch (error) {
    console.error('[VConsole] ❌ Failed to initialize:', error);
    console.error('[VConsole] Error details:', error instanceof Error ? error.message : String(error));
  }
}

function destroyVConsole() {
  if (vConsoleInstance && typeof window !== 'undefined') {
    try {
      vConsoleInstance.destroy();
      vConsoleInstance = null;
      localStorage.setItem('vconsole_enabled', 'false');
      console.log('[VConsole] Destroyed');
    } catch (error) {
      console.error('[VConsole] Failed to destroy:', error);
    }
  }
}

/**
 * Toggle vConsole on/off
 */
export function toggleVConsole(enabled: boolean) {
  if (typeof window === 'undefined') return;
  
  const event = new CustomEvent('vconsole-toggle', {
    detail: { enabled },
  });
  window.dispatchEvent(event);
}

/**
 * Check if vConsole is enabled
 */
export function isVConsoleEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('vconsole_enabled') === 'true';
}

