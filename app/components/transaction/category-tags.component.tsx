'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { getCategories, getTags, addTag, type Category, type Tag } from '@/app/utils/storage.util';

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
  
  const [allCategories] = useState<Category[]>(() => {
    if (typeof window === 'undefined') return [];
    return getCategories();
  });
  
  const [allTags, setAllTags] = useState<Tag[]>(() => {
    if (typeof window === 'undefined') return [];
    return getTags();
  });

  const handleCategoryPopoverChange = (categoryId: string, open: boolean) => {
    setCategoryPopovers((prev) => ({ ...prev, [categoryId]: open }));
  };

  const handleTagPopoverChange = (tagId: string, open: boolean) => {
    if (open) {
      setAllTags(getTags());
    }
    setTagPopovers((prev) => ({ ...prev, [tagId]: open }));
  };

  const handleSelectCategory = (categoryId: string, category: Category) => {
    const categoryTag = { id: category.id, name: `${category.emoji} ${category.name}`, type: 'category' as const };
    // Toggle: if clicking the same category, clear it
    if (selectedCategory?.id === category.id) {
      onCategoryClick(null);
    } else {
      onCategoryClick(categoryTag);
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

  const handleSelectTag = (tagId: string, tag: Tag) => {
    const formattedName = formatTagName(tag.name);
    onTagClick({ id: tag.id, name: formattedName, type: 'tag' });
    // Don't close popover when selecting tags (allow multiple selections)
  };

  const handleAddTag = (tagId: string) => {
    const tagName = newTagName[tagId]?.trim();
    if (tagName) {
      // Normalize tag name (remove # if user added it, we'll add it back when displaying)
      const normalizedName = normalizeTagName(tagName);
      const newTag = addTag({ name: normalizedName });
      setAllTags(getTags());
      setNewTagName((prev) => ({ ...prev, [tagId]: '' }));
      const formattedName = formatTagName(newTag.name);
      onTagClick({ id: newTag.id, name: formattedName, type: 'tag' });
      // Don't close popover when adding tags (allow multiple selections)
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, tagId: string) => {
    if (e.key === 'Enter') {
      handleAddTag(tagId);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {/* Category Buttons */}
      {categories.map((category) => {
        const displayName = selectedCategory ? selectedCategory.name : category.name;
        return (
          <Popover
            key={category.id}
            open={categoryPopovers[category.id] || false}
            onOpenChange={(open) => handleCategoryPopoverChange(category.id, open)}
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
                <span className="text-sm">{displayName}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-3rem)] max-w-sm p-3 shadow-none border-none" align="start">
              <div className="max-h-[300px] overflow-y-auto">
                {allCategories.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No categories available
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {allCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(category.id, cat)}
                        className={`
                          flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-colors focus:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none!
                          ${
                            selectedCategory?.id === cat.id
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                          }
                        `}
                      >
                        <span className="text-2xl">{cat.emoji || '📁'}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}

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

      {/* Tag Selector Button */}
      {tags.map((tag) => (
        <Popover
          key={tag.id}
          open={tagPopovers[tag.id] || false}
          onOpenChange={(open) => handleTagPopoverChange(tag.id, open)}
        >
          <PopoverTrigger asChild>
            <button
              className="category-tag-selector px-3 py-1.5 rounded-lg font-medium transition-colors bg-black text-white focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none!"
            >
              <span className="text-sm">{tag.name}</span>
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
                        value={newTagName[tag.id] || ''}
                        onChange={(e) => setNewTagName((prev) => ({ ...prev, [tag.id]: e.target.value }))}
                        onKeyPress={(e) => handleTagKeyPress(e, tag.id)}
                        placeholder="Add new tag..."
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  <button
                    onClick={() => handleAddTag(tag.id)}
                    disabled={!newTagName[tag.id]?.trim()}
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
                      const displayName = formatTagName(t.name);
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTag(tag.id, t)}
                          className={`
                            w-full px-4 py-3 rounded-lg font-medium transition-colors text-left flex items-center justify-between focus:outline-none focus:ring-0 active:outline-none active:ring-0
                            ${
                              isSelected
                                ? 'bg-black text-white'
                                : 'bg-white text-black'
                            }
                          `}
                        >
                          <span className="text-sm">{displayName}</span>
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
      ))}
    </div>
  );
}

