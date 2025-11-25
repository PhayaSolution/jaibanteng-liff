'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

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
    <div className="space-y-6">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          {/* Date header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {group.date}
            </h3>
            <span className={`text-xs font-semibold ${
              group.total >= 0 
                ? 'text-emerald-600 dark:text-emerald-500' 
                : 'text-rose-600 dark:text-rose-500'
            }`}>
              {group.total >= 0 ? '+' : ''}฿{Math.abs(group.total).toLocaleString()}
            </span>
          </div>

          {/* Transactions */}
          <div>
            {group.transactions.map((transaction, index) => {
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
                ? 'text-emerald-600 dark:text-emerald-500' 
                : 'text-rose-600 dark:text-rose-500';
              
              const isLast = index === group.transactions.length - 1;

              return (
                <div
                  key={transaction.id}
                  className={`group relative flex items-center gap-4 py-3 px-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors duration-200 ${
                    !isLast ? 'border-b border-gray-100 dark:border-zinc-800' : ''
                  }`}
                >
                  {/* Emoji Icon */}
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center text-xl bg-gray-100 dark:bg-zinc-800 rounded-full">
                    {categoryEmoji}
                  </div>
                  
                  {/* Category and Tags */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onTransactionClick?.(transaction)}
                  >
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {transaction.category}
                      </p>
                      {timeDisplay && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                          {timeDisplay}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal truncate">
                      {tagsDisplay}
                    </p>
                  </div>
                  
                  {/* Amount and Delete button */}
                  <div className="shrink-0 flex items-center gap-3">
                    <span 
                      className={`text-sm font-semibold cursor-pointer ${amountColor}`}
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
                      className="p-2 text-gray-400 hover:text-rose-500 dark:text-gray-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Delete"
                    >
                      {loadingIds.has(transaction.id) ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <TrashIcon className="w-4 h-4" />
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

