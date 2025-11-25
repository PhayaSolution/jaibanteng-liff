'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import { fetchCategories, updateCategory, deleteCategory } from '@/app/lib/api';
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
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      setError(err.error || 'Failed to delete category');
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
