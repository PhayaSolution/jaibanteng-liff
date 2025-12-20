'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Image as ImageIcon } from 'lucide-react';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import { fetchCurrentUser } from '@/app/lib/api';
import { User as UserType } from '@/app/lib/types';
import { getUserSession, saveUserSession } from '@/app/utils/storage.util';

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        setName(userData.displayName);
        setPictureUrl(userData.pictureUrl || '');
      } catch (err: unknown) {
        console.error('Failed to load user:', err);
        const message =
          typeof err === 'object' && err !== null && 'error' in err
            ? (err as { error?: string }).error ?? 'Failed to load user'
            : 'Failed to load user';
        setError(message);
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
      
      // Note: Add API call here when endpoint is available
      
      router.push('/settings');
    } catch (err: unknown) {
      console.error('Failed to update profile:', err);
      const message =
        typeof err === 'object' && err !== null && 'error' in err
          ? (err as { error?: string }).error ?? 'Failed to update profile'
          : 'Failed to update profile';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SettingsLayout title="Edit Profile" backUrl="/settings">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto"></div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Edit Profile" backUrl="/settings">
      <form onSubmit={handleSubmit}>
        {/* Avatar Preview */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4 overflow-hidden border-4 border-white dark:border-black shadow-sm">
            {pictureUrl ? (
              <img
                src={pictureUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400 dark:text-gray-600" />
            )}
          </div>
        </div>

        <SettingsSection title="Public Profile">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black dark:text-white mb-2">
                Display Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="Your name"
                  required
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor="pictureUrl" className="block text-sm font-medium text-black dark:text-white mb-2">
                Picture URL
              </label>
              <div className="relative">
                <input
                  id="pictureUrl"
                  type="text"
                  value={pictureUrl}
                  onChange={(e) => setPictureUrl(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="https://..."
                />
                <ImageIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Optional: URL to your profile picture
              </p>
            </div>
          </div>
        </SettingsSection>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full py-4 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </SettingsLayout>
  );
}
