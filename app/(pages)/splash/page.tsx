'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CatIcon from '@/app/components/icons/cat-icon.component';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to dashboard after 2 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-white dark:bg-black">
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
      </div>
    </div>
  );
}

