'use client';

import { Check, Delete } from 'lucide-react';

interface NumericKeypadProps {
  onNumberClick: (value: string) => void;
  onDelete?: () => void;
  onConfirm: () => void;
}

export default function NumericKeypad({
  onNumberClick,
  onDelete,
  onConfirm,
}: NumericKeypadProps) {
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'delete'],
  ];

  const handleClick = (value: string) => {
    if (value === 'delete') {
      onDelete?.();
    } else {
      onNumberClick(value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-gray-50 p-1.5 rounded-2xl">
        <div className="grid grid-cols-3 gap-1.5">
          {numbers.map((row, rowIndex) =>
            row.map((value, colIndex) => {
              const isDelete = value === 'delete';

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleClick(value)}
                  className={`
                    relative
                    h-12 sm:h-14
                    rounded-xl
                    text-xl font-semibold
                    transition-all duration-200
                    active:scale-95
                    flex items-center justify-center
                    ${
                      isDelete
                        ? 'bg-gray-200/50 text-black hover:bg-gray-200'
                        : 'bg-white text-black shadow-sm border border-gray-100 hover:bg-gray-50'
                    }
                  `}
                >
                  {isDelete ? (
                    <Delete className="w-5 h-5" />
                  ) : (
                    value
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Confirm Button - Full Width Bottom */}
      <button
        onClick={onConfirm}
        className="w-full py-3 rounded-xl bg-black text-white font-semibold text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <span>บันทึก</span>
        <Check className="w-4 h-4" />
      </button>
    </div>
  );
}
