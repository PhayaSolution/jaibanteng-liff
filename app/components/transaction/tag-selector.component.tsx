'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { getTags, addTag, type Tag } from '@/app/utils/storage.util';

interface TagSelectorProps {
  selectedTagId?: string;
  onTagSelect: (tag: Tag) => void;
}

export default function TagSelector({
  selectedTagId,
  onTagSelect,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>(() => {
    if (typeof window === 'undefined') return [];
    return getTags();
  });

  // Refresh tags when popup opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setAllTags(getTags());
    }
    setOpen(isOpen);
  };

  const selectedTag = allTags.find(tag => tag.id === selectedTagId);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag = addTag({ name: newTagName.trim() });
      setAllTags(getTags());
      setNewTagName('');
      onTagSelect(newTag);
      setOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={`
            px-3 py-1.5 rounded-lg font-medium transition-colors
            ${
              selectedTagId
                ? 'bg-black text-white'
                : 'bg-black text-white'
            }
          `}
        >
          <span className="text-sm">
            {selectedTag ? selectedTag.name : 'Select tag'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-3rem)] max-w-sm p-3" align="start">
        <div className="max-h-[300px] flex flex-col">
          {/* Add New Tag Input */}
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add new tag..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
                className="px-4 py-2 rounded-lg bg-black text-white font-medium text-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tags List */}
          <div className="flex-1 overflow-y-auto">
            {allTags.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No tags available
              </div>
            ) : (
              <div className="space-y-2">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      onTagSelect(tag);
                      setOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 rounded-lg font-medium transition-colors text-left
                      ${
                        selectedTagId === tag.id
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-black hover:bg-gray-200'
                      }
                    `}
                  >
                    <span className="text-sm">{tag.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

