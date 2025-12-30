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
    
    if (!confirm('Do you want to delete this item?')) return;
    
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
        <div key={groupIndex} className="glass rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden border-white/20 animate-fade-in-up" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
          {/* Date header */}
          <div className="flex items-center justify-between px-6 py-4 bg-foreground/5 border-b border-foreground/5">
            <h3 className="text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt">
              {group.date}
            </h3>
            <span className={`text-sm font-black ${
              group.total >= 0 
                ? 'text-secondary' 
                : 'text-destructive'
            }`}>
              {group.total >= 0 ? '+' : ''}{Math.abs(group.total).toLocaleString()} บ.
            </span>
          </div>

          {/* Transactions */}
          <div className="divide-y divide-foreground/5">
            {group.transactions.map((transaction, index) => {
              const categoryEmoji = transaction.categoryEmoji || '📁';
              
              // Format time
              let timeDisplay = '';
              if (transaction.date) {
                try {
                  const dateObj = new Date(transaction.date);
                  timeDisplay = format(dateObj, 'HH:mm', { locale: enUS });
                  if (timeDisplay === '00:00' && transaction.createdAt) {
                    timeDisplay = format(new Date(transaction.createdAt), 'HH:mm', { locale: enUS });
                  }
                } catch (e) {
                  if (transaction.createdAt) {
                    timeDisplay = format(new Date(transaction.createdAt), 'HH:mm', { locale: enUS });
                  }
                }
              }
              
              const amountColor = transaction.type === 'income' 
                ? 'text-secondary' 
                : 'text-destructive';
              
              const isLast = index === group.transactions.length - 1;
              const hasTags = transaction.tags && transaction.tags.length > 0;

              return (
                <div
                  key={transaction.id}
                  className="group relative flex items-start gap-4 py-4 px-6 hover:bg-foreground/5 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                  onClick={() => onTransactionClick?.(transaction)}
                >
                  {/* Emoji Icon */}
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center text-2xl bg-foreground/5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {categoryEmoji}
                  </div>
                  
                  {/* Category, Name, and Tags */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className="text-sm font-bold text-foreground font-prompt">
                        {transaction.category}
                      </p>
                      {timeDisplay && (
                        <span className="text-[10px] text-foreground/30 font-bold uppercase">
                          {timeDisplay}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground/40 font-medium truncate font-prompt mb-1.5">
                      {transaction.name}
                    </p>
                    {/* Tags at the bottom */}
                    {hasTags && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {transaction.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-foreground/5 text-foreground/50 rounded-lg border border-foreground/10 font-prompt"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Amount and Delete button */}
                  <div className="shrink-0 flex items-center gap-4">
                    <span className={`text-sm font-black ${amountColor}`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} บ.
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(transaction);
                      }}
                      disabled={loadingIds.has(transaction.id)}
                      className="p-2.5 text-foreground/10 hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all disabled:opacity-50"
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

