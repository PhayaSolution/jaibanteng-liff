'use client';

import { useRouter } from 'next/navigation';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export default function SettingsLayout({
  children,
  title,
  showBackButton = true,
  backUrl,
  actionButton,
  className = '',
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
    <SafeArea className="min-h-screen min-h-dvh bg-white dark:bg-black">
      <Container className={`py-4 pb-20 ${className}`}>
        {/* Header */}
        {(title || showBackButton || actionButton) && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Go back"
                >
                  <svg
                    className="w-6 h-6 text-black dark:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              {title && (
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  {title}
                </h1>
              )}
            </div>
            {actionButton && <div>{actionButton}</div>}
          </div>
        )}

        {/* Content */}
        {children}
      </Container>
    </SafeArea>
  );
}



