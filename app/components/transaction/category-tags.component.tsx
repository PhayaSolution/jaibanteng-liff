'use client';

import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { createTag } from '@/app/lib/api';
import { getUserSession } from '@/app/utils/storage.util';

interface CategoryTag {
  id: string;
  name: string;
  type: 'category' | 'tag';
}

interface CategoryTagsProps {
  categories: CategoryTag[];
  tags: CategoryTag[];
  selectedCategory?: CategoryTag | null;
  selectedTags?: CategoryTag[];
  onCategoryClick: (category: CategoryTag | null) => void;
  onTagClick: (tag: CategoryTag) => void;
  onTagRemove?: (tagId: string) => void;
}

export default function CategoryTags({
  categories,
  tags,
  selectedCategory,
  selectedTags = [],
  onCategoryClick,
  onTagClick,
  onTagRemove,
}: CategoryTagsProps) {
  const [categoryPopovers, setCategoryPopovers] = useState<Record<string, boolean>>({});
  const [tagPopovers, setTagPopovers] = useState<Record<string, boolean>>({});
  const [newTagName, setNewTagName] = useState<Record<string, string>>({});
  const [allTags, setAllTags] = useState<CategoryTag[]>(tags);
  
  // Update allTags when tags prop changes
  useEffect(() => {
    setAllTags(tags);
  }, [tags]);

  const handleCategoryPopoverChange = (categoryId: string, open: boolean) => {
    setCategoryPopovers((prev) => ({ ...prev, [categoryId]: open }));
  };

  const handleTagPopoverChange = (tagId: string, open: boolean) => {
    setTagPopovers((prev) => ({ ...prev, [tagId]: open }));
  };

  const handleSelectCategory = (categoryId: string, category: CategoryTag) => {
    // Toggle: if clicking the same category, clear it
    if (selectedCategory?.id === category.id) {
      onCategoryClick(null);
    } else {
      onCategoryClick(category);
    }
    handleCategoryPopoverChange(categoryId, false);
  };

  // Helper function to format tag name with #
  const formatTagName = (name: string): string => {
    if (!name) return name;
    return name.startsWith('#') ? name : `#${name}`;
  };

  // Helper function to normalize tag name (remove # if exists for storage)
  const normalizeTagName = (name: string): string => {
    if (!name) return name;
    return name.startsWith('#') ? name.substring(1) : name;
  };

  const handleSelectTag = (tagId: string, tag: CategoryTag) => {
    onTagClick(tag);
    // Don't close popover when selecting tags (allow multiple selections)
  };

  const handleAddTag = async (tagId: string) => {
    const tagName = newTagName[tagId]?.trim();
    if (tagName) {
      const session = getUserSession();
      if (!session?.lineUserId) {
        alert('Not authenticated');
        return;
      }

      try {
        // Normalize tag name (remove # if user added it, we'll add it back when displaying)
        const normalizedName = normalizeTagName(tagName);
        const newTag = await createTag(session.lineUserId, { name: normalizedName });
        const formattedName = formatTagName(newTag.name);
        const newTagItem: CategoryTag = { id: newTag.id, name: formattedName, type: 'tag' };
        
        // Add to local state
        setAllTags((prev) => [...prev, newTagItem]);
        setNewTagName((prev) => ({ ...prev, [tagId]: '' }));
        onTagClick(newTagItem);
        // Don't close popover when adding tags (allow multiple selections)
      } catch (err) {
        console.error('Failed to create tag:', err);
        alert('Failed to create tag');
      }
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, tagId: string) => {
    if (e.key === 'Enter') {
      handleAddTag(tagId);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {/* Category Selector Button - Single button */}
      {categories.length > 0 && (
        <Popover
          open={categoryPopovers['category-selector'] || false}
          onOpenChange={(open) => handleCategoryPopoverChange('category-selector', open)}
        >
          <PopoverTrigger asChild>
            <button
              onClick={(e) => {
                // If category is selected, clicking the button directly clears it
                if (selectedCategory) {
                  e.preventDefault();
                  onCategoryClick(null);
                }
              }}
              className={`
                category-tag-selector px-3 py-1.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none!
                ${
                  selectedCategory
                    ? 'bg-black text-white'
                    : 'bg-black text-white'
                }
              `}
            >
              <span className="text-sm">
                {selectedCategory ? selectedCategory.name : 'Select category'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-3rem)] max-w-sm p-3 shadow-none border-none" align="start">
            <div className="max-h-[300px] overflow-y-auto">
              {categories.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No categories available
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    // Extract emoji and name from the formatted string (e.g., "☕ Beverage")
                    const parts = cat.name.split(' ');
                    const emoji = parts[0];
                    const name = parts.slice(1).join(' ');
                    
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory('category-selector', cat)}
                        className={`
                          flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-colors focus:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none!
                          ${
                            selectedCategory?.id === cat.id
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                          }
                        `}
                      >
                        <span className="text-2xl">{emoji || '📁'}</span>
                        <span className="text-sm font-medium">{name || cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Selected Tags Display */}
      {selectedTags.map((selectedTag) => (
        <button
          key={selectedTag.id}
          onClick={() => onTagRemove?.(selectedTag.id)}
          className="px-3 py-1.5 rounded-lg font-medium transition-colors bg-black text-white shadow-none!"
        >
          <span className="text-sm">{formatTagName(selectedTag.name)}</span>
        </button>
      ))}

      {/* Tag Selector Button - Single button (always show to allow adding new tags) */}
      <Popover
        open={tagPopovers['tag-selector'] || false}
        onOpenChange={(open) => handleTagPopoverChange('tag-selector', open)}
      >
        <PopoverTrigger asChild>
          <button
            className="category-tag-selector px-3 py-1.5 rounded-lg font-medium transition-colors bg-black text-white focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none!"
          >
            <span className="text-sm">Select tag</span>
          </button>
        </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-3rem)] max-w-sm p-3 shadow-none border-none" align="start">
            <div className="max-h-[300px] flex flex-col">
              {/* Add New Tag Input */}
              <div className="mb-3 pb-3 border-b border-gray-200">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">#</span>
                      <input
                        type="text"
                        value={newTagName['tag-selector'] || ''}
                        onChange={(e) => setNewTagName((prev) => ({ ...prev, 'tag-selector': e.target.value }))}
                        onKeyPress={(e) => handleTagKeyPress(e, 'tag-selector')}
                        placeholder="Add new tag..."
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  <button
                    onClick={() => handleAddTag('tag-selector')}
                    disabled={!newTagName['tag-selector']?.trim()}
                    className="px-4 py-2 rounded-lg bg-black text-white font-medium text-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-none!"
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
                    {allTags.map((t) => {
                      const isSelected = selectedTags.some((st) => st.id === t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTag('tag-selector', t)}
                          className={`
                            w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center justify-between focus:outline-none focus:ring-0 active:outline-none active:ring-0
                            ${
                              isSelected
                                ? 'bg-black text-white'
                                : 'bg-white text-black'
                            }
                          `}
                        >
                          <span className="text-sm">{t.name}</span>
                          {isSelected && (
                            <span className="text-sm">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
    </div>
  );
}

