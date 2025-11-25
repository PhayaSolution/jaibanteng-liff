'use client';

import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { createTag } from '@/app/lib/api';
import { getUserSession } from '@/app/utils/storage.util';
import { Folder, Hash, Plus, X, Check } from 'lucide-react';

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
    <div className="flex flex-wrap gap-2 items-center justify-center content-start">
      {/* Category Selector Button */}
      {categories.length > 0 && (
        <Popover
          open={categoryPopovers['category-selector'] || false}
          onOpenChange={(open) => handleCategoryPopoverChange('category-selector', open)}
        >
          <PopoverTrigger asChild>
            <button
              onClick={(e) => {
                if (selectedCategory) {
                  e.preventDefault();
                  onCategoryClick(null);
                }
              }}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border shrink-0
                ${
                  selectedCategory
                    ? 'bg-black text-white border-black hover:bg-neutral-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }
              `}
            >
              {selectedCategory ? (
                <>
                  <span className="max-w-[100px] truncate">{selectedCategory.name}</span>
                  <X className="w-3 h-3 ml-0.5 opacity-70" />
                </>
              ) : (
                <>
                  <Folder className="w-3 h-3" />
                  <span>Category</span>
                </>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] max-w-sm p-4 rounded-2xl border-0 shadow-xl bg-white" align="start" sideOffset={8}>
            <div className="max-h-[250px] overflow-y-auto">
              {categories.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs">
                  No categories available
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const parts = cat.name.split(' ');
                    const emoji = parts[0];
                    const name = parts.slice(1).join(' ');
                    
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory('category-selector', cat)}
                        className={`
                          flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200 border
                          ${
                            selectedCategory?.id === cat.id
                              ? 'bg-black text-white border-black'
                              : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'
                          }
                        `}
                      >
                        <span className="text-xl leading-none mb-0.5">{emoji || '📁'}</span>
                        <span className="text-[10px] font-medium truncate w-full text-center leading-tight">{name || cat.name}</span>
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
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors bg-black text-white hover:bg-neutral-800 group shrink-0"
        >
          <span className="max-w-[80px] truncate">{formatTagName(selectedTag.name)}</span>
          <X className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
        </button>
      ))}

      {/* Tag Selector Button */}
      <Popover
        open={tagPopovers['tag-selector'] || false}
        onOpenChange={(open) => handleTagPopoverChange('tag-selector', open)}
      >
        <PopoverTrigger asChild>
          <button
            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border shrink-0
                bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300
            `}
          >
            <Hash className="w-3 h-3" />
            <span>Tag</span>
          </button>
        </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] max-w-sm p-4 rounded-2xl border-0 shadow-xl bg-white" align="start" sideOffset={8}>
            <div className="max-h-[250px] flex flex-col">
              {/* Add New Tag Input */}
              <div className="mb-2 pb-2 border-b border-gray-100">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">#</span>
                      <input
                        type="text"
                        value={newTagName['tag-selector'] || ''}
                        onChange={(e) => setNewTagName((prev) => ({ ...prev, 'tag-selector': e.target.value }))}
                        onKeyPress={(e) => handleTagKeyPress(e, 'tag-selector')}
                        placeholder="New tag..."
                        className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-black text-xs focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-colors"
                      />
                    </div>
                  <button
                    onClick={() => handleAddTag('tag-selector')}
                    disabled={!newTagName['tag-selector']?.trim()}
                    className="px-2.5 py-1.5 rounded-lg bg-black text-white font-medium text-xs hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tags List */}
              <div className="flex-1 overflow-y-auto">
                {allTags.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-xs">
                    No tags available
                  </div>
                ) : (
                  <div className="space-y-1">
                    {allTags.map((t) => {
                      const isSelected = selectedTags.some((st) => st.id === t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTag('tag-selector', t)}
                          className={`
                            w-full px-3 py-2 rounded-lg font-medium transition-colors text-left flex items-center justify-between
                            ${
                              isSelected
                                ? 'bg-black text-white'
                                : 'bg-transparent text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <span className="text-xs">{t.name}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5" />
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
