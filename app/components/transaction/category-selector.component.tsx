'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { getCategories, type Category } from '@/app/utils/storage.util';

interface CategorySelectorProps {
  selectedCategoryId?: string;
  onCategorySelect: (category: Category) => void;
  type?: 'INCOME' | 'EXPENSE';
}

export default function CategorySelector({
  selectedCategoryId,
  onCategorySelect,
  type,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [allCategories] = useState<Category[]>(() => {
    if (typeof window === 'undefined') return [];
    return getCategories();
  });

  const filteredCategories = type 
    ? allCategories.filter(cat => cat.type === type)
    : allCategories;

  const selectedCategory = allCategories.find(cat => cat.id === selectedCategoryId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`
            px-3 py-1.5 rounded-lg font-medium transition-colors
            ${
              selectedCategoryId
                ? 'bg-black text-white'
                : 'bg-black text-white'
            }
          `}
        >
          <span className="text-sm">
            {selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.name}` : 'Select category'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-3rem)] max-w-sm p-3" align="start">
        <div className="max-h-[300px] overflow-y-auto">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No {type?.toLowerCase() || ''} categories available
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategorySelect(category);
                    setOpen(false);
                  }}
                  className={`
                    flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-colors shadow-none
                    ${
                      selectedCategoryId === category.id
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-2xl">{category.emoji || '📁'}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

