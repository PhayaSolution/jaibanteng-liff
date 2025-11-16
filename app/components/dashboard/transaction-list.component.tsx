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
}

interface TransactionGroup {
  date: string;
  total: number;
  transactions: Transaction[];
}

interface TransactionListProps {
  groups: TransactionGroup[];
  onTransactionClick?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export default function TransactionList({ groups, onTransactionClick, onDelete }: TransactionListProps) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (transaction: Transaction) => {
    if (loadingIds.has(transaction.id)) return;
    
    if (!confirm('คุณต้องการลบรายการนี้หรือไม่?')) return;
    
    setLoadingIds(prev => new Set(prev).add(transaction.id));
    try {
      await onDelete?.(transaction);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(transaction.id);
        return next;
      });
    }
  };
  return (
    <div className="space-y-8">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-5">
          {/* Date header */}
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-medium text-amber-700 dark:text-amber-600 uppercase tracking-wider">
              {group.date}
            </h3>
            <span className={`text-xs font-medium ${
              group.total >= 0 
                ? 'text-emerald-700 dark:text-emerald-600' 
                : 'text-rose-700 dark:text-rose-600'
            }`}>
              {group.total >= 0 ? '+' : ''}฿{Math.abs(group.total).toLocaleString()}
            </span>
          </div>

          {/* Transactions */}
          <div className="space-y-1">
            {group.transactions.map((transaction) => {
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
              
              return (
                <div
                  key={transaction.id}
                  className="group flex items-center gap-4 py-3 px-2 border-b border-amber-100 dark:border-amber-900/30 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors duration-200"
                >
                  {/* Emoji Icon */}
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center text-xl bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    {categoryEmoji}
                  </div>
                  
                  {/* Category and Tags */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onTransactionClick?.(transaction)}
                  >
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className="text-sm font-normal text-stone-800 dark:text-stone-200">
                        {transaction.category}
                      </p>
                      {timeDisplay && (
                        <span className="text-xs text-amber-600 dark:text-amber-500 font-normal">
                          {timeDisplay}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-normal">
                      {tagsDisplay}
                    </p>
                  </div>
                  
                  {/* Amount and Delete button */}
                  <div className="shrink-0 flex items-center gap-4">
                    <span 
                      className={`text-sm font-medium cursor-pointer ${amountColor}`}
                      onClick={() => onTransactionClick?.(transaction)}
                    >
                      {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(transaction);
                      }}
                      disabled={loadingIds.has(transaction.id)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 min-w-[50px] justify-center"
                    >
                      {loadingIds.has(transaction.id) ? (
                        <>
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="sr-only">กำลังลบ...</span>
                        </>
                      ) : (
                        'ลบ'
                      )}
                    </button>
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

