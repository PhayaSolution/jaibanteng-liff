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
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt">
          ทางลัดความไว
        </h3>
      </div>
      
      <div className="flex items-center gap-4 overflow-x-auto pb-8 -mx-4 px-4 no-scrollbar">
        {/* Repeat Last Item - Always first */}
        {lastTransaction && (
          <button
            onClick={() => onSelect({
              name: lastTransaction.name,
              amount: parseFloat(lastTransaction.amount),
              categoryId: lastTransaction.categoryId ?? null,
              type: lastTransaction.type as 'INCOME' | 'EXPENSE'
            })}
            className="shrink-0 group relative flex flex-col items-start justify-between w-[150px] h-[120px] p-5 rounded-[2.5rem] bg-primary text-white shadow-xl shadow-primary/20 transition-all active:scale-95 overflow-hidden"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-white/20">
                  <History className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase opacity-70 font-prompt">ล่าสุด</span>
              </div>
            </div>
            
            <div className="w-full text-left relative z-10 space-y-0.5">
              <p className="text-[11px] font-bold truncate opacity-60 font-prompt">
                {lastTransaction.name}
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-[22px] font-black tracking-tighter leading-none">
                  {parseFloat(lastTransaction.amount).toLocaleString('en-US')}
                </p>
                <span className="text-[10px] font-bold opacity-60 font-prompt">บ.</span>
              </div>
            </div>

            {/* Subtle background emoji */}
            <div className="absolute -right-3 -bottom-3 opacity-20 rotate-12 transition-transform group-hover:scale-125 duration-500 pointer-events-none">
               <span className="text-6xl">{lastTransaction.category?.emoji || '💰'}</span>
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
            className="shrink-0 group relative flex flex-col items-start justify-between w-[150px] h-[120px] p-5 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-white dark:border-white/5 shadow-xl shadow-black/5 transition-all active:scale-95 overflow-hidden"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-foreground/5 transition-colors group-hover:bg-primary/10">
                  <FastForward className="w-3.5 h-3.5 text-foreground/30 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[10px] font-black text-foreground/20 uppercase tracking-tighter">
                  x{shortcut.count}
                </span>
              </div>
            </div>

            <div className="w-full text-left relative z-10 space-y-0.5">
              <p className="text-[11px] font-bold text-foreground/40 truncate font-prompt">
                {shortcut.name}
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-[22px] font-black text-foreground tracking-tighter leading-none">
                  {shortcut.amount.toLocaleString('en-US')}
                </p>
                <span className="text-[10px] font-bold text-foreground/40 font-prompt">บ.</span>
              </div>
            </div>

            {/* Subtle background emoji */}
            <div className="absolute -right-3 -bottom-3 opacity-[0.03] dark:opacity-[0.05] rotate-12 transition-transform group-hover:scale-125 duration-500 pointer-events-none">
               <span className="text-6xl grayscale group-hover:grayscale-0 transition-all">{shortcut.categoryEmoji || '💰'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
