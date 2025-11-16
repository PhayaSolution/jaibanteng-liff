'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import { fetchCurrentUser } from '@/app/lib/api';
import { User } from '@/app/lib/types';
import { getUserSession, saveUserSession } from '@/app/utils/storage.util';

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const session = getUserSession();
      if (!session?.lineUserId) {
        setError('Not authenticated');
        router.push('/splash');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userData = await fetchCurrentUser(session.lineUserId);
        setUser(userData);
        setName(userData.displayName);
        setPictureUrl(userData.pictureUrl || '');
      } catch (err: any) {
        console.error('Failed to load user:', err);
        setError(err.error || 'Failed to load user');
        if (err.error?.includes('401') || err.error?.includes('Unauthorized')) {
          router.push('/splash');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    // Note: The API doesn't currently support updating user profile
    // For now, we'll update the local session to reflect the change
    // In the future, you may want to add a PATCH endpoint to /api/users/me
    
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      router.push('/splash');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update local session
      const updatedSession = {
        ...session,
        displayName: name.trim(),
        pictureUrl: pictureUrl.trim() || undefined,
      };
      saveUserSession(updatedSession);
      
      // TODO: If you add a PATCH endpoint to /api/users/me, call it here:
      // await updateUser(session.lineUserId, { displayName: name.trim(), pictureUrl: pictureUrl.trim() || undefined });
      
      router.push('/settings');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.error || 'Failed to update profile');
      alert(err.error || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeArea className="min-h-dvh bg-white dark:bg-black">
        <Container className="py-4">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">กำลังโหลด...</p>
          </div>
        </Container>
      </SafeArea>
    );
  }

  if (error || !user) {
    return (
      <SafeArea className="min-h-dvh bg-white dark:bg-black">
        <Container className="py-4">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error || 'User not found'}</p>
          </div>
        </Container>
      </SafeArea>
    );
  }

  return (
    <SafeArea className="min-h-dvh bg-white dark:bg-black">
      <Container className="py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Edit Profile
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center mb-6">
            {pictureUrl ? (
              <img
                src={pictureUrl}
                alt={name}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4 text-4xl">
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
              </div>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-black dark:text-white mb-2"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              required
            />
          </div>

          {/* Picture URL Field */}
          <div>
            <label
              htmlFor="pictureUrl"
              className="block text-sm font-medium text-black dark:text-white mb-2"
            >
              Picture URL
            </label>
            <input
              id="pictureUrl"
              type="text"
              value={pictureUrl}
              onChange={(e) => setPictureUrl(e.target.value)}
              placeholder="Enter picture URL"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Optional: Enter a URL for your profile picture
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/settings')}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 px-4 py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Container>
    </SafeArea>
  );
}

