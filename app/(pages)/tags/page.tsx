'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import { fetchTags, deleteTag } from '@/app/lib/api';
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
        if (err.error?.includes('401') || err.error?.includes('Unauthorized')) {
          router.push('/splash');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadTags();
  }, [router]);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTag = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      router.push('/splash');
      return;
    }

    try {
      await deleteTag(session.lineUserId, id);
      // Reload tags
      const data = await fetchTags(session.lineUserId);
      setTags(data);
    } catch (err: any) {
      console.error('Failed to delete tag:', err);
      alert(err.error || 'Failed to delete tag');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/tags/edit/${id}`);
  };

  return (
    <SafeArea className="min-h-screen min-h-dvh bg-white dark:bg-black">
      <Container className="py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
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
                Tags
              </h1>
            </div>
            <button
              onClick={() => router.push('/tags/add')}
              className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-80 transition-opacity"
            >
              Add
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tags"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Tags List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">กำลังโหลด...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <span className="text-sm font-medium text-black dark:text-white">
                {tag.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(tag.id)}
                  className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  aria-label="Edit tag"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id, tag.name)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete tag"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredTags.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No tags found' : 'No tags yet. Add your first tag!'}
            </p>
          </div>
        )}
      </Container>
    </SafeArea>
  );
}

