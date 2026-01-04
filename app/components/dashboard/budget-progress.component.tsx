'use client';

import React from 'react';

interface CategoryBudget {
  id: string;
  name: string;
  emoji?: string | null;
  budget: number | null;
  spent: number;
}

interface BudgetProgressProps {
  categories: CategoryBudget[];
  isLoading?: boolean;
}

export default function BudgetProgress({ categories, isLoading }: BudgetProgressProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex justify-between mb-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No budgets set for this period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const hasBudget = category.budget !== null && category.budget > 0;
        const percentage = hasBudget 
          ? Math.min((category.spent / (category.budget as number)) * 100, 100)
          : 0;
        const isOverBudget = hasBudget && category.spent > (category.budget as number);
        const isNearBudget = hasBudget && !isOverBudget && percentage >= 80;

        return (
          <div key={category.id} className="group animate-fade-in-up">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 flex items-center justify-center text-lg bg-foreground/5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  {category.emoji || '📁'}
                </div>
                <span className="text-sm font-bold text-foreground font-prompt">
                  {category.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-foreground">
                  {category.spent.toLocaleString('en-US')} บ.
                  {hasBudget && (
                    <span className="text-foreground/20 font-bold ml-1">
                      / {category.budget?.toLocaleString('en-US')} บ.
                    </span>
                  )}
                </div>
                {hasBudget && (
                  <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 font-prompt ${
                    isOverBudget ? 'text-destructive' : isNearBudget ? 'text-amber-500' : 'text-primary'
                  }`}>
                    {isOverBudget ? 'เกินงบแล้วครับ' : isNearBudget ? 'ใกล้เต็มแล้วนะ' : `ใช้ไป ${Math.round(percentage)}%`}
                  </div>
                )}
              </div>
            </div>
            
            {hasBudget ? (
              <div className="h-2.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out rounded-full shadow-lg ${
                    isOverBudget 
                      ? 'bg-destructive' 
                      : isNearBudget 
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400' 
                        : 'bg-primary'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            ) : (
              <div className="h-1 w-full bg-foreground/5 rounded-full border border-dashed border-foreground/10" />
            )}
          </div>
        );
      })}
    </div>
  );
}
