'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

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
    <div className="space-y-8">
      {/* Bulk action button for entire period */}
      {onDoneAllForPeriod && selectedPeriod && groups.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleDoneAllForPeriod}
            disabled={loadingPeriod}
            className="px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingPeriod && (
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Done ทั้งหมด{selectedPeriod}
          </button>
        </div>
      )}

      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-5">
          {/* Date header */}
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-medium text-amber-700 dark:text-amber-600 uppercase tracking-wider">
              {group.date}
            </h3>
            <div className="flex items-center gap-4">
              <span className={`text-xs font-medium ${
                group.total >= 0 
                  ? 'text-emerald-700 dark:text-emerald-600' 
                  : 'text-rose-700 dark:text-rose-600'
              }`}>
                {group.total >= 0 ? '+' : ''}฿{Math.abs(group.total).toLocaleString()}
              </span>
              {/* Done all for this date button */}
              {onDoneAllForDate && (
                <button
                  onClick={() => handleDoneAllForDate(group.date)}
                  disabled={loadingDates.has(group.date)}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {loadingDates.has(group.date) && (
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Done ทั้งวัน
                </button>
              )}
            </div>
          </div>

          {/* Transactions with action buttons */}
          <div className="space-y-1">
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
              .map((transaction) => {
              const categoryEmoji = transaction.categoryEmoji || '📁';
              const tagsDisplay = transaction.tags && transaction.tags.length > 0
                ? transaction.tags.join(', ')
                : transaction.name;
              
              // Format time from date field (or createdAt if date has no time)
              let timeDisplay = '';
              if (transaction.date) {
                try {
                  const dateObj = new Date(transaction.date);
                  const timeFromDate = format(dateObj, 'HH:mm', { locale: th });
                  
                  // If date has no time (00:00), use createdAt instead
                  if (timeFromDate === '00:00' && transaction.createdAt) {
                    timeDisplay = format(new Date(transaction.createdAt), 'HH:mm', { locale: th });
                  } else {
                    timeDisplay = timeFromDate;
                  }
                } catch (e) {
                  console.error('Error formatting date time:', e, transaction.date);
                  // Fallback to createdAt if date parsing fails
                  if (transaction.createdAt) {
                    try {
                      timeDisplay = format(new Date(transaction.createdAt), 'HH:mm', { locale: th });
                    } catch (e2) {
                      console.error('Error formatting createdAt:', e2);
                    }
                  }
                }
              } else if (transaction.createdAt) {
                // Fallback to createdAt if no date
                try {
                  timeDisplay = format(new Date(transaction.createdAt), 'HH:mm', { locale: th });
                } catch (e) {
                  console.error('Error formatting createdAt:', e);
                }
              }
              
              const amountColor = transaction.type === 'income' 
                ? 'text-emerald-700 dark:text-emerald-600' 
                : 'text-rose-700 dark:text-rose-600';
              
              // Show Done button if status is 'active' (not done)
              const showDone = transaction.status === 'active' || !transaction.status;
              // Show Active button if status is 'done' (can change back to active)
              const showBack = transaction.status === 'done';
              // Show strikethrough if status is 'done'
              const isDone = transaction.status === 'done';

              return (
                <div
                  key={transaction.id}
                  className={`group flex items-center gap-4 py-3 px-2 border-b border-amber-100 dark:border-amber-900/30 transition-colors duration-200 ${
                    isDone 
                      ? 'opacity-50' 
                      : 'hover:bg-amber-50/30 dark:hover:bg-amber-950/20'
                  }`}
                >
                  {/* Emoji Icon */}
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center text-xl bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    {categoryEmoji}
                  </div>
                  
                  {/* Category and Tags */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className={`text-sm font-normal text-stone-800 dark:text-stone-200 ${isDone ? 'line-through decoration-1 decoration-stone-400' : ''}`}>
                        {transaction.category}
                      </p>
                      {timeDisplay && (
                        <span className={`text-xs text-amber-600 dark:text-amber-500 font-normal ${isDone ? 'line-through decoration-1 decoration-stone-400' : ''}`}>
                          {timeDisplay}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs text-stone-600 dark:text-stone-400 font-normal ${isDone ? 'line-through decoration-1 decoration-stone-400' : ''}`}>
                      {tagsDisplay}
                    </p>
                  </div>
                  
                  {/* Amount and Action buttons */}
                  <div className="shrink-0 flex items-center gap-4">
                    <span className={`text-sm font-medium ${isDone ? 'line-through decoration-1 decoration-stone-400' : ''} ${amountColor}`}>
                      {transaction.type === 'income' ? '+' : ''}฿{transaction.amount.toLocaleString()}
                    </span>
                    {showDone && (
                      <button
                        onClick={() => handleDone(transaction)}
                        disabled={loadingIds.has(transaction.id)}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 min-w-[60px] justify-center"
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
                        className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 min-w-[60px] justify-center"
                      >
                        {loadingIds.has(transaction.id) ? (
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          'Active'
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

