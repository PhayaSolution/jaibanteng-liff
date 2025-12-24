'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Receipt, Plus, User } from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-2xl pb-[calc(0px+env(safe-area-inset-bottom,0px)/2)] z-50 animate-fade-in-up">
      <div className="px-6 py-3 flex items-center justify-around">
        <Link
          href="/dashboard"
          className={`p-4 transition-all duration-300 rounded-2xl ${
            isActive('/dashboard')
              ? 'text-primary bg-primary/10 scale-110'
              : 'text-foreground/40 hover:text-foreground/60'
          }`}
        >
          <Receipt className="w-6 h-6" />
        </Link>

        <Link
          href="/transaction/add"
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all bg-primary text-white shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 hover:rotate-90"
        >
          <Plus className="w-7 h-7 stroke-[3px]" />
        </Link>

        <Link
          href="/settings"
          className={`p-4 transition-all duration-300 rounded-2xl ${
            isActive('/settings')
              ? 'text-primary bg-primary/10 scale-110'
              : 'text-foreground/40 hover:text-foreground/60'
          }`}
        >
          <User className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}

