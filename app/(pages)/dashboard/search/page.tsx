'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import TransactionList from '@/app/components/dashboard/transaction-list.component';
import BottomNavigation from '@/app/components/layout/bottom-navigation.component';
import { fetchTransactions, fetchCategories, fetchTags } from '@/app/lib/api';
import { Transaction, Category, Tag, TransactionType, TransactionStatus } from '@/app/lib/types';
import { getUserSession } from '@/app/utils/storage.util';
import { transformTransactionsToGroups, TransactionGroup } from '@/app/lib/utils';
import { format } from 'date-fns';
import { Search, Filter, ChevronLeft, Calendar, Tag as TagIcon, X, Trash2 } from 'lucide-react';

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
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl text-black dark:text-white shadow-sm active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Category Or Tag..."
              className="w-full px-5 py-3 pl-12 rounded-[1.5rem] border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-3 rounded-2xl border transition-all duration-300 shadow-sm active:scale-95 ${
              isFilterOpen 
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-black/20' 
                : 'bg-white text-black border-gray-100 dark:bg-zinc-900 dark:text-white dark:border-zinc-800'
            }`}
          >
            <Filter className={`w-5 h-5 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Detailed Filters - Expandable */}
        {isFilterOpen && (
          <div className="mb-6 p-5 glass rounded-[2rem] border border-gray-100 dark:border-zinc-800 space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-sm text-rose-500 hover:text-rose-600 font-semibold transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Type</label>
                <div className="flex p-1 bg-gray-100/50 dark:bg-zinc-800/50 rounded-2xl border border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-sm">
                  {['BOTH', 'INCOME', 'EXPENSE'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t as any)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                        selectedType === t 
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-[1.02]' 
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {t === 'BOTH' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Status</label>
                <div className="flex p-1 bg-gray-100/50 dark:bg-zinc-800/50 rounded-2xl border border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-sm">
                  {['BOTH', 'ACTIVE', 'DONE'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStatus(s as any)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                        selectedStatus === s 
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-[1.02]' 
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
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Category</label>
              <div className="relative">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Amount Range */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Amount Range</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                    />
                  </div>
                  <span className="text-gray-300 font-bold">-</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Date Range</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                    />
                  </div>
                  <span className="text-gray-300 font-bold">-</span>
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-3 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-primary text-primary-foreground shadow-lg scale-[1.05]'
                        : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-zinc-700 hover:border-primary/50'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <div className="py-2 px-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 w-full text-center">
                    <p className="text-xs text-gray-400 italic">No tags created yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="mt-8 space-y-4">
          {hasSearched && !isLoading && transactions.length > 0 && (
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-sm font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                Search Results
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-500">
                {transactions.reduce((acc, g) => acc + g.transactions.length, 0)} Items
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-black dark:border-zinc-800 dark:border-t-white rounded-full animate-spin shadow-inner"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400 font-bold animate-pulse">Searching for serenity...</p>
            </div>
          ) : transactions.length > 0 ? (
            <TransactionList 
              groups={transactions} 
              onTransactionClick={(tx) => {
                // Navigate to edit page
                router.push(`/transaction/edit/${tx.id}`);
              }}
            />
          ) : hasSearched ? (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gray-50 dark:bg-zinc-900 rounded-[2rem] shadow-inner text-gray-300 dark:text-zinc-800">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No results found</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto text-sm">Try adjusting your filters or search query</p>
              <button 
                onClick={clearFilters}
                className="mt-8 px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-2xl text-sm font-bold shadow-xl shadow-black/10 active:scale-95 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="text-center py-20 opacity-50">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gray-50/50 dark:bg-zinc-900/50 rounded-[2.5rem] text-gray-200 dark:text-zinc-800">
                <Search className="w-10 h-10" />
              </div>
              <p className="text-gray-400 dark:text-zinc-600 font-bold max-w-[240px] mx-auto">Enter a query or use filters to find transactions</p>
            </div>
          )}
        </div>
        {/* Results spacing for bottom nav */}
        <div className="h-24" />
      </Container>
      <BottomNavigation />
    </SafeArea>
  );
}
