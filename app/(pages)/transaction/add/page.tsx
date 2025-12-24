'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function AddTransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [type, setType] = useState<TransactionType>(
    (searchParams.get('type')?.toLowerCase() as TransactionType) || 'expense'
  );
  const [amount, setAmount] = useState(searchParams.get('amount') || '0');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; type: 'category' | 'tag' } | null>(null);
  const [selectedTags, setSelectedTags] = useState<{ id: string; name: string; type: 'category' | 'tag' }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial params
  const initialCategoryId = searchParams.get('categoryId');
  const initialName = searchParams.get('name');

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
          fetchCategories(session.lineUserId, type === 'income' ? 'INCOME' : 'EXPENSE'),
          fetchTags(session.lineUserId),
        ]);

        setCategories(categoriesData);
        setTags(tagsData);

        // Pre-fill category if provided in URL
        if (initialCategoryId) {
          const found = categoriesData.find(c => c.id === initialCategoryId);
          if (found) {
            setSelectedCategory({
              id: found.id,
              name: `${found.emoji || '📁'} ${found.name}`,
              type: 'category'
            });
          }
        }
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
  }, [router, type, initialCategoryId]);

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
        name: initialName || selectedCategory?.name || 'Transaction',
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
    <SafeArea className="h-dvh max-h-dvh bg-background dark:bg-zinc-950 flex flex-col overflow-hidden text-foreground">
      <Container className="flex flex-col h-full p-0 sm:p-0 md:p-0 relative">
        
        {/* 1. Header Section - Premium glass feel */}
        <div className="px-6 pt-4 pb-1 flex items-center justify-between shrink-0 z-10">
          <button
            onClick={() => router.back()}
            className="p-3.5 -ml-2 hover:text-primary bg-white dark:bg-zinc-900 shadow-xl shadow-black/5 rounded-2xl transition-all active:scale-90"
          >
            <svg
              className="w-5 h-5 text-current"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          
          <div className="flex glass p-1.5 rounded-full shadow-xl shadow-black/5 border-white/20">
            <button
              onClick={() => {
                setType('income');
                setSelectedCategory(null);
              }}
              className={`
                px-6 py-2 rounded-full text-xs font-black transition-all duration-300 font-prompt uppercase tracking-wider
                ${
                  type === 'income'
                    ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                    : 'text-foreground/30 hover:text-foreground/50'
                }
              `}
            >
              รายรับ
            </button>
            <button
              onClick={() => {
                setType('expense');
                setSelectedCategory(null);
              }}
              className={`
                px-6 py-2 rounded-full text-xs font-black transition-all duration-300 font-prompt uppercase tracking-wider
                ${
                  type === 'expense'
                    ? 'bg-destructive text-white shadow-lg shadow-destructive/20'
                    : 'text-foreground/30 hover:text-foreground/50'
                }
              `}
            >
              รายจ่าย
            </button>
          </div>
          
          <div className="w-10"></div>
        </div>

        {/* 2. Main Content - Amount display */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 py-2">
          
          <div className="mb-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto py-3 px-6 rounded-2xl glass text-foreground font-bold text-sm border-white/20 hover:bg-white transition-all shadow-xl shadow-black/5"
                >
                  <CalendarIcon className="w-4.5 h-4.5 mr-2 text-primary" />
                  <span className="font-prompt">
                    {date ? format(date, 'd MMMM yyyy') : 'เลือกวันที่ครับ'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-[2rem] bg-white dark:bg-zinc-950" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setOpen(false);
                  }}
                  initialFocus
                  className="rounded-[2rem] p-6 [--cell-size:2.8rem]"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col items-center relative w-full animate-fade-in-up">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl sm:text-8xl font-black text-foreground tracking-tighter leading-none animate-text-glow">
                {amount}
              </span>
            </div>
            <span className="text-[9px] text-foreground/20 font-black tracking-[0.3em] mt-1 font-prompt uppercase">
              บาท / THB
            </span>
            {initialName && (
              <span className="mt-2 px-3 py-1 rounded-xl bg-foreground/5 text-[9px] font-bold text-foreground/40 font-prompt">
                {initialName}
              </span>
            )}
          </div>
        </div>

        {/* 3. Bottom Controls - Floating glass panel */}
        <div className="px-5 pb-5 pt-4 shrink-0 glass shadow-2xl border-t-white/30 rounded-t-[2rem] animate-fade-in-up">
          
          <div className="w-full min-h-[36px] mb-3">
             {isLoading ? (
              <div className="flex items-center justify-center py-1">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center text-destructive text-[10px] py-1 font-prompt font-bold">{error}</div>
            ) : (
              <div className="flex justify-center -mx-5 px-5">
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

export default function AddTransactionPage() {
  return (
    <Suspense fallback={
      <div className="h-dvh w-full flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <AddTransactionForm />
    </Suspense>
  );
}
