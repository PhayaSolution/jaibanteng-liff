'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/use-auth';
import SplashScreen from '@/app/components/splash-screen.component';
import DashboardView from '@/app/components/dashboard/dashboard-view.component';

export default function Home() {
  const { user, isLoading, isAuthenticated, error, login, isInitialized } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Auto-login when component mounts if not already authenticated
    if (isInitialized && !isAuthenticated && !isLoading) {
      console.log('[Home] Attempting auto-login...');
      login();
    }
  }, [isInitialized, isAuthenticated, isLoading, login]);

  useEffect(() => {
    // Transition to dashboard when login is successful
    if (isInitialized && isAuthenticated && !isLoading && user) {
      const timer = setTimeout(() => {
        console.log('[Home] Login successful, showing dashboard...');
        setShowSplash(false);
      }, 800); // Small delay for UX transition
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isAuthenticated, isLoading, user]);

  if (showSplash || !isAuthenticated || !user) {
    return (
      <SplashScreen 
        isLoading={isLoading || (isAuthenticated && showSplash)} 
        error={error} 
        onRetry={() => window.location.reload()}
      />
    );
  }

  return <DashboardView />;
}
