'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import BottomNavigation from '@/app/components/layout/bottom-navigation.component';
import { getUserSession } from '@/app/utils/storage.util';
import { fetchCurrentUser } from '@/app/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('User');
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const session = getUserSession();
        if (!session?.lineUserId) {
          setIsLoading(false);
          return;
        }

        // Try to fetch latest user data from API
        try {
          const user = await fetchCurrentUser(session.lineUserId);
          setDisplayName(user.displayName || 'User');
          setPictureUrl(user.pictureUrl || null);
        } catch (error) {
          // Fallback to session data if API fails
          console.error('Failed to fetch user from API:', error);
          setDisplayName(session.displayName || 'User');
          setPictureUrl(session.pictureUrl || null);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  return (
    <SafeArea className="min-h-screen min-h-dvh bg-white dark:bg-black">
      <Container className="py-4 pb-20">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4 overflow-hidden">
            {isLoading ? (
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-600 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            ) : pictureUrl ? (
              <Image
                src={pictureUrl}
                alt={displayName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              {isLoading ? '...' : displayName}
            </h2>
            <button
              onClick={() => router.push('/settings/profile/edit')}
              className="p-1 text-gray-400 hover:text-black dark:hover:text-white"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => router.push('/settings/category')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm font-medium text-black dark:text-white">Category</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            onClick={() => router.push('/tags')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm font-medium text-black dark:text-white">Tags</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Logout Button */}
        <button className="w-full py-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
          <span>Logout</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </Container>

      <BottomNavigation />
    </SafeArea>
  );
}

