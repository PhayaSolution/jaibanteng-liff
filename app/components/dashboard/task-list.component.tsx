'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

import { TrashIcon } from '@/app/components/icons';

interface Transaction {
  id: string;
  category: string;
  categoryEmoji?: string | null;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  tags?: string[];
  createdAt?: string;
  date?: string;
  status?: 'done' | 'active';
}

interface TransactionGroup {
  date: string;
  total: number;
  transactions: Transaction[];
}

interface TaskListProps {
  groups: TransactionGroup[];
  onDone?: (transaction: Transaction) => void;
  onBack?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onDoneAllForDate?: (date: string) => void;
  onDoneAllForPeriod?: () => void;
  selectedPeriod?: string;
}

export default function TaskList({ 
  groups, 
  onDone, 
  onBack, 
  onDelete,
  onDoneAllForDate,
  onDoneAllForPeriod,
  selectedPeriod
}: TaskListProps) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());
  const [loadingPeriod, setLoadingPeriod] = useState(false);

  const handleDone = async (transaction: Transaction) => {
    if (loadingIds.has(transaction.id)) return;
    
    setLoadingIds(prev => new Set(prev).add(transaction.id));
    try {
      await onDone?.(transaction);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(transaction.id);
        return next;
      });
    }
  };

  const handleBack = async (transaction: Transaction) => {
    if (loadingIds.has(transaction.id)) return;
    
    setLoadingIds(prev => new Set(prev).add(transaction.id));
    try {
      await onBack?.(transaction);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(transaction.id);
        return next;
      });
    }
  };

  const handleDoneAllForDate = async (date: string) => {
    if (loadingDates.has(date)) return;
    
    setLoadingDates(prev => new Set(prev).add(date));
    try {
      await onDoneAllForDate?.(date);
    } finally {
      setLoadingDates(prev => {
        const next = new Set(prev);
        next.delete(date);
        return next;
      });
    }
  };

  const handleDoneAllForPeriod = async () => {
    if (loadingPeriod) return;
    
    setLoadingPeriod(true);
    try {
      await onDoneAllForPeriod?.();
    } finally {
      setLoadingPeriod(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Bulk action button for entire period */}
      {onDoneAllForPeriod && selectedPeriod && groups.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleDoneAllForPeriod}
            disabled={loadingPeriod}
            className="px-4 py-2 text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm shadow-emerald-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingPeriod && (
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Done All {selectedPeriod}
          </button>
        </div>
      )}

      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          {/* Date header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {group.date}
            </h3>
            <div className="flex items-center gap-4">
              <span className={`text-xs font-semibold ${
                group.total >= 0 
                  ? 'text-emerald-600 dark:text-emerald-500' 
                  : 'text-rose-600 dark:text-rose-500'
              }`}>
                {group.total >= 0 ? '+' : ''}฿{Math.abs(group.total).toLocaleString()}
              </span>
              {/* Done all for this date button */}
              {onDoneAllForDate && (
                <button
                  onClick={() => handleDoneAllForDate(group.date)}
                  disabled={loadingDates.has(group.date)}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {loadingDates.has(group.date) && (
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Mark as Done
                </button>
              )}
            </div>
          </div>

          {/* Transactions with action buttons */}
          <div>
            {[...group.transactions]
              .sort((a, b) => {
                // แยก transactions ที่มี done status ไปไว้ล่างสุด
                const aIsDone = a.status === 'done';
                const bIsDone = b.status === 'done';
                
                if (aIsDone && !bIsDone) return 1; // a ไปล่าง
                if (!aIsDone && bIsDone) return -1; // b ไปล่าง
                
                // ถ้าทั้งคู่เป็น done หรือไม่ใช่ done ให้ sort ตาม text
                const aText = `${a.category} ${a.name}`.toLowerCase();
                const bText = `${b.category} ${b.name}`.toLowerCase();
                
                return aText.localeCompare(bText);
              })
              .map((transaction, index, array) => {
              const categoryEmoji = transaction.categoryEmoji || '📁';
              const tagsDisplay = transaction.tags && transaction.tags.length > 0
                ? transaction.tags.join(', ')
                : transaction.name;
              
              // Format time from date field (or createdAt if date has no time)
              let timeDisplay = '';
              if (transaction.date) {
                try {
                  const dateObj = new Date(transaction.date);
                  const timeFromDate = format(dateObj, 'HH:mm', { locale: enUS });
                  
                  // If date has no time (00:00), use createdAt instead
                  if (timeFromDate === '00:00' && transaction.createdAt) {
                    timeDisplay = format(new Date(transaction.createdAt), 'HH:mm', { locale: enUS });
                  } else {
                    timeDisplay = timeFromDate;
                  }
                } catch (e) {
                  console.error('Error formatting date time:', e, transaction.date);
                  // Fallback to createdAt if date parsing fails
                  if (transaction.createdAt) {
                    try {
                      timeDisplay = format(new Date(transaction.createdAt), 'HH:mm', { locale: enUS });
                    } catch (e2) {
                      console.error('Error formatting createdAt:', e2);
                    }
                  }
                }
              } else if (transaction.createdAt) {
                // Fallback to createdAt if no date
                try {
                  timeDisplay = format(new Date(transaction.createdAt), 'HH:mm', { locale: enUS });
                } catch (e) {
                  console.error('Error formatting createdAt:', e);
                }
              }
              
              const amountColor = transaction.type === 'income' 
                ? 'text-emerald-600 dark:text-emerald-500' 
                : 'text-rose-600 dark:text-rose-500';
              
              // Show Done button if status is 'active' (not done)
              const showDone = transaction.status === 'active' || !transaction.status;
              // Show Active button if status is 'done' (can change back to active)
              const showBack = transaction.status === 'done';
              // Show strikethrough if status is 'done'
              const isDone = transaction.status === 'done';
              const isLast = index === array.length - 1;

              return (
                <div
                  key={transaction.id}
                  className={`group relative flex items-center gap-4 py-3 px-4 transition-colors duration-200 ${
                    isDone 
                      ? 'bg-gray-50/50 dark:bg-zinc-900/50 opacity-60' 
                      : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                  } ${!isLast ? 'border-b border-gray-100 dark:border-zinc-800' : ''}`}
                >
                  {/* Emoji Icon */}
                  <div className={`shrink-0 w-10 h-10 flex items-center justify-center text-xl rounded-full ${
                    isDone ? 'bg-gray-100 dark:bg-zinc-800 grayscale' : 'bg-gray-100 dark:bg-zinc-800'
                  }`}>
                    {categoryEmoji}
                  </div>
                  
                  {/* Category and Tags */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className={`text-sm font-medium ${
                        isDone 
                          ? 'text-gray-400 dark:text-gray-600 line-through' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {transaction.category}
                      </p>
                      {timeDisplay && (
                        <span className={`text-xs ${
                          isDone 
                            ? 'text-gray-400 dark:text-gray-600' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {timeDisplay}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${
                      isDone 
                        ? 'text-gray-300 dark:text-gray-700 line-through' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {tagsDisplay}
                    </p>
                  </div>
                  
                  {/* Amount and Action buttons */}
                  <div className="shrink-0 flex items-center gap-3">
                    <span className={`text-sm font-semibold ${
                      isDone 
                        ? 'text-gray-400 dark:text-gray-600 line-through' 
                        : amountColor
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}฿{transaction.amount.toLocaleString()}
                    </span>
                    {showDone && (
                      <button
                        onClick={() => handleDone(transaction)}
                        disabled={loadingIds.has(transaction.id)}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 min-w-[60px] justify-center"
                      >
                        {loadingIds.has(transaction.id) ? (
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          'Done'
                        )}
                      </button>
                    )}
                    {showBack && (
                      <button
                        onClick={() => handleBack(transaction)}
                        disabled={loadingIds.has(transaction.id)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 min-w-[60px] justify-center"
                      >
                        {loadingIds.has(transaction.id) ? (
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          'Undo'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

