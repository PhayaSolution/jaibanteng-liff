'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import { createCategory } from '@/app/lib/api';
import { EmojiPicker } from '@/app/components/ui/emoji-picker';
import { getUserSession } from '@/app/utils/storage.util';

export default function AddCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a category name');
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
      await createCategory(session.lineUserId, {
        name: name.trim(),
        emoji: emoji.trim() || undefined,
      });
      
      router.push('/settings/category');
    } catch (err: any) {
      console.error('Failed to add category:', err);
      setError(err.error || 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsLayout title="Add Category">
      <form onSubmit={handleSubmit}>
        <SettingsSection title="Category Details">
          <div className="space-y-4">
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
                placeholder="Enter category name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                required
              />
            </div>

            {/* Emoji Field */}
            <div>
              <label
                htmlFor="emoji"
                className="block text-sm font-medium text-black dark:text-white mb-2"
              >
                Emoji
              </label>
              <EmojiPicker
                value={emoji}
                onChange={setEmoji}
                placeholder="Select emoji"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Optional: Add an emoji to represent this category
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Preview */}
        {(name || emoji) && (
          <SettingsSection title="Preview">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center text-4xl">
                  {emoji || '📁'}
                </div>
                <span className="text-sm font-medium text-black dark:text-white">
                  {name || 'Category Name'}
                </span>
              </div>
            </div>
          </SettingsSection>
        )}

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
          {isSubmitting ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </SettingsLayout>
  );
}
