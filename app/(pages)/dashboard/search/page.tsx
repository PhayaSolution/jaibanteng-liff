'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import TransactionList from '@/app/components/dashboard/transaction-list.component';

// Mock search results
const searchResults = [
  {
    date: '26/10/2560',
    total: 300,
    transactions: [
      {
        id: '1',
        category: 'Food',
        name: 'Food Salad',
        amount: 59,
        type: 'expense' as const,
        icon: 'food' as const,
      },
    ],
  },
];

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeArea className="min-h-dvh bg-white dark:bg-black">
      <Container className="py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-black dark:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Categories Or Tags..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              autoFocus
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery ? (
          <TransactionList groups={searchResults} />
        ) : (
          <div className="text-center py-12 text-gray-400 dark:text-gray-600">
            <p>Enter a search query to find transactions</p>
          </div>
        )}
      </Container>
    </SafeArea>
  );
}

