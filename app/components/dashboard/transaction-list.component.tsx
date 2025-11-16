'use client';

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
}

export default function TransactionList({ groups, onTransactionClick }: TransactionListProps) {
  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          {/* Date header with separator line */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {group.date}
              </h3>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {group.total >= 0 ? '+' : ''}฿{Math.abs(group.total).toLocaleString()}
              </span>
            </div>
            {/* Separator line */}
            <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Transactions */}
          <div className="space-y-3">
            {group.transactions.map((transaction) => {
              const categoryEmoji = transaction.categoryEmoji || '📁';
              const categoryDisplay = transaction.categoryEmoji 
                ? `${categoryEmoji} ${transaction.category}`
                : transaction.category;
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
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400';
              
              return (
                <div
                  key={transaction.id}
                  onClick={() => onTransactionClick?.(transaction)}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                >
                  {/* Emoji Icon */}
                  <div className="flex-shrink-0 text-2xl">
                    {categoryEmoji}
                  </div>
                  
                  {/* Category and Tags */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-black dark:text-white mb-1">
                      {categoryDisplay}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {tagsDisplay}
                      </p>
                      {timeDisplay && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {timeDisplay}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Amount */}
                  <div className="flex-shrink-0 text-right">
                    <span className={`text-base font-bold ${amountColor}`}>
                      {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
                    </span>
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

