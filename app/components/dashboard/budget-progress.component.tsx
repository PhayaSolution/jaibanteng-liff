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
    <div className="space-y-5">
      {categories.map((category) => {
        const hasBudget = category.budget !== null && category.budget > 0;
        const percentage = hasBudget 
          ? Math.min((category.spent / (category.budget as number)) * 100, 100)
          : 0;
        const isOverBudget = hasBudget && category.spent > (category.budget as number);
        const isNearBudget = hasBudget && !isOverBudget && percentage >= 80;

        return (
          <div key={category.id} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.emoji || '📁'}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {category.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  ฿{category.spent.toLocaleString()}
                  {hasBudget && (
                    <span className="text-gray-400 dark:text-zinc-500 font-normal ml-1">
                      / ฿{category.budget?.toLocaleString()}
                    </span>
                  )}
                </div>
                {hasBudget && (
                  <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                    isOverBudget ? 'text-rose-500' : isNearBudget ? 'text-amber-500' : 'text-gray-400'
                  }`}>
                    {isOverBudget ? 'Over Budget' : isNearBudget ? 'Near Limit' : `${Math.round(percentage)}% Used`}
                  </div>
                )}
              </div>
            </div>
            
            {hasBudget ? (
              <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-500 ease-out rounded-full ${
                    isOverBudget 
                      ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                      : isNearBudget 
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                        : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            ) : (
              <div className="h-1 w-full bg-gray-50 dark:bg-zinc-900/50 rounded-full border border-dashed border-gray-200 dark:border-zinc-800" />
            )}
          </div>
        );
      })}
    </div>
  );
}
