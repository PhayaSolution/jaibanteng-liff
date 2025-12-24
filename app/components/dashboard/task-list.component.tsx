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
            className="px-6 py-3 text-xs font-bold text-white bg-primary hover:brightness-105 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 font-prompt"
          >
            {loadingPeriod && (
              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            จัดการให้หมดเลย ({selectedPeriod})
          </button>
        </div>
      )}

      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="glass rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden border-white/20 animate-fade-in-up" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
          {/* Date header */}
          <div className="flex items-center justify-between px-6 py-4 bg-foreground/5 border-b border-foreground/5">
            <h3 className="text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt">
              {group.date}
            </h3>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-black ${
                group.total >= 0 
                  ? 'text-secondary' 
                  : 'text-destructive'
              }`}>
                {group.total >= 0 ? '+' : ''}{Math.abs(group.total).toLocaleString()} บ.
              </span>
              {/* Done all for this date button */}
              {onDoneAllForDate && (
                <button
                  onClick={() => handleDoneAllForDate(group.date)}
                  disabled={loadingDates.has(group.date)}
                  className="px-4 py-2 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 font-prompt"
                >
                  {loadingDates.has(group.date) && (
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  เสร็จแล้วจ้า
                </button>
              )}
            </div>
          </div>

          {/* Transactions with action buttons */}
          <div className="divide-y divide-foreground/5">
            {[...group.transactions]
              .sort((a, b) => {
                const aIsDone = a.status === 'done';
                const bIsDone = b.status === 'done';
                if (aIsDone && !bIsDone) return 1;
                if (!aIsDone && bIsDone) return -1;
                return 0;
              })
              .map((transaction, index, array) => {
              const categoryEmoji = transaction.categoryEmoji || '📁';
              const tagsDisplay = transaction.tags && transaction.tags.length > 0
                ? transaction.tags.join(', ')
                : transaction.name;
              
              // Format time
              let timeDisplay = '';
              if (transaction.date) {
                try {
                  const dateObj = new Date(transaction.date);
                  timeDisplay = format(dateObj, 'HH:mm', { locale: enUS });
                } catch (e) {}
              }
              
              const amountColor = transaction.type === 'income' 
                ? 'text-secondary' 
                : 'text-destructive';
              
              const showDone = transaction.status === 'active' || !transaction.status;
              const showBack = transaction.status === 'done';
              const isDone = transaction.status === 'done';
              const isLast = index === array.length - 1;

              return (
                <div
                  key={transaction.id}
                  className={`group relative flex items-center gap-4 py-4 px-6 transition-all duration-300 ${
                    isDone 
                      ? 'bg-foreground/5 opacity-40 grayscale' 
                      : 'hover:bg-foreground/5'
                  }`}
                >
                  {/* Emoji Icon */}
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center text-2xl bg-foreground/5 rounded-2xl">
                    {categoryEmoji}
                  </div>
                  
                  {/* Category and Tags */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className={`text-sm font-bold font-prompt ${
                        isDone ? 'line-through' : 'text-foreground'
                      }`}>
                        {transaction.category}
                      </p>
                      {timeDisplay && (
                        <span className="text-[10px] text-foreground/30 font-bold">
                          {timeDisplay}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground/40 font-medium truncate font-prompt">
                      {tagsDisplay}
                    </p>
                  </div>
                  
                  {/* Amount and Action buttons */}
                  <div className="shrink-0 flex items-center gap-4">
                    <span className={`text-sm font-black ${
                      isDone ? 'line-through text-foreground/20' : amountColor
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}{transaction.amount.toLocaleString()} บ.
                    </span>
                    {showDone && (
                      <button
                        onClick={() => handleDone(transaction)}
                        disabled={loadingIds.has(transaction.id)}
                        className="px-5 py-2.5 text-xs font-bold text-white bg-primary rounded-2xl hover:brightness-105 shadow-lg shadow-primary/20 transition-all active:scale-[0.95] disabled:opacity-50 min-w-[75px] font-prompt"
                      >
                        {loadingIds.has(transaction.id) ? (
                          <svg className="animate-spin h-3.5 w-3.5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          'เสร็จแล้ว'
                        )}
                      </button>
                    )}
                    {showBack && (
                      <button
                        onClick={() => handleBack(transaction)}
                        disabled={loadingIds.has(transaction.id)}
                        className="px-5 py-2.5 text-xs font-bold text-foreground/40 bg-foreground/5 border border-foreground/5 rounded-2xl hover:bg-foreground/10 transition-all active:scale-[0.95] disabled:opacity-50 min-w-[75px] font-prompt"
                      >
                        {loadingIds.has(transaction.id) ? (
                          <svg className="animate-spin h-3.5 w-3.5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          'แก้แป๊บ'
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

