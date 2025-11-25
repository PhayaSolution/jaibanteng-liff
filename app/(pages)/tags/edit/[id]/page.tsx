'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import { fetchTags, updateTag, deleteTag } from '@/app/lib/api';
import { Tag } from '@/app/lib/types';
import { getUserSession } from '@/app/utils/storage.util';

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tag, setTag] = useState<Tag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTag() {
      const session = getUserSession();
      if (!session?.lineUserId) {
        setError('Not authenticated');
        router.push('/splash');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const tags = await fetchTags(session.lineUserId);
        const foundTag = tags.find(t => t.id === id);
        
        if (foundTag) {
          setTag(foundTag);
          setName(foundTag.name);
        } else {
          setError('Tag not found');
          setTimeout(() => router.push('/tags'), 2000);
        }
      } catch (err: any) {
        console.error('Failed to load tag:', err);
        setError(err.error || 'Failed to load tag');
      } finally {
        setIsLoading(false);
      }
    }

    loadTag();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a tag name');
      return;
    }

    if (!tag) return;

    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      router.push('/splash');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateTag(session.lineUserId, id, {
        name: name.trim(),
      });
      
      router.push('/tags');
    } catch (err: any) {
      console.error('Failed to update tag:', err);
      setError(err.error || 'Failed to update tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!tag) return;
    
    if (!confirm(`Are you sure you want to delete "${tag.name}"? This action cannot be undone.`)) {
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
      await deleteTag(session.lineUserId, id);
      router.push('/tags');
    } catch (err: any) {
      console.error('Failed to delete tag:', err);
      setError(err.error || 'Failed to delete tag');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SettingsLayout title="Edit Tag">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto"></div>
        </div>
      </SettingsLayout>
    );
  }

  if (error || !tag) {
    return (
      <SettingsLayout title="Edit Tag">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error || 'Tag not found'}</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Edit Tag">
      <form onSubmit={handleSubmit}>
        <SettingsSection title="Tag Details">
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              required
            />
          </div>
        </SettingsSection>

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
            Delete Tag
          </button>
        </div>
      </form>
    </SettingsLayout>
  );
}
