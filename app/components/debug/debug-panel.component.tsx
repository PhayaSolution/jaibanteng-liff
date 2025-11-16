'use client';

import { useState, useEffect } from 'react';
import { sendDebugToOA, sendErrorToOA, collectAppState, DebugType } from '@/app/utils/debug.util';
import { useAuth } from '@/app/hooks/use-auth';
import { isLiff, getLiffId, isLiffReady } from '@/app/utils/liff.util';
import { useLiffContext } from '@/app/providers/liff-provider';
import { toggleVConsole, isVConsoleEnabled } from '@/app/providers/vconsole-provider';

interface DebugPanelProps {
  className?: string;
}

export default function DebugPanel({ className = '' }: DebugPanelProps) {
  const { user, error, isAuthenticated, isLoading, isInitialized } = useAuth();
  const liffContext = useLiffContext();
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState(false);
  const [vConsoleOn, setVConsoleOn] = useState(false);
  const [liffReady, setLiffReady] = useState<boolean | null>(null);
  const [liffId, setLiffId] = useState<string | null>(null);

  useEffect(() => {
    setVConsoleOn(isVConsoleEnabled());
  }, []);

  useEffect(() => {
    // Check LIFF ready status
    let cancelled = false;
    isLiffReady()
      .then(ready => {
        if (!cancelled) setLiffReady(ready);
      })
      .catch(() => {
        if (!cancelled) setLiffReady(false);
      });
    setLiffId(getLiffId());
    
    return () => {
      cancelled = true;
    };
  }, [isInitialized, liffContext.isReady]);

  // Debug: Log user state changes
  useEffect(() => {
    console.log('[Debug Panel] User state changed:', {
      hasUser: !!user,
      user: user ? {
        id: user.id,
        lineUserId: user.lineUserId,
        displayName: user.displayName,
      } : null,
      isAuthenticated,
      isLoading,
      isInitialized,
      error,
    });
  }, [user, isAuthenticated, isLoading, isInitialized, error]);

  const handleSendDebug = async (type: DebugType = 'info') => {
    if (!user?.lineUserId) {
      alert('User not logged in');
      return;
    }

    setSending(true);
    setLastSent(false);

    try {
      const appState = collectAppState();
      const authState = {
        isAuthenticated,
        isLoading,
        isInitialized,
        hasError: !!error,
        error: error || null,
        user: user ? {
          id: user.id,
          lineUserId: user.lineUserId,
          displayName: user.displayName,
        } : null,
      };

      const message = type === 'error' && error
        ? `Error occurred: ${error}`
        : type === 'info'
        ? 'Debug info requested'
        : 'Debug message';

      const success = await sendDebugToOA(
        user.lineUserId,
        message,
        type,
        {
          ...appState,
          authState,
          liffEnv: isLiff(),
        }
      );

      if (success) {
        setLastSent(true);
        setTimeout(() => setLastSent(false), 3000);
      } else {
        alert('Failed to send debug message');
      }
    } catch (err) {
      console.error('Error sending debug:', err);
      alert('Error sending debug message');
    } finally {
      setSending(false);
    }
  };

  const handleSendError = async () => {
    if (!user?.lineUserId || !error) {
      return;
    }

    setSending(true);
    try {
      await sendErrorToOA(user.lineUserId, error, 'Splash Page');
    } catch (err) {
      console.error('Error sending error:', err);
    } finally {
      setSending(false);
    }
  };

  if (process.env.NODE_ENV !== 'development' && !isLiff()) {
    return null;
  }

  return (
    <div className={`mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left text-xs max-w-md ${className}`}>
      <div className="font-bold mb-2 flex items-center justify-between">
        <span>Debug Panel</span>
        {lastSent && (
          <span className="text-green-500 text-xs">✓ Sent</span>
        )}
      </div>
      
      <div className="mb-2 space-y-1">
        <div className="font-semibold mb-2">Auth State:</div>
        <div>Initialized: {isInitialized ? '✅' : '⏳'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>Has User: {user ? '✅' : '❌'}</div>
        
        <div className="font-semibold mt-2 mb-1">LIFF State:</div>
        <div>LIFF Provider Ready: {liffContext.isReady ? '✅' : '❌'}</div>
        <div>LIFF Provider Init: {liffContext.isInitialized ? '✅' : '⏳'}</div>
        <div>LIFF Ready: {liffReady === true ? '✅' : liffReady === false ? '❌' : '⏳'}</div>
        <div>LIFF Env Detected: {isLiff() ? '✅' : '❌'}</div>
        <div>LIFF ID: {liffId ? `✅ ${liffId.substring(0, 8)}...` : '❌ Not set'}</div>
        {liffContext.error && (
          <div className="text-red-500 mt-1">LIFF Error: {liffContext.error}</div>
        )}
        
        {error && (
          <div className="text-red-500 mt-2">
            <div className="font-semibold">Auth Error:</div>
            <div>{error}</div>
          </div>
        )}
      </div>

      {user ? (
        <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
          <div className="font-bold mb-1">✅ User Data:</div>
          <div>ID: {user.id}</div>
          <div>LINE User ID: {user.lineUserId}</div>
          <div>Display Name: {user.displayName}</div>
          {user.pictureUrl && <div>Picture: ✅</div>}
          {user.email && <div>Email: {user.email}</div>}
          {user.phoneNumber && <div>Phone: {user.phoneNumber}</div>}
        </div>
      ) : (
        <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
          <div className="font-bold mb-1 text-yellow-600 dark:text-yellow-400">⚠️ No User Data</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
            {!isInitialized && <div>⏳ Initializing...</div>}
            {isInitialized && isLoading && <div>⏳ Loading...</div>}
            {isInitialized && !isLoading && !isAuthenticated && !isLiff() && (
              <div>❌ Not in LIFF environment - Cannot login</div>
            )}
            {isInitialized && !isLoading && !isAuthenticated && isLiff() && (
              <div>❌ Login required or failed - Check console for details</div>
            )}
            {isInitialized && !isLoading && isAuthenticated && (
              <div>❌ User data not loaded - Check localStorage</div>
            )}
          </div>
          {error && (
            <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <div className="font-semibold">Error:</div>
              <div>{error}</div>
            </div>
          )}
          
          {/* Check localStorage button */}
          <button
            onClick={() => {
              const session = localStorage.getItem('user_session');
              if (session) {
                try {
                  const parsed = JSON.parse(session);
                  alert(`Found session in localStorage:\n\n${JSON.stringify(parsed, null, 2)}`);
                } catch (e) {
                  alert(`Found session but failed to parse:\n\n${session}`);
                }
              } else {
                alert('No user_session found in localStorage');
              }
            }}
            className="mt-2 w-full px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            🔍 Check localStorage
          </button>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
        <div className="font-bold mb-2">Debug Tools:</div>
        
        {/* vConsole Toggle */}
        <div className="mb-3">
          <button
            onClick={() => {
              const newState = !vConsoleOn;
              toggleVConsole(newState);
              setVConsoleOn(newState);
            }}
            className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors ${
              vConsoleOn
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600'
            }`}
          >
            {vConsoleOn ? '🟢 vConsole: ON' : '⚪ vConsole: OFF'}
          </button>
          <div className="text-gray-500 text-xs mt-1">
            {vConsoleOn ? (
              <>
                ✅ vConsole is active. Look for the green button at bottom-right corner.
                <br />
                Click to disable vConsole
              </>
            ) : (
              'Click to enable vConsole (mobile debug console for LINE LIFF)'
            )}
          </div>
          {vConsoleOn && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
              <div className="font-semibold mb-1">💡 vConsole Features:</div>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
                <li>Console logs & errors</li>
                <li>Network requests</li>
                <li>LocalStorage/SessionStorage</li>
                <li>System info</li>
                <li>Element inspector</li>
              </ul>
            </div>
          )}
        </div>

        {/* Send to LINE OA */}
        <div>
          <div className="font-bold mb-2 text-xs">Send to LINE OA:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSendDebug('info')}
              disabled={sending || !user?.lineUserId}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : '📤 Info'}
            </button>
            {error && (
              <button
                onClick={handleSendError}
                disabled={sending || !user?.lineUserId}
                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : '❌ Error'}
              </button>
            )}
            <button
              onClick={() => handleSendDebug('warning')}
              disabled={sending || !user?.lineUserId}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : '⚠️ Warning'}
            </button>
          </div>
          {!user?.lineUserId && (
            <div className="text-gray-500 text-xs mt-2">
              Login required to send debug messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

