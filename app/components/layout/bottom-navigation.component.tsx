'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Receipt, Plus, User } from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
    }
    if (path === '/transaction/add') {
      return pathname === '/transaction/add';
    }
    if (path === '/settings') {
      return pathname === '/settings' || pathname.startsWith('/settings/');
    }
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="max-w-2xl mx-auto px-8 py-5 flex items-center justify-around">
        <button
          onClick={() => router.push('/dashboard')}
          className={`p-3 transition-colors ${
            isActive('/dashboard')
              ? 'text-black dark:text-white'
              : 'text-gray-400 dark:text-gray-600'
          }`}
        >
          <Receipt className="w-6 h-6" />
        </button>

        <button
          onClick={() => router.push('/transaction/add')}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors bg-black dark:bg-white text-white dark:text-black shadow-lg`}
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => router.push('/settings')}
          className={`p-3 transition-colors ${
            isActive('/settings')
              ? 'text-black dark:text-white'
              : 'text-gray-400 dark:text-gray-600'
          }`}
        >
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

