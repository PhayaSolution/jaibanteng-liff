/**
 * LINE LIFF Utility Functions
 * 
 * สำหรับจัดการ LINE LIFF SDK และ helper functions
 */

// LINE LIFF SDK types (จะต้องติดตั้ง @line/liff เมื่อใช้งานจริง)
export interface LiffInitOptions {
  liffId: string;
  withLoginOnExternalBrowser?: boolean;
}

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

/**
 * Initialize LINE LIFF SDK
 * 
 * ตัวอย่างการใช้งาน:
 * ```tsx
 * useEffect(() => {
 *   initLiff({ liffId: 'YOUR_LIFF_ID' });
 * }, []);
 * ```
 */
export async function initLiff(options: LiffInitOptions): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    // Dynamic import สำหรับ LINE LIFF SDK
    const liff = (await import('@line/liff')).default;
    
    await liff.init({
      liffId: options.liffId,
      withLoginOnExternalBrowser: options.withLoginOnExternalBrowser ?? false,
    });
    
    console.log('LIFF initialized successfully');
  } catch (error) {
    console.error('LIFF initialization failed:', error);
    throw error;
  }
}

/**
 * Check if running in LINE LIFF environment
 */
export function isLiff(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.href.includes('liff.line.me');
}

/**
 * Get LINE user profile
 * 
 * ต้อง initialize LIFF ก่อนใช้งาน
 */
export async function getLiffProfile(): Promise<LiffProfile | null> {
  if (typeof window === 'undefined' || !isLiff()) return null;
  
  try {
    const liff = (await import('@line/liff')).default;
    
    if (!liff.isLoggedIn()) {
      liff.login();
      return null;
    }
    
    const profile = await liff.getProfile();
    return profile;
  } catch (error) {
    console.error('Failed to get LIFF profile:', error);
    return null;
  }
}

/**
 * Close LIFF window
 */
export async function closeLiff(): Promise<void> {
  if (typeof window === 'undefined' || !isLiff()) return;

  try {
    const liff = (await import('@line/liff')).default;
    liff.closeWindow();
  } catch (error) {
    console.error('Failed to close LIFF window:', error);
  }
}

/**
 * Send message to LINE
 */
export async function sendLiffMessage(messages: Array<{ type: "text"; text: string }>): Promise<void> {
  if (typeof window === 'undefined' || !isLiff()) return;

  try {
    const liff = (await import('@line/liff')).default;

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    await liff.sendMessages(messages);
  } catch (error) {
    console.error('Failed to send LIFF message:', error);
    throw error;
  }
}

