'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/use-auth';
import SplashScreen from '@/app/components/splash-screen.component';

export default function Home() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, error, login, isInitialized } = useAuth();

  useEffect(() => {
    // Auto-login when component mounts if not already authenticated
    if (isInitialized && !isAuthenticated && !isLoading) {
      console.log('[Home] Attempting auto-login...');
      login();
    }
  }, [isInitialized, isAuthenticated, isLoading, login]);

  useEffect(() => {
    // Redirect to dashboard when login is successful
    if (isInitialized && isAuthenticated && !isLoading && user) {
      console.log('[Home] Login successful, redirecting to dashboard...');
      router.replace('/dashboard');
    }
  }, [isInitialized, isAuthenticated, isLoading, user, router]);

  return (
    <SplashScreen 
      isLoading={isLoading || (isInitialized && !isAuthenticated)} 
      error={error} 
      onRetry={() => window.location.reload()}
    />
  );
}
