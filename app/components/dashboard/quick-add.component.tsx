'use client';

import { useState, useEffect } from 'react';
import { Plus, History, Loader2, FastForward } from 'lucide-react';
import { TransactionShortcut } from '@/app/lib/api';
import { Transaction } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';

interface QuickAddProps {
  shortcuts: TransactionShortcut[];
  lastTransaction: Transaction | null;
  onSelect: (shortcut: {
    name: string;
    amount: number;
    categoryId: string | null;
    type: 'INCOME' | 'EXPENSE';
  }) => void;
  isLoading?: boolean;
}

export default function QuickAdd({ shortcuts, lastTransaction, onSelect, isLoading }: QuickAddProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="shrink-0 w-36 h-24 rounded-3xl bg-gray-100 dark:bg-zinc-900 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (shortcuts.length === 0 && !lastTransaction) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
          Quick Shortcuts
        </h3>
      </div>
      
      <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-1 px-1 no-scrollbar">
        {/* Repeat Last Item - Always first */}
        {lastTransaction && (
          <button
            onClick={() => onSelect({
              name: lastTransaction.name,
              amount: parseFloat(lastTransaction.amount),
              categoryId: lastTransaction.categoryId ?? null,
              type: lastTransaction.type as 'INCOME' | 'EXPENSE'
            })}
            className="shrink-0 group relative flex flex-col items-start justify-between w-[150px] h-[100px] p-4 rounded-[32px] bg-black dark:bg-white text-white dark:text-black shadow-xl shadow-gray-200/50 dark:shadow-none transition-all active:scale-95 overflow-hidden"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 rounded-full bg-white/20 dark:bg-black/5">
                  <History className="w-3 h-3" />
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60">Repeat</span>
              </div>
            </div>
            
            <div className="w-full text-left">
              <p className="text-[14px] font-bold truncate leading-none mb-1">
                {lastTransaction.name}
              </p>
              <p className="text-[18px] font-black tracking-tighter">
                ฿{parseFloat(lastTransaction.amount).toLocaleString()}
              </p>
            </div>

            {/* Subtle background icon */}
            <div className="absolute -right-2 -bottom-2 opacity-10 rotate-12">
               <span className="text-5xl">{lastTransaction.category?.emoji || '💰'}</span>
            </div>
          </button>
        )}

        {/* Regular Shortcuts */}
        {shortcuts.map((shortcut, index) => (
          <button
            key={index}
            onClick={() => onSelect({
              name: shortcut.name,
              amount: shortcut.amount,
              categoryId: shortcut.categoryId,
              type: shortcut.type
            })}
            className="shrink-0 flex flex-col items-start justify-between w-[150px] h-[100px] p-4 rounded-[32px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm transition-all active:scale-95"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-2xl">{shortcut.categoryEmoji}</span>
              <span className="text-[9px] font-bold text-gray-300 dark:text-zinc-600 uppercase tracking-widest">
                {shortcut.count}x
              </span>
            </div>

            <div className="w-full text-left">
              <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 truncate leading-none mb-1">
                {shortcut.name}
              </p>
              <p className="text-[18px] font-black text-gray-900 dark:text-white tracking-tighter">
                ฿{shortcut.amount.toLocaleString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
