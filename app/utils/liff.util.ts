/**
 * LINE LIFF Utility Functions
 * 
 * สำหรับจัดการ LINE LIFF SDK และ helper functions
 */

// LINE LIFF SDK types (จะต้องติดตั้ง @line/liff เมื่อใช้งานจริง)
export interface LiffInitOptions {
  liffId?: string;
  withLoginOnExternalBrowser?: boolean;
}

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
}

export interface LiffDecodedProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
  phoneNumber?: string;
}

/**
 * Get LIFF ID from environment variable
 */
export function getLiffId(): string | null {
  if (typeof window === 'undefined') return null;
  return process.env.NEXT_PUBLIC_LINE_LIFF_ID || null;
}

// Cache for LIFF instance
let liffInstance: typeof import('@line/liff').default | null = null;
let liffInitPromise: Promise<boolean> | null = null;
let isLiffInitialized = false;

/**
 * Initialize LINE LIFF SDK (with caching to prevent multiple initializations)
 * 
 * ตัวอย่างการใช้งาน:
 * ```tsx
 * useEffect(() => {
 *   initLiff();
 * }, []);
 * ```
 */
export async function initLiff(options?: LiffInitOptions): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Return cached promise if already initializing
  if (liffInitPromise) {
    return liffInitPromise;
  }
  
  // Return true if already initialized
  if (isLiffInitialized && liffInstance) {
    return true;
  }
  
  // Create initialization promise
  liffInitPromise = (async () => {
    try {
      const liffId = options?.liffId || getLiffId();
      
      if (!liffId) {
        return false;
      }
      
      // Dynamic import สำหรับ LINE LIFF SDK
      const liff = (await import('@line/liff')).default;
      liffInstance = liff;
      
      // Initialize LIFF (don't check isLoggedIn before init)
      await liff.init({
        liffId,
        withLoginOnExternalBrowser: options?.withLoginOnExternalBrowser ?? false,
      });
      
      isLiffInitialized = true;
      
      return true;
  } catch (error) {
      isLiffInitialized = false;
      liffInstance = null;
    throw error;
    } finally {
      liffInitPromise = null;
  }
  })();
  
  return liffInitPromise;
}

/**
 * Check if running in LINE LIFF environment
 * 
 * This function tries multiple methods to detect LIFF:
 * 1. Check if LIFF SDK is already initialized and available
 * 2. Check URL for liff.line.me (less reliable in LIFF v2)
 * 3. Check query parameters that LIFF might set
 * 
 * Note: This should not be used to block initialization.
 * Always try to initialize LIFF if NEXT_PUBLIC_LINE_LIFF_ID is available.
 */
export function isLiff(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Method 1: Check if LIFF is already initialized
  if (isLiffInitialized && liffInstance) {
    try {
      // Try to check if we're in LIFF client using SDK
      if (typeof liffInstance.isInClient === 'function') {
        return liffInstance.isInClient();
      }
    } catch {
      // Fall through to other checks
    }
  }
  
  // Method 2: Check URL (less reliable but still useful)
  const url = window.location.href;
  if (url.includes('liff.line.me')) {
    return true;
  }
  
  // Method 3: Check query parameters that LIFF might set
  const params = new URLSearchParams(window.location.search);
  if (params.has('liff.state') || params.has('liffClientId')) {
    return true;
  }
  
  // Method 4: Check if we have LIFF ID configured (indicates intent to use LIFF)
  // This is a weak check but helps in some cases
  if (getLiffId()) {
    // If we have LIFF ID, we might be in LIFF, but don't block if false
    // The actual initialization will determine if we're really in LIFF
    return false; // Return false to allow initialization attempt
  }
  
  return false;
}

/**
 * Check if LIFF is ready (initialized and available)
 * 
 * This function will attempt to initialize LIFF if not already initialized.
 * It does NOT check isLiff() first, allowing initialization to proceed.
 */
