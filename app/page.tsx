'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CatIcon from '@/app/components/icons/cat-icon.component';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to splash page
    router.push('/splash');
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white dark:bg-black p-4">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-24 h-24 sm:w-28 sm:h-28 text-black dark:text-white">
          <CatIcon className="w-full h-full" />
        </div>
        
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Jai Banteng
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            minimal budgeting
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="h-1.5 w-1.5 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-1.5 w-1.5 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
          <div className="h-1.5 w-1.5 bg-black dark:bg-white rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
