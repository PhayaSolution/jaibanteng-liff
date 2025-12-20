'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import { fetchCategories, updateCategory, deleteCategory } from '@/app/lib/api';
import { Category, TransactionType } from '@/app/lib/types';
import { EmojiPicker } from '@/app/components/ui/emoji-picker';
import { getUserSession } from '@/app/utils/storage.util';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (typeof err === 'object' && err !== null && 'error' in err) {
      return (err as { error?: string }).error ?? fallback;
    }
    return fallback;
  };

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
          setType(foundCategory.type);
        } else {
          setError('Category not found');
          setTimeout(() => router.push('/settings/category'), 2000);
        }
      } catch (err: unknown) {
        console.error('Failed to load category:', err);
        setError(getErrorMessage(err, 'Failed to load category'));
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
        type,
        emoji: emoji.trim() || undefined,
      });
      
      router.push('/settings/category');
    } catch (err: unknown) {
      console.error('Failed to update category:', err);
      setError(getErrorMessage(err, 'Failed to update category'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      router.push('/splash');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await deleteCategory(session.lineUserId, id);
      router.push('/settings/category');
    } catch (err: unknown) {
      console.error('Failed to delete category:', err);
      setError(getErrorMessage(err, 'Failed to delete category'));
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SettingsLayout title="Edit Category">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto"></div>
        </div>
      </SettingsLayout>
    );
  }

  if (error || !category) {
    return (
      <SettingsLayout title="Edit Category">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error || 'Category not found'}</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Edit Category">
      <form onSubmit={handleSubmit}>
        <SettingsSection title="Category Details">
          <div className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-3">
                Type
              </label>
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    type === 'EXPENSE'
                      ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    type === 'INCOME'
                      ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Income
                </button>
              </div>
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

        <div className="space-y-4 mt-8">
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full py-4 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="w-full py-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Category
          </button>
        </div>
      </form>
    </SettingsLayout>
  );
}
