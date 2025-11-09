'use client';

interface Transaction {
  id: string;
  category: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  icon?: 'pet' | 'coffee' | 'food' | 'oil';
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

const emojiMap = {
  pet: '🐶',
  coffee: '☕',
  food: '🥙',
  oil: '🛢️',
};

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
              const emoji = transaction.icon ? emojiMap[transaction.icon] : '🥙';
              return (
                <div
                  key={transaction.id}
                  onClick={() => onTransactionClick?.(transaction)}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                >
                  {/* Emoji Icon */}
                  <div className="flex-shrink-0 text-2xl">
                    {emoji}
                  </div>
                  
                  {/* Category and Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-black dark:text-white">
                      {transaction.category}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.name}
                    </p>
                  </div>
                  
                  {/* Amount */}
                  <div className="flex-shrink-0">
                    <span className="text-base font-bold text-black dark:text-white">
                      ฿{transaction.amount.toLocaleString()}
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

