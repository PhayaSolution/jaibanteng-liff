'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import { fetchCategories, updateCategory } from '@/app/lib/api';
import { Category } from '@/app/lib/types';
import { EmojiPicker } from '@/app/components/ui/emoji-picker';
import { getUserSession } from '@/app/utils/storage.util';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategory() {
      const session = getUserSession();
      if (!session?.lineUserId) {
        setError('Not authenticated');
        router.push('/splash');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const categories = await fetchCategories(session.lineUserId);
        const foundCategory = categories.find(cat => cat.id === id);
        
        if (foundCategory) {
          setCategory(foundCategory);
          setName(foundCategory.name);
          setEmoji(foundCategory.emoji || '');
        } else {
          setError('Category not found');
          setTimeout(() => router.push('/settings/category'), 2000);
        }
      } catch (err: any) {
        console.error('Failed to load category:', err);
        setError(err.error || 'Failed to load category');
        if (err.error?.includes('401') || err.error?.includes('Unauthorized')) {
          router.push('/splash');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadCategory();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (!category) return;

    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      router.push('/splash');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateCategory(session.lineUserId, id, {
        name: name.trim(),
        emoji: emoji.trim() || undefined,
      });
      
      router.push('/settings/category');
    } catch (err: any) {
      console.error('Failed to update category:', err);
      setError(err.error || 'Failed to update category');
      alert(err.error || 'Failed to update category. Please try again.');
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

  if (error || !category) {
    return (
      <SafeArea className="min-h-dvh bg-white dark:bg-black">
        <Container className="py-4">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error || 'Category not found'}</p>
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
              onClick={() => router.back()}
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
              Edit Category
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
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
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Optional: Add an emoji to represent this category
            </p>
          </div>

          {/* Preview */}
          {(name || emoji) && (
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Preview:
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center text-4xl">
                  {emoji || '📁'}
                </div>
                <span className="text-sm font-medium text-black dark:text-white">
                  {name || 'Category Name'}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
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

