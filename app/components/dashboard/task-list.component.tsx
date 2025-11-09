'use client';

const emojiMap = {
  pet: '🐶',
  coffee: '☕',
  food: '🥙',
  oil: '🛢️',
};

interface Transaction {
  id: string;
  category: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  icon?: 'pet' | 'coffee' | 'food' | 'oil';
  status?: 'done' | 'back';
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
}

export default function TaskList({ groups, onDone, onBack }: TaskListProps) {
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

          {/* Transactions with action buttons */}
          <div className="space-y-3">
            {[...group.transactions]
              .sort((a, b) => {
                // แยก transactions ที่มี back status ไปไว้ล่างสุด
                const aIsBack = a.status === 'back';
                const bIsBack = b.status === 'back';
                
                if (aIsBack && !bIsBack) return 1; // a ไปล่าง
                if (!aIsBack && bIsBack) return -1; // b ไปล่าง
                
                // ถ้าทั้งคู่เป็น back หรือไม่ใช่ back ให้ sort ตาม text
                const aText = `${a.category} ${a.name}`.toLowerCase();
                const bText = `${b.category} ${b.name}`.toLowerCase();
                
                return aText.localeCompare(bText);
              })
              .map((transaction) => {
              const emoji = transaction.icon ? emojiMap[transaction.icon] : '🥙';
              const showDone = transaction.status === 'done' || !transaction.status;
              const showBack = transaction.status === 'back';

              return (
                <div
                  key={transaction.id}
                  className={`flex items-center gap-3 py-2 ${showBack ? 'opacity-60' : ''}`}
                >
                  {/* Emoji Icon */}
                  <div className="flex-shrink-0 text-2xl">
                    {emoji}
                  </div>
                  
                  {/* Category and Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-bold text-black dark:text-white ${showBack ? 'line-through' : ''}`}>
                      {transaction.category}
                    </p>
                    <p className={`text-sm text-gray-500 dark:text-gray-400 ${showBack ? 'line-through' : ''}`}>
                      {transaction.name}
                    </p>
                  </div>
                  
                  {/* Amount */}
                  <div className="flex-shrink-0">
                    <span className={`text-base font-bold text-black dark:text-white ${showBack ? 'line-through' : ''}`}>
                      ฿{transaction.amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex-shrink-0 flex gap-2 ml-2">
                    {showDone && (
                      <button
                        onClick={() => onDone?.(transaction)}
                        className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        Done
                      </button>
                    )}
                    {showBack && (
                      <button
                        onClick={() => onBack?.(transaction)}
                        className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                      >
                        Back
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

