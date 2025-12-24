'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import { createCategory } from '@/app/lib/api';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TransactionType } from '@/app/lib/types';
import { EmojiPicker } from '@/app/components/ui/emoji-picker';
import { getUserSession } from '@/app/utils/storage.util';

export default function AddCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [budget, setBudget] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
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
        type,
        emoji: emoji.trim() || undefined,
        budget: budget ? parseFloat(budget) : undefined,
      });
      
      router.push('/settings/category');
    } catch (err: unknown) {
      console.error('Failed to add category:', err);
      const message =
        typeof err === 'object' && err !== null && 'error' in err
          ? (err as { error?: string }).error ?? 'Failed to add category'
          : 'Failed to add category';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsLayout title="Add Category" backUrl="/settings/category">
      <form onSubmit={handleSubmit}>
        <SettingsSection title="Category Details">
          <div className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-3">
                Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    type === 'EXPENSE'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 shadow-sm'
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-full ${type === 'EXPENSE' ? 'bg-red-100 dark:bg-red-900/50' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold">Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    type === 'INCOME'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-full ${type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold">Income</span>
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

            {/* Budget Field */}
            {type === 'EXPENSE' && (
              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-black dark:text-white mb-2"
                >
                  Monthly Budget
                </label>
                <div className="relative">
                  <input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                  <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400 font-medium">
                    บ.
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Optional: Set a monthly budget goal for this category
                </p>
              </div>
            )}
          </div>
        </SettingsSection>

        {/* Preview */}
        {(name || emoji) && (
          <SettingsSection title="Appearance Preview">
            <div className="flex justify-center p-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 relative overflow-hidden group">
              {/* Decorative background elements */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-colors ${type === 'INCOME' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <div className={`absolute -left-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-colors ${type === 'INCOME' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              
              <div className="relative flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shadow-xl transition-all group-hover:scale-110 ${
                  type === 'INCOME' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {emoji || '📁'}
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black dark:text-white">
                    {name || 'Category Name'}
                  </div>
                  <div className={`text-xs font-semibold uppercase tracking-widest mt-1 ${
                    type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {type}
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-black/10 dark:shadow-white/5"
        >
          {isSubmitting ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </SettingsLayout>
  );
}
