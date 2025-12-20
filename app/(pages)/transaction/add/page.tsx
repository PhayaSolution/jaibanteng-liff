'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import NumericKeypad from '@/app/components/transaction/numeric-keypad.component';
import CategoryTags from '@/app/components/transaction/category-tags.component';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { fetchCategories, fetchTags, createTransaction } from '@/app/lib/api';
import { Category, Tag } from '@/app/lib/types';
import { getUserSession } from '@/app/utils/storage.util';

type TransactionType = 'income' | 'expense';

export default function AddTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('0');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; type: 'category' | 'tag' } | null>(null);
  const [selectedTags, setSelectedTags] = useState<{ id: string; name: string; type: 'category' | 'tag' }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const session = getUserSession();
      if (!session?.lineUserId) {
        setError('Not authenticated');
        router.push('/splash');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [categoriesData, tagsData] = await Promise.all([
          fetchCategories(session.lineUserId, type.toUpperCase() as any),
          fetchTags(session.lineUserId),
        ]);

        setCategories(categoriesData);
        setTags(tagsData);
      } catch (err) {
        console.error('Failed to load categories/tags:', err);
        const errorObj = err as { error?: string };
        setError(errorObj.error || 'Failed to load data');
        if (errorObj.error?.includes('401') || errorObj.error?.includes('Unauthorized')) {
          router.push('/splash');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router, type]);

  const handleNumberClick = (value: string) => {
    if (value === '.') {
      if (!amount.includes('.')) {
        setAmount(amount + '.');
      }
    } else {
      if (amount === '0.00' || amount === '0') {
        setAmount(value === '.' ? '0.' : value);
      } else {
        if (amount.replace('.', '').length < 9) {
          setAmount(amount + value);
        }
      }
    }
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleCategoryClick = (category: { id: string; name: string; type: 'category' | 'tag' } | null) => {
    setSelectedCategory(category);
  };

  const handleTagClick = (tag: { id: string; name: string; type: 'category' | 'tag' }) => {
    setSelectedTags((prev) => {
      const exists = prev.find((t) => t.id === tag.id);
      if (exists) {
        return prev.filter((t) => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleTagRemove = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handleConfirm = async () => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      router.push('/splash');
      return;
    }

    if (!date) {
      alert('Please select a date');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createTransaction(session.lineUserId, {
        type: type.toUpperCase() as 'INCOME' | 'EXPENSE',
        amount: amountNum,
        date: date.toISOString(),
        name: selectedCategory?.name || 'Transaction',
        categoryId: selectedCategory?.id || null,
        tagIds: selectedTags.map(t => t.id),
        status: 'ACTIVE',
      });

      router.back();
    } catch (err) {
      console.error('Failed to create transaction:', err);
      const errorObj = err as { error?: string };
      const errorMessage = errorObj.error || 'Failed to create transaction';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeArea className="h-dvh max-h-dvh bg-white flex flex-col overflow-hidden">
      <Container className="flex flex-col h-full p-0 sm:p-0 md:p-0 relative">
        
        {/* 1. Header Section (Fixed Top) */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0 z-10">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-black hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          
          <div className="flex bg-gray-100/80 p-1 rounded-full backdrop-blur-sm">
            <button
              onClick={() => {
                setType('income');
                setSelectedCategory(null);
              }}
              className={`
                px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${
                  type === 'income'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              Income
            </button>
            <button
              onClick={() => {
                setType('expense');
                setSelectedCategory(null);
              }}
              className={`
                px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${
                  type === 'expense'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              Expense
            </button>
          </div>
          
          {/* Placeholder for balance to keep center alignment of toggle */}
          <div className="w-10"></div>
        </div>

        {/* 2. Main Content (Centered Amount) */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-8">
          
          {/* Date Trigger - Floating above amount */}
          <div className="mb-8">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto py-2 px-4 rounded-full bg-gray-50 text-black font-medium text-sm border border-transparent hover:border-gray-200 hover:bg-gray-100 transition-all shadow-sm"
                >
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span>
                    {date ? format(date, 'd MMMM yyyy') : 'Select date'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-xl rounded-xl bg-transparent" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setOpen(false);
                  }}
                  initialFocus
                  className="rounded-xl border bg-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Hero Amount */}
          <div className="flex flex-col items-center relative w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-baseline gap-1">
              <span className="text-6xl sm:text-7xl font-bold text-black tracking-tighter leading-none">
                {amount}
              </span>
            </div>
            <span className="text-sm text-gray-400 font-medium mt-2">THB</span>
          </div>
        </div>

        {/* 3. Bottom Controls (Category + Keypad) */}
        <div className="px-4 pb-6 pt-2 shrink-0 bg-white flex flex-col gap-5 z-10 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] border-t border-gray-50/50">
          
          {/* Category Tags Area */}
          <div className="w-full min-h-[44px]">
             {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 text-xs py-2">{error}</div>
            ) : (
              <div className="flex justify-center">
                <CategoryTags
                  categories={categories.map(cat => ({ id: cat.id, name: `${cat.emoji || '📁'} ${cat.name}`, type: 'category' as const }))}
                  tags={tags.map(tag => ({ id: tag.id, name: `#${tag.name}`, type: 'tag' as const }))}
                  selectedCategory={selectedCategory}
                  selectedTags={selectedTags}
                  onCategoryClick={handleCategoryClick}
                  onTagClick={handleTagClick}
                  onTagRemove={handleTagRemove}
                />
              </div>
            )}
          </div>

          {/* Keypad */}
          <NumericKeypad
            onNumberClick={handleNumberClick}
            onDelete={handleDelete}
            onConfirm={handleConfirm}
          />
        </div>

      </Container>
    </SafeArea>
  );
}
