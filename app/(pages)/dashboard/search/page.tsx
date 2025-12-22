'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import TransactionList from '@/app/components/dashboard/transaction-list.component';
import { fetchTransactions, fetchCategories, fetchTags } from '@/app/lib/api';
import { Transaction, Category, Tag, TransactionType, TransactionStatus } from '@/app/lib/types';
import { getUserSession } from '@/app/utils/storage.util';
import { transformTransactionsToGroups, TransactionGroup } from '@/app/lib/utils';
import { format } from 'date-fns';

export default function SearchPage() {
  const router = useRouter();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType | 'BOTH'>('BOTH');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'BOTH'>('BOTH');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  
  // Data state
  const [transactions, setTransactions] = useState<TransactionGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load categories and tags
  useEffect(() => {
    const session = getUserSession();
    if (session?.lineUserId) {
      fetchCategories(session.lineUserId).then(setCategories);
      fetchTags(session.lineUserId).then(setTags);
    }
  }, []);

  const performSearch = useCallback(async () => {
    const session = getUserSession();
    if (!session?.lineUserId) return;

    setIsLoading(true);
    try {
      const params: any = {
        search: debouncedQuery || undefined,
        type: selectedType === 'BOTH' ? undefined : selectedType,
        status: selectedStatus === 'BOTH' ? undefined : selectedStatus,
        categoryId: selectedCategoryId === 'ALL' ? undefined : selectedCategoryId,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      };

      const results = await fetchTransactions(session.lineUserId, params);
      setTransactions(transformTransactionsToGroups(results));
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, selectedType, selectedStatus, selectedCategoryId, selectedTagIds, startDate, endDate, minAmount, maxAmount]);

  useEffect(() => {
    // Search whenever criteria changes, but only if there's a reason to search
    // (either query is present, or filters are active)
    const hasActiveFilters = 
      selectedType !== 'BOTH' || 
      selectedStatus !== 'BOTH' || 
      selectedCategoryId !== 'ALL' || 
      selectedTagIds.length > 0 || 
      startDate || 
      endDate || 
      minAmount || 
      maxAmount;

    if (debouncedQuery || hasActiveFilters) {
      performSearch();
    } else {
      setTransactions([]);
      setHasSearched(false);
    }
  }, [performSearch, debouncedQuery, selectedType, selectedStatus, selectedCategoryId, selectedTagIds, startDate, endDate, minAmount, maxAmount]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedType('BOTH');
    setSelectedStatus('BOTH');
    setSelectedCategoryId('ALL');
    setSelectedTagIds([]);
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  return (
    <SafeArea className="min-h-dvh bg-white dark:bg-black">
      <Container className="py-4">
        {/* Header & Search Input */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-black dark:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Categories Or Tags..."
              className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              autoFocus
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-xl border transition-colors ${
              isFilterOpen 
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                : 'bg-white text-black border-gray-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* Detailed Filters - Expandable */}
        {isFilterOpen && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium"
              >
                Clear All
              </button>
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Type</label>
                <div className="flex p-1 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                  {['BOTH', 'INCOME', 'EXPENSE'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t as any)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        selectedType === t 
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {t === 'BOTH' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Status</label>
                <div className="flex p-1 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                  {['BOTH', 'ACTIVE', 'DONE'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStatus(s as any)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        selectedStatus === s 
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {s === 'BOTH' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Amount Range</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Date Range</label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
                {tags.length === 0 && <p className="text-xs text-gray-400 italic">No tags created yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="mt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-black dark:border-zinc-800 dark:border-t-white rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Searching...</p>
            </div>
          ) : transactions.length > 0 ? (
            <TransactionList 
              groups={transactions} 
              onTransactionClick={(tx) => {
                // Handle click - maybe go to edit or detail?
                console.log('Clicked tx:', tx);
              }}
            />
          ) : hasSearched ? (
            <div className="text-center py-20">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No results found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Try adjusting your filters or search query</p>
              <button 
                onClick={clearFilters}
                className="mt-6 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-gray-50 dark:bg-zinc-900/50 rounded-full text-gray-300 dark:text-zinc-800">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-400 dark:text-zinc-600 font-medium">Enter a query or use filters to find transactions</p>
            </div>
          )}
        </div>
      </Container>
    </SafeArea>
  );
}
