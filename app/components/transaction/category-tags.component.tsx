'use client';

import { useState, useEffect } from 'react';
import { createTag } from '@/app/lib/api';
import { getUserSession } from '@/app/utils/storage.util';
import { createPortal } from 'react-dom';
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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [newTagNameStr, setNewTagNameStr] = useState('');
  const [allTags, setAllTags] = useState<CategoryTag[]>(tags);
  const [tagSearch, setTagSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Update allTags when tags prop changes
  useEffect(() => {
    setAllTags(tags);
  }, [tags]);

  const handleSelectCategory = (category: CategoryTag) => {
    // Toggle: if clicking the same category, clear it
    if (selectedCategory?.id === category.id) {
      onCategoryClick(null);
    } else {
      onCategoryClick(category);
    }
    setIsCategoryOpen(false);
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

  const handleSelectTag = (tag: CategoryTag) => {
    onTagClick(tag);
  };

  const handleAddTag = async () => {
    const tagName = newTagNameStr.trim();
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
        setNewTagNameStr('');
        onTagClick(newTagItem);
      } catch (err) {
        console.error('Failed to create tag:', err);
        alert('Failed to create tag');
      }
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const filteredTags = allTags.filter(t => 
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="flex flex-wrap gap-2.5 items-center justify-center content-start">
      {/* Category Selector Button */}
      {categories.length > 0 && (
        <>
          <button
            onClick={(e) => {
              if (selectedCategory) {
                e.preventDefault();
                onCategoryClick(null);
              } else {
                setIsCategoryOpen(true);
              }
            }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border-none shrink-0 font-prompt
              ${
                selectedCategory
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                  : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10'
              }
            `}
          >
            {selectedCategory ? (
              <>
                <span className="max-w-[120px] truncate">{selectedCategory.name}</span>
                <X className="w-3.5 h-3.5 ml-0.5 opacity-70 stroke-[3px]" />
              </>
            ) : (
              <>
                <Folder className="w-3.5 h-3.5" />
                <span>หมวดหมู่</span>
              </>
            )}
          </button>

          {/* Full Screen Category Selector Overlay */}
          {isCategoryOpen && mounted && createPortal(
            <div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
              {/* Header */}
              <div className="px-6 pt-16 pb-6 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] font-prompt">เลือกหมวดหมู่</h4>
                  <p className="text-2xl font-black text-foreground font-prompt mt-1">เลือกหมวดหมู่</p>
                </div>
                <button 
                  onClick={() => setIsCategoryOpen(false)}
                  className="p-3 bg-foreground/5 rounded-2xl text-foreground/40 hover:text-foreground transition-all active:scale-90"
                >
                  <X className="w-6 h-6 stroke-[3px]" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
                {categories.length === 0 ? (
                  <div className="text-center py-20 text-foreground/20 text-sm font-prompt">
                    ยังไม่ได้สร้างหมวดหมู่เลยครับ
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {categories.map((cat) => {
                      const parts = cat.name.split(' ');
                      const emoji = parts[0];
                      const name = parts.slice(1).join(' ');
                      
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat)}
                          className={`
                            flex flex-col items-center justify-center gap-3 p-5 rounded-[2.5rem] transition-all duration-300 border-none
                            ${
                              selectedCategory?.id === cat.id
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                                : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10'
                            }
                          `}
                        >
                          <span className="text-4xl leading-none">{emoji || '📁'}</span>
                          <span className="text-[10px] font-black truncate w-full text-center leading-tight font-prompt">{name || cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Bottom Action */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-zinc-950 via-white/80 to-transparent">
                <button 
                  onClick={() => setIsCategoryOpen(false)}
                  className="w-full py-4 rounded-[2rem] bg-foreground text-background font-black text-sm font-prompt shadow-2xl transition-all active:scale-95"
                >
                  ตกลง
                </button>
              </div>
            </div>,
            document.body
          )}
        </>
      )}

      {/* Selected Tags Display */}
      {selectedTags.map((selectedTag) => (
        <button
          key={selectedTag.id}
          onClick={() => onTagRemove?.(selectedTag.id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-105 group shrink-0 font-prompt"
        >
          <span className="max-w-[100px] truncate">{formatTagName(selectedTag.name)}</span>
          <X className="w-3 h-3 opacity-60 group-hover:opacity-100 stroke-[3px]" />
        </button>
      ))}

      {/* Tag Selector Button */}
      <button
        onClick={() => setIsTagOpen(true)}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border-none shrink-0 font-prompt
            bg-foreground/5 text-foreground/40 hover:bg-foreground/10
        `}
      >
        <Hash className="w-3.5 h-3.5" />
        <span>แท็ก</span>
      </button>

      {/* Full Screen Tag Selector Overlay */}
      {isTagOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="px-6 pt-16 pb-6 flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] font-prompt">จัดการแท็ก</h4>
              <p className="text-2xl font-black text-foreground font-prompt mt-1">แท็กประจำรายการ</p>
            </div>
            <button 
              onClick={() => setIsTagOpen(false)}
              className="p-3 bg-foreground/5 rounded-2xl text-foreground/40 hover:text-foreground transition-all active:scale-90"
            >
              <X className="w-6 h-6 stroke-[3px]" />
            </button>
          </div>

          {/* Search/Add Input */}
          <div className="px-6 mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary text-xl font-black">#</span>
                <input
                  type="text"
                  value={newTagNameStr || tagSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewTagNameStr(val);
                    setTagSearch(val);
                  }}
                  onKeyPress={handleTagKeyPress}
                  placeholder="ค้นหา หรือ เพิ่มแท็กใหม่..."
                  className="w-full pl-10 pr-6 py-5 rounded-[2rem] border-none bg-foreground/5 text-foreground text-sm font-bold font-prompt focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <button
                onClick={handleAddTag}
                disabled={!newTagNameStr?.trim()}
                className="px-8 rounded-[2rem] bg-primary text-white shadow-xl shadow-primary/20 hover:brightness-105 transition-all disabled:opacity-30 flex items-center justify-center active:scale-95"
              >
                <Plus className="w-6 h-6 stroke-[3px]" />
              </button>
            </div>
          </div>

          {/* Tags Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
            {filteredTags.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-foreground/20 text-sm font-prompt">ไม่พบแท็กที่ค้นหาครับ</p>
                {newTagNameStr.trim() && (
                  <button 
                    onClick={handleAddTag}
                    className="mt-4 text-primary font-black text-sm font-prompt flex items-center justify-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    เพิ่มแท็ก "{newTagNameStr}"
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredTags.map((t) => {
                  const isSelected = selectedTags.some((st) => st.id === t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTag(t)}
                      className={`
                        px-6 py-5 rounded-[1.5rem] font-bold transition-all duration-300 text-left flex items-center justify-between font-prompt
                        ${
                          isSelected
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                            : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10'
                        }
                      `}
                    >
                      <span className="text-sm truncate mr-2">{t.name}</span>
                      {isSelected && (
                        <Check className="w-5 h-5 stroke-[3px]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="p-6 bg-gradient-to-t from-white dark:from-zinc-950 via-white/80 to-transparent">
            <button 
              onClick={() => setIsTagOpen(false)}
              className="w-full py-4 rounded-[2rem] bg-foreground text-background font-black text-sm font-prompt shadow-2xl transition-all active:scale-95"
            >
              ตกลง
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
