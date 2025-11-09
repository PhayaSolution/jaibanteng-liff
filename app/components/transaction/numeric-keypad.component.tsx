'use client';

import { Check } from 'lucide-react';

interface NumericKeypadProps {
  onNumberClick: (value: string) => void;
  onDelete: () => void;
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
    ['.', '0', 'confirm'],
  ];

  const handleClick = (value: string) => {
    if (value === 'confirm') {
      onConfirm();
    } else {
      onNumberClick(value);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {numbers.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const isConfirm = value === 'confirm';

          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleClick(value)}
              className={`
                aspect-square rounded-full font-medium text-lg
                transition-colors flex items-center justify-center
                ${
                  isConfirm
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }
                active:scale-95
              `}
            >
              {isConfirm ? <Check className="w-6 h-6" /> : value}
            </button>
          );
        })
      )}
    </div>
  );
}

