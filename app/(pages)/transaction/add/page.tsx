'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Delete, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
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
          fetchCategories(session.lineUserId),
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
  }, [router]);

  const handleNumberClick = (value: string) => {
    if (value === '.') {
      if (!amount.includes('.')) {
        setAmount(amount + '.');
      }
    } else {
      if (amount === '0.00' || amount === '0') {
        setAmount(value === '.' ? '0.' : value);
      } else {
        setAmount(amount + value);
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
        // Remove if already selected
        return prev.filter((t) => t.id !== tag.id);
      } else {
        // Add if not selected
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
    <SafeArea className="min-h-dvh bg-white flex flex-col">
      <Container className="flex-1 flex flex-col px-6 pt-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 p-2 text-black hover:bg-gray-100 rounded transition-colors self-start"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Transaction Type Toggles */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setType('income')}
            className={`
              flex-1 py-3 rounded-lg font-medium transition-colors border text-base
              ${
                type === 'income'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300'
              }
            `}
          >
            รายรับ
          </button>
          <button
            onClick={() => setType('expense')}
            className={`
              flex-1 py-3 rounded-lg font-medium transition-colors border text-base
              ${
                type === 'expense'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300'
              }
            `}
          >
            รายจ่าย
          </button>
        </div>

        {/* Date Input Field */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between px-4 py-3 mb-5 border border-black rounded-lg bg-white text-black font-normal text-base h-auto"
            >
              <span className="flex-1 text-left">
                {date ? format(date, 'dd/MM/yyyy') : 'Select date'}
              </span>
              <CalendarIcon className="w-5 h-5 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                setOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Amount Display */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-4xl font-bold text-black">
            ฿{amount}
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-black hover:bg-gray-100 rounded transition-colors"
          >
            <Delete className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Category Tags */}
        <div className="flex-1 flex flex-col justify-start gap-1">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">กำลังโหลด...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <CategoryTags
              categories={categories.map(cat => ({ id: cat.id, name: `${cat.emoji || '📁'} ${cat.name}`, type: 'category' as const }))}
              tags={tags.map(tag => ({ id: tag.id, name: `#${tag.name}`, type: 'tag' as const }))}
              selectedCategory={selectedCategory}
              selectedTags={selectedTags}
              onCategoryClick={handleCategoryClick}
              onTagClick={handleTagClick}
              onTagRemove={handleTagRemove}
            />
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="mt-auto pb-8 pt-6">
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

