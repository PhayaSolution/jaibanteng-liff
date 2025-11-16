'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CatIcon from '@/app/components/icons/cat-icon.component';
import { useAuth } from '@/app/hooks/use-auth';
import { isLiff } from '@/app/utils/liff.util';
import DebugPanel from '@/app/components/debug/debug-panel.component';

export default function SplashPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, error, login, isInitialized } = useAuth();

  useEffect(() => {
    // Auto-login when component mounts if not already authenticated
    // Only attempt login if we're initialized and not already authenticated
    if (isInitialized && !isAuthenticated && !isLoading) {
      console.log('[SplashPage] Attempting auto-login...');
      login();
    }
  }, [isInitialized, isAuthenticated, isLoading, login]);

  useEffect(() => {
    // Redirect to dashboard when login is successful
    if (isInitialized && isAuthenticated && !isLoading && user) {
      console.log('[SplashPage] Login successful, redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [isInitialized, isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
          <CatIcon className="w-full h-full text-black dark:text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white mb-2">
            Jai Banteng
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
            your minimal budgeting app
          </p>
        </div>

        {isLoading && (
          <p className="text-gray-500">กำลังโหลด...</p>
        )}

        {error && !isLoading && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-md">
            <p className="text-red-600 dark:text-red-400">
              {error.includes('Failed to initialize LIFF') || error.includes('LIFF is not ready')
                ? 'ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาเปิดแอปผ่าน LINE'
                : `เกิดข้อผิดพลาด: ${error}`}
            </p>
            {!isLiff() && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                แอปนี้ต้องเปิดผ่าน LINE LIFF เท่านั้น
              </p>
            )}
          </div>
        )}

        {user && isAuthenticated && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-md">
            <h2 className="text-lg font-bold mb-2">ข้อมูล User</h2>
            <p><strong>User ID:</strong> {user.lineUserId}</p>
            <p><strong>Display Name:</strong> {user.displayName}</p>
            {user.pictureUrl && (
              <div className="mt-2">
                <Image 
                  src={user.pictureUrl} 
                  alt={user.displayName} 
                  width={80} 
                  height={80} 
                  className="rounded-full" 
                />
              </div>
            )}
            {user.email && <p><strong>Email:</strong> {user.email}</p>}
            {user.phoneNumber && <p><strong>Phone:</strong> {user.phoneNumber}</p>}
          </div>
        )}
        
        {/* Debug Panel */}
        {(process.env.NODE_ENV === 'development' || isLiff()) && (
          <DebugPanel />
        )}
      </div>
    </div>
  );
}

