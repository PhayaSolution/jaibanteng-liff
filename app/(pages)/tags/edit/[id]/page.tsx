'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import { getTags, updateTag, type Tag } from '@/app/utils/storage.util';

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tag, setTag] = useState<Tag | null>(null);

  useEffect(() => {
    const tags = getTags();
    const foundTag = tags.find(t => t.id === id);
    
    if (foundTag) {
      setTag(foundTag);
      setName(foundTag.name);
    } else {
      alert('Tag not found');
      router.push('/tags');
    }
  }, [id, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a tag name');
      return;
    }

    if (!tag) return;

    setIsSubmitting(true);
    
    try {
      const updated = updateTag(id, {
        name: name.trim(),
      });
      
      if (updated) {
        router.push('/tags');
      } else {
        alert('Failed to update tag. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update tag:', error);
      alert('Failed to update tag. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tag) {
    return null;
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
              Edit Tag
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
              placeholder="Enter tag name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              required
            />
          </div>

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

