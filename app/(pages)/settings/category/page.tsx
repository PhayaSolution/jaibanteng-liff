'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Folder } from 'lucide-react';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import SettingsListItem from '@/app/components/settings/settings-list-item.component';
import { fetchCategories } from '@/app/lib/api';
import { Category } from '@/app/lib/types';
import { getUserSession } from '@/app/utils/storage.util';

export default function CategoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      const session = getUserSession();
      if (!session?.lineUserId) {
        setError('Not authenticated');
        router.push('/splash');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchCategories(session.lineUserId);
        setCategories(data);
      } catch (err: unknown) {
        console.error('Failed to load categories:', err);
        const message =
          typeof err === 'object' && err !== null && 'error' in err
            ? (err as { error?: string }).error ?? 'Failed to load categories'
            : 'Failed to load categories';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, [router]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string) => {
    router.push(`/settings/category/edit/${id}`);
  };

  const AddButton = (
    <button
      onClick={() => router.push('/settings/category/add')}
      className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
      aria-label="Add Category"
    >
      <Plus className="w-5 h-5" />
    </button>
  );

  return (
    <SettingsLayout 
      title="Categories" 
      actionButton={AddButton}
      backUrl="/settings"
    >
      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
      </div>

      {/* Categories List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No categories found' : 'No categories yet'}
          </p>
        </div>
      ) : (
        <SettingsSection title={`${filteredCategories.length} Categories`}>
          {filteredCategories.map((category) => (
            <SettingsListItem
              key={category.id}
              title={category.name}
              icon={
                <span className="text-xl w-6 h-6 flex items-center justify-center">
                  {category.emoji || '📁'}
                </span>
              }
              onClick={() => handleEdit(category.id)}
            />
          ))}
        </SettingsSection>
      )}
    </SettingsLayout>
  );
}
