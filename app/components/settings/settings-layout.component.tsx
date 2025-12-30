'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
  actionButton?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export default function SettingsLayout({
  children,
  title,
  showBackButton = true,
  backUrl,
  actionButton,
  className = '',
  footer,
}: SettingsLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <SafeArea className="h-dvh bg-background dark:bg-zinc-950 flex flex-col overflow-hidden">
      <Container className={`py-6 ${footer ? 'pb-36 sm:pb-32' : 'pb-10'} flex-1 overflow-y-auto min-h-0 no-scrollbar ${className}`}>
        {/* Header */}
        {(title || showBackButton || actionButton) && (
          <div className="flex items-center justify-between mb-8 gap-4 animate-fade-in-up">
            <div className="flex items-center gap-4 min-w-0">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="p-3.5 hover:text-primary bg-white dark:bg-zinc-900 shadow-xl shadow-black/5 rounded-2xl transition-all active:scale-90"
                  aria-label="Go back"
                >
                  <svg
                    className="w-5 h-5 text-current"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              {title && (
                <h1 className="text-3xl font-black text-foreground font-prompt tracking-tight">
                  {title}
                </h1>
              )}
            </div>
            {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
          </div>
        )}

        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {children}
        </div>
      </Container>
      {footer}
    </SafeArea>
  );
}










