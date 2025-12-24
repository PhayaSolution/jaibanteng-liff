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
    <div className="flex flex-col gap-4">
      <div className="bg-foreground/5 p-2 rounded-[2rem]">
        <div className="grid grid-cols-3 gap-2">
          {numbers.map((row, rowIndex) =>
            row.map((value, colIndex) => {
              const isDelete = value === 'delete';

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleClick(value)}
                  className={`
                    relative
                    h-12 sm:h-16
                    rounded-2xl
                    text-xl sm:text-2xl font-black
                    transition-all duration-300
                    active:scale-95
                    flex items-center justify-center
                    ${
                      isDelete
                        ? 'text-destructive hover:bg-destructive/10'
                        : 'text-foreground hover:bg-foreground/10'
                    }
                  `}
                >
                  {isDelete ? (
                    <Delete className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3px]" />
                  ) : (
                    value
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        className="w-full py-3.5 sm:py-4 rounded-[1.5rem] bg-primary text-white font-bold text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 font-prompt"
      >
        <span>บันทึกเลย</span>
        <Check className="w-5 h-5 stroke-[3.5px]" />
      </button>
    </div>
  );
}
