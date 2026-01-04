'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format, startOfDay, endOfDay, subMonths } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Button } from '@/app/components/ui/button';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import { getUserSession } from '@/app/utils/storage.util';

export default function ExportPage() {
  const router = useRouter();
  
  // Set default date range: last month to today
  const today = new Date();
  const lastMonth = subMonths(today, 1);
  
  const [startDate, setStartDate] = useState<Date | undefined>(startOfDay(lastMonth));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfDay(today));
  const [transactionType, setTransactionType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('กรุณาเข้าสู่ระบบก่อนครับ');
      return;
    }

    // Validate dates
    if (!startDate || !endDate) {
      setError('กรุณาเลือกช่วงวันที่ให้ครบถ้วน');
      return;
    }

    const start = startDate;
    const end = endDate;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('วันที่ไม่ถูกต้อง');
      return;
    }

    if (start > end) {
      setError('วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด');
      return;
    }

    // Check if range is too large (more than 1 year)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      if (!confirm(`ช่วงเวลาที่เลือกยาวกว่า 1 ปี (${daysDiff} วัน) อาจใช้เวลาดาวน์โหลดนาน ต้องการดำเนินการต่อหรือไม่?`)) {
        return;
      }
    }

    setIsDownloading(true);
    setError(null);

    try {
      // Convert dates to ISO strings covering full days
      const startISO = startOfDay(start).toISOString();
      const endISO = endOfDay(end).toISOString();

      // Build query params
      const params = new URLSearchParams({
        startDate: startISO,
        endDate: endISO,
      });

      if (transactionType !== 'ALL') {
        params.append('type', transactionType);
      }

      // Fetch CSV with x-line-user-id header
      const response = await fetch(`/api/transactions/export?${params.toString()}`, {
        headers: {
          'x-line-user-id': session.lineUserId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Get blob and generate filename
      const blob = await response.blob();
      // Generate filename directly to ensure it's always .csv
      const filename = `transactions_${format(start, 'yyyyMMdd')}-${format(end, 'yyyyMMdd')}.csv`;

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download CSV:', err);
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถดาวน์โหลดไฟล์ได้';
      setError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SettingsLayout title="ส่งออก CSV" backUrl="/settings">
      {/* Info Card */}
      <div className="glass rounded-[2rem] p-6 mb-8 shadow-xl shadow-black/5 border-white/20 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground font-prompt mb-2">
              ส่งออกรายรับรายจ่าย
            </h3>
            <p className="text-sm text-foreground/50 font-prompt leading-relaxed">
              เลือกช่วงวันที่ที่ต้องการส่งออกข้อมูลเป็นไฟล์ CSV เพื่อนำไปใช้งานใน Excel หรือ Google Sheets
            </p>
          </div>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <SettingsSection title="ช่วงเวลา">
          <div className="glass rounded-[2rem] p-6 shadow-xl shadow-black/5 border-white/20 space-y-4">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground/60 font-prompt uppercase tracking-wider">
                วันที่เริ่มต้น
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal font-prompt h-auto py-3 px-4 rounded-2xl border-2 border-foreground/10 bg-background hover:bg-background/80"
                  >
                    <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                    {startDate ? (
                      <span className="font-bold text-foreground">
                        {format(startDate, 'd MMM yyyy', { locale: th })}
                      </span>
                    ) : (
                      <span className="text-foreground/50">เลือกวันที่เริ่มต้น</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 border-none shadow-2xl rounded-[2rem] bg-white dark:bg-zinc-950" 
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    defaultMonth={startDate}
                    disabled={(date) => date > today}
                    className="rounded-[2rem] p-6 [--cell-size:2.5rem] sm:[--cell-size:2.8rem]"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground/60 font-prompt uppercase tracking-wider">
                วันที่สิ้นสุด
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal font-prompt h-auto py-3 px-4 rounded-2xl border-2 border-foreground/10 bg-background hover:bg-background/80"
                  >
                    <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                    {endDate ? (
                      <span className="font-bold text-foreground">
                        {format(endDate, 'd MMM yyyy', { locale: th })}
                      </span>
                    ) : (
                      <span className="text-foreground/50">เลือกวันที่สิ้นสุด</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 border-none shadow-2xl rounded-[2rem] bg-white dark:bg-zinc-950" 
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    defaultMonth={endDate}
                    disabled={(date) => date > today}
                    className="rounded-[2rem] p-6 [--cell-size:2.5rem] sm:[--cell-size:2.8rem]"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* Transaction Type Selection */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <SettingsSection title="ประเภท">
          <div className="glass rounded-[2rem] p-6 shadow-xl shadow-black/5 border-white/20">
            <div className="flex p-1 bg-foreground/5 rounded-2xl">
              {(['ALL', 'INCOME', 'EXPENSE'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTransactionType(type)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 font-prompt ${
                    transactionType === type
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                      : 'text-foreground/40 hover:text-foreground/60'
                  }`}
                >
                  {type === 'ALL' ? 'ทั้งหมด' : type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}
                </button>
              ))}
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* Download Button */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <SettingsSection>
          <button
            onClick={handleDownload}
            disabled={isDownloading || !startDate || !endDate}
            className="w-full glass rounded-[2rem] p-6 shadow-xl shadow-black/5 border-white/20 flex items-center justify-center gap-4 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-primary/10 hover:bg-primary/20"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm font-bold text-primary font-prompt">
                  กำลังดาวน์โหลด...
                </span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary font-prompt">
                  ดาวน์โหลด CSV
                </span>
              </>
            )}
          </button>
        </SettingsSection>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 animate-fade-in-up">
          <p className="text-sm font-medium text-destructive font-prompt">{error}</p>
        </div>
      )}
    </SettingsLayout>
  );
}

