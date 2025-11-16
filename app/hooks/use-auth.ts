'use client';

import { useState, useEffect, useCallback } from 'react';
import { initLiff, isLiff } from '@/app/utils/liff.util';
import { getUserSession, saveUserSession, clearUserSession, UserSession } from '@/app/utils/storage.util';
import { sendErrorToOA } from '@/app/utils/debug.util';

export interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserSession | null;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isInitialized: false,
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const login = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Initialize LIFF (will use cached instance if already initialized)
      // Don't check isLiff() first - let initialization determine if we're in LIFF
      const initialized = await initLiff();
      
      if (!initialized) {
        console.error('[Auth Hook Debug] Failed to initialize LIFF');
        setAuthState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          isAuthenticated: false,
          error: 'Failed to initialize LIFF',
        }));
        return false;
      }

      // Get complete user info including email, phone if available
      const { getLiffUserInfo, isLiffReady } = await import('@/app/utils/liff.util');
      
      // Ensure LIFF is ready before getting profile
      const ready = await isLiffReady();
      if (!ready) {
        console.error('[Auth Hook Debug] LIFF is not ready');
        setAuthState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          isAuthenticated: false,
          error: 'LIFF is not ready',
        }));
        return false;
      }
      
      const userInfo = await getLiffUserInfo();
      
      // If profile is null, it might mean user needs to login (redirect happened)
      // After login redirect, LINE will redirect back and page will reload
      // So we should return false and let the page reload handle the retry
      if (!userInfo.profile) {
        console.warn('[Auth Hook Debug] Profile not available - user may need to login or login redirect is in progress');
        setAuthState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          isAuthenticated: false,
          error: null, // User needs to login or redirect is happening, not an error
        }));
        return false;
      }

      const profile = userInfo.decodedProfile || userInfo.profile;
      
      // Log all available user information
      // Send profile to backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage,
          email: 'email' in profile ? profile.email : undefined,
          phoneNumber: 'phoneNumber' in profile ? profile.phoneNumber : undefined,
        }),
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to login');
      }

      const data = await response.json();
      // Save session
      const session: UserSession = {
        id: data.user.id,
        lineUserId: data.user.lineUserId,
        displayName: data.user.displayName,
        pictureUrl: data.user.pictureUrl,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt,
      };
      
      saveUserSession(session);

      setAuthState({
        isInitialized: true,
        isAuthenticated: true,
        isLoading: false,
        user: session,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('[Auth Hook Debug] ❌ Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Try to send error to LINE OA if we have user info
      const session = getUserSession();
      if (session?.lineUserId) {
        sendErrorToOA(session.lineUserId, error, 'Auth Hook Login').catch(console.error);
      }
      
      setAuthState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearUserSession();
    setAuthState({
      isInitialized: true,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });
  }, []);

  useEffect(() => {
    
    // Check for existing session
    const session = getUserSession();
    
    if (session) {
      setAuthState({
        isInitialized: true,
        isAuthenticated: true,
        isLoading: false,
        user: session,
        error: null,
      });
    } else {
      setAuthState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
      }));
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
}

