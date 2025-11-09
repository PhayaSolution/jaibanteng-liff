'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import { getCategories, deleteCategory, type Category } from '@/app/utils/storage.util';

export default function CategoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      if (deleteCategory(id)) {
        setCategories(getCategories());
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/settings/category/edit/${id}`);
  };

  return (
    <SafeArea className="min-h-dvh bg-white dark:bg-black">
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
                Category
              </h1>
            </div>
            <button
              onClick={() => router.push('/settings/category/add')}
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
              placeholder="Search Categories"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="relative flex flex-col items-center justify-center gap-3 p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(category.id);
                  }}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Edit category"
                >
                  <svg
                    className="w-4 h-4 text-gray-600 dark:text-gray-400"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category.id, category.name);
                  }}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  aria-label="Delete category"
                >
                  <svg
                    className="w-4 h-4 text-red-600 dark:text-red-400"
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

              {/* Category Content */}
              <div className="w-12 h-12 flex items-center justify-center text-4xl">
                {category.emoji || '📁'}
              </div>
              <span className="text-sm font-medium text-black dark:text-white">
                {category.name}
              </span>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No categories found' : 'No categories yet. Add your first category!'}
            </p>
          </div>
        )}
      </Container>
    </SafeArea>
  );
}

