'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Tag as TagIcon } from 'lucide-react';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import SettingsListItem from '@/app/components/settings/settings-list-item.component';
import { fetchTags } from '@/app/lib/api';
import { Tag } from '@/app/lib/types';
import { getUserSession } from '@/app/utils/storage.util';

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTags() {
      const session = getUserSession();
      if (!session?.lineUserId) {
        setError('Not authenticated');
        router.push('/splash');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchTags(session.lineUserId);
        setTags(data);
      } catch (err: any) {
        console.error('Failed to load tags:', err);
        setError(err.error || 'Failed to load tags');
      } finally {
        setIsLoading(false);
      }
    }

    loadTags();
  }, [router]);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string) => {
    router.push(`/tags/edit/${id}`);
  };

  const AddButton = (
    <button
      onClick={() => router.push('/tags/add')}
      className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
      aria-label="Add Tag"
    >
      <Plus className="w-5 h-5" />
    </button>
  );

  return (
    <SettingsLayout 
      title="Tags" 
      actionButton={AddButton}
    >
      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
      </div>

      {/* Tags List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="text-center py-12">
          <TagIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No tags found' : 'No tags yet'}
          </p>
        </div>
      ) : (
        <SettingsSection title={`${filteredTags.length} Tags`}>
          {filteredTags.map((tag) => (
            <SettingsListItem
              key={tag.id}
              title={tag.name}
              icon={<TagIcon className="w-5 h-5" />}
              onClick={() => handleEdit(tag.id)}
            />
          ))}
        </SettingsSection>
      )}
    </SettingsLayout>
  );
}
