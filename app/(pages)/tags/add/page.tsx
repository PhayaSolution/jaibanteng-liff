'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import { createTag } from '@/app/lib/api';
import { getUserSession } from '@/app/utils/storage.util';

export default function AddTagPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a tag name');
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
      await createTag(session.lineUserId, {
        name: name.trim(),
      });
      
      router.push('/tags');
    } catch (err: unknown) {
      console.error('Failed to add tag:', err);
      const message =
        typeof err === 'object' && err !== null && 'error' in err
          ? (err as { error?: string }).error ?? 'Failed to add tag'
          : 'Failed to add tag';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsLayout title="Add Tag">
      <form onSubmit={handleSubmit}>
        <SettingsSection title="Tag Details">
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
              placeholder="Enter tag name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              required
            />
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
          {isSubmitting ? 'Creating...' : 'Create Tag'}
        </button>
      </form>
    </SettingsLayout>
  );
}