export async function isLiffReady(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    // Ensure LIFF is initialized (will check for LIFF ID internally)
    if (!isLiffInitialized || !liffInstance) {
      const initialized = await initLiff();
      if (!initialized) {
        return false;
      }
    }
    
    const liff = liffInstance || (await import('@line/liff')).default;
    
    // Check if initialized by trying to access a method
    if (typeof liff.isLoggedIn !== 'function') {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Get LINE user profile
 * 
 * ต้อง initialize LIFF ก่อนใช้งาน
 * 
 * ถ้า user ยังไม่ได้ login จะเรียก liff.login() และ throw error เพื่อให้ caller handle redirect
 */
export async function getLiffProfile(): Promise<LiffProfile | LiffDecodedProfile | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Ensure LIFF is initialized first (don't check isLiff() - let initialization determine)
    const ready = await isLiffReady();
    if (!ready) {
      return null;
    }
    
    // Use cached instance if available, otherwise import
    const liff = liffInstance || (await import('@line/liff')).default;
    
    // Check login status
    const isLoggedIn = liff.isLoggedIn();
    
    if (!isLoggedIn) {
      // liff.login() will redirect to LINE login page
      // After login, LINE will redirect back to this app
      // The page will reload, so we don't need to return anything here
      liff.login();
      // Return null to indicate login redirect is happening
      // The caller should handle this by checking again after page reload
      return null;
    }
    
    const profile = await liff.getProfile();
    
    // Try to get decoded ID token for additional info (email, phone)
    let decodedProfile: LiffDecodedProfile | null = null;
    try {
      const idToken = liff.getIDToken();
      if (idToken) {
        // Decode JWT token (base64)
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        decodedProfile = {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage,
          email: decoded.email,
          phoneNumber: decoded.phone_number,
        };
      }
    } catch {
      // Silent fail - email/phone may not be available
    }
    
    const finalProfile = decodedProfile || profile;
    
    return finalProfile;
  } catch {
    return null;
  }
}

/**
 * Get LINE access token
 */
export async function getLiffAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    // Ensure LIFF is ready (don't check isLiff() first)
    const ready = await isLiffReady();
    if (!ready) {
      return null;
    }
    
    const liff = liffInstance || (await import('@line/liff')).default;
    
    if (!liff.isLoggedIn()) {
      return null;
    }
    
    const token = liff.getAccessToken();
    return token;
  } catch {
    return null;
  }
}

/**
 * Get LINE ID token (contains user info like email, phone)
 */
export async function getLiffIdToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    // Ensure LIFF is ready (don't check isLiff() first)
    const ready = await isLiffReady();
    if (!ready) {
      return null;
    }
    
    const liff = liffInstance || (await import('@line/liff')).default;
    
    if (!liff.isLoggedIn()) {
      return null;
    }
    
    const token = liff.getIDToken();
    return token;
  } catch {
    return null;
  }
}

/**
 * Get all available LINE user information
 */
export async function getLiffUserInfo(): Promise<{
  profile: LiffProfile | LiffDecodedProfile | null;
  accessToken: string | null;
  idToken: string | null;
  decodedProfile: LiffDecodedProfile | null;
}> {
  const profile = await getLiffProfile();
  const accessToken = await getLiffAccessToken();
  const idToken = await getLiffIdToken();
  
  let decodedProfile: LiffDecodedProfile | null = null;
  
  if (idToken && profile) {
    try {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      decodedProfile = {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
        email: decoded.email,
        phoneNumber: decoded.phone_number,
      };
    } catch {
      // Silent fail
    }
  }
  
  return {
    profile,
    accessToken,
    idToken,
    decodedProfile,
  };
}

/**
 * Close LIFF window
 */
export async function closeLiff(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const ready = await isLiffReady();
    if (!ready) {
      return;
    }
    
    const liff = liffInstance || (await import('@line/liff')).default;
    liff.closeWindow();
  } catch {
    // Silent fail
  }
}

/**
 * Send message to LINE
 */
export async function sendLiffMessage(messages: Array<{ type: "text"; text: string }>): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Ensure LIFF is ready (don't check isLiff() first)
    const ready = await isLiffReady();
    if (!ready) {
      throw new Error('LIFF is not ready');
    }
    
    const liff = liffInstance || (await import('@line/liff')).default;

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    await liff.sendMessages(messages);
  } catch (error) {
    throw error;
  }
}

