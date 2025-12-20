'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import CategoryPieChart from '@/app/components/charts/category-pie-chart';
import { getUserSession } from '@/app/utils/storage.util';

export default function ChartsPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const session = getUserSession();
      if (!session?.lineUserId) {
        router.push('/splash');
        return;
      }

      setIsLoading(true);
      try {
        const start = startOfMonth(currentDate).toISOString();
        const end = endOfMonth(currentDate).toISOString();
        const res = await fetch(`/api/stats?startDate=${start}&endDate=${end}&type=${type}`, {
          headers: { 'x-line-user-id': session.lineUserId }
        });
        
        if (!res.ok) throw new Error('Failed to fetch stats');
        
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load chart data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, [currentDate, type, router]);

  return (
    <SafeArea className="h-dvh max-h-dvh bg-white flex flex-col overflow-hidden">
      <Container className="flex flex-col h-full p-0 relative">
        
        {/* Header Section */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0 z-10">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-black hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          
          <h1 className="text-lg font-bold tracking-tight">Category Breakdown</h1>
          
          <div className="w-10"></div>
        </div>

        {/* Month Navigation */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0">
          <button 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-black capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: enUS })}
            </h2>
          </div>
          
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="px-5 pb-6 flex justify-center shrink-0">
          <div className="flex bg-gray-100 p-1 rounded-full w-full max-w-[280px]">
            <button
              onClick={() => setType('INCOME')}
              className={`
                flex-1 py-2 rounded-full text-sm font-bold transition-all duration-200
                ${type === 'INCOME' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              Income
            </button>
            <button
              onClick={() => setType('EXPENSE')}
              className={`
                flex-1 py-2 rounded-full text-sm font-bold transition-all duration-200
                ${type === 'EXPENSE' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
              <Loader2 className="w-8 h-8 animate-spin text-black mb-4" />
              <p className="text-xs font-medium text-gray-400">Loading data...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {/* Chart Block */}
              <div className="bg-gray-50/50 rounded-3xl p-4 mb-8">
                <CategoryPieChart data={data?.byCategory || []} />
              </div>

              {/* Total Summary */}
              <div className="mb-8 flex items-baseline justify-between px-2">
                <span className="text-sm font-bold text-gray-400">Total</span>
                <span className={`text-2xl font-black ${type === 'EXPENSE' ? 'text-black' : 'text-emerald-600'}`}>
                  {data?.total?.toLocaleString()} THB
                </span>
              </div>

              {/* Breakdown List */}
              <div className="space-y-3">
                {data?.byCategory.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-gray-400">No category data</p>
                  </div>
                ) : (
                  data?.byCategory.map((cat: any) => (
                    <div 
                      key={cat.id} 
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-black transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                          {cat.emoji || '📁'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-black">{cat.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {cat.percentage.toFixed(1)}% of total
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm">{cat.amount.toLocaleString()} THB</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </Container>
    </SafeArea>
  );
}
