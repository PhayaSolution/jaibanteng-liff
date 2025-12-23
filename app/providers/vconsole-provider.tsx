'use client';

import { useEffect } from 'react';
import type VConsole from 'vconsole';

let vConsoleInstance: VConsole | null = null;

export function VConsoleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // vConsole is now disabled by default and must be explicitly enabled
    const enabled = localStorage.getItem('vconsole_enabled') === 'true';

    if (enabled) {
      initVConsole();
    }

    // Listen for toggle events
    const handleToggle = (event: CustomEvent<{ enabled: boolean }>) => {
      const { enabled: toggleEnabled } = event.detail;
      if (toggleEnabled && !vConsoleInstance) {
        initVConsole();
      } else if (!toggleEnabled && vConsoleInstance) {
        destroyVConsole();
      }
    };

    const listener = (event: Event) =>
      handleToggle(event as CustomEvent<{ enabled: boolean }>);

    window.addEventListener('vconsole-toggle', listener);

    return () => {
      window.removeEventListener('vconsole-toggle', listener);
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
    let VConsoleCtor: typeof VConsole | undefined;
    try {
      const vconsoleModule = await import('vconsole');
      VConsoleCtor = (vconsoleModule.default ||
        vconsoleModule) as typeof VConsole;
    } catch (e) {
      // Fallback: use global VConsole if available
      const globalVConsole = (window as typeof window & { VConsole?: typeof VConsole }).VConsole;
      if (!globalVConsole) {
        throw new Error('VConsole not found');
      }
      VConsoleCtor = globalVConsole;
    }

    if (!VConsoleCtor) {
      throw new Error('VConsole class not available');
    }

    vConsoleInstance = new VConsoleCtor({
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

