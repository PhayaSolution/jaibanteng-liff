/**
 * Debug utility for sending messages to LINE OA
 */

export type DebugType = 'info' | 'warning' | 'error' | 'success';

export type DebugData = Record<string, unknown>;

/**
 * Send debug message to LINE OA
 * Works on both client and server side
 */
export async function sendDebugToOA(
  userId: string,
  message: string,
  type: DebugType = 'info',
  data?: DebugData
): Promise<boolean> {
  try {
    // Determine API URL based on environment
    const apiUrl = typeof window !== 'undefined' 
      ? '/api/debug/send-message'
      : process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/debug/send-message`
        : 'http://localhost:3000/api/debug/send-message';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        message,
        type,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Debug Util] Failed to send debug message:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Debug Util] Error sending debug message:', error);
    return false;
  }
}

/**
 * Format error for debug message
 */
export function formatErrorForDebug(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n\nStack:\n${error.stack || 'No stack trace'}`;
  }
  return String(error);
}

/**
 * Collect current app state for debugging
 */
export function collectAppState(): DebugData {
  if (typeof window === 'undefined') {
    return { error: 'Cannot collect state on server' };
  }

  return {
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    localStorage: {
      hasUserSession: !!localStorage.getItem('user_session'),
      hasCategories: !!localStorage.getItem('categories'),
      hasTags: !!localStorage.getItem('tags'),
      hasProfile: !!localStorage.getItem('profile'),
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    },
  };
}

/**
 * Send error debug to LINE OA
 */
export async function sendErrorToOA(
  userId: string,
  error: unknown,
  context?: string
): Promise<boolean> {
  const errorMessage = formatErrorForDebug(error);
  const message = context
    ? `❌ Error in ${context}\n\n${errorMessage}`
    : `❌ Error occurred\n\n${errorMessage}`;

  const data = {
    ...collectAppState(),
    context,
  };

  return sendDebugToOA(userId, message, 'error', data);
}

/**
 * Send info debug to LINE OA
 */
export async function sendInfoToOA(
  userId: string,
  message: string,
  data?: DebugData
): Promise<boolean> {
  return sendDebugToOA(userId, message, 'info', data);
}

