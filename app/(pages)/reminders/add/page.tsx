'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import { createReminder } from '@/app/lib/api';
import { getUserSession } from '@/app/utils/storage.util';

export default function AddReminderPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [remindAt, setRemindAt] = useState(() => {
    // Default to current date/time + 1 hour, rounded to nearest hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    now.setSeconds(0);
    return format(now, "yyyy-MM-dd'T'HH:mm");
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('กรุณาเข้าสู่ระบบก่อนครับ');
      router.push('/splash');
      return;
    }

    if (!title.trim()) {
      setError('กรุณากรอกหัวข้อการแจ้งเตือนครับ');
      return;
    }

    if (!remindAt) {
      setError('กรุณาเลือกวันเวลาที่ต้องการแจ้งเตือนครับ');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createReminder(session.lineUserId, {
        title: title.trim(),
        note: note.trim() || null,
        remindAt: new Date(remindAt).toISOString(),
      });

      router.back();
    } catch (err) {
      console.error('Failed to create reminder:', err);
      const errorObj = err as { error?: string };
      setError(errorObj.error || 'ไม่สามารถสร้างการแจ้งเตือนได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeArea className="h-dvh bg-background dark:bg-zinc-950 flex flex-col overflow-hidden">
      <Container className="py-6 pb-10 flex-1 overflow-y-auto min-h-0 no-scrollbar">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <button
            onClick={() => router.back()}
            className="p-3.5 hover:text-primary bg-white dark:bg-zinc-900 shadow-xl shadow-black/5 rounded-2xl transition-all active:scale-90"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5 text-current"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-3xl font-black text-foreground font-prompt tracking-tight">
            เพิ่มการแจ้งเตือน
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Title */}
          <div className="glass rounded-[2rem] p-6 shadow-xl shadow-black/5 border-white/20">
            <label htmlFor="title" className="block text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt mb-4">
              หัวข้อ
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น จ่ายค่าเน็ต, นัดหมอ"
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-foreground/10 focus:border-primary focus:ring-0 text-lg font-bold text-foreground placeholder:text-foreground/20 font-prompt transition-colors"
              required
            />
          </div>

          {/* Note */}
          <div className="glass rounded-[2rem] p-6 shadow-xl shadow-black/5 border-white/20">
            <label htmlFor="note" className="block text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt mb-4">
              รายละเอียด (ไม่บังคับ)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เพิ่มรายละเอียดเพิ่มเติม..."
              rows={3}
              className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-foreground/10 focus:border-primary focus:ring-0 text-base font-medium text-foreground placeholder:text-foreground/20 font-prompt resize-none transition-colors"
            />
          </div>

          {/* Remind At */}
          <div className="glass rounded-[2rem] p-6 shadow-xl shadow-black/5 border-white/20">
            <label htmlFor="remindAt" className="block text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt mb-4">
              วันเวลาที่ต้องการแจ้งเตือน
            </label>
            <input
              id="remindAt"
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className="w-full px-4 py-3 bg-foreground/5 border-2 border-foreground/10 focus:border-primary focus:ring-0 rounded-2xl text-base font-bold text-foreground font-prompt transition-colors"
              required
            />
            <p className="mt-3 text-xs text-foreground/40 font-prompt">
              💡 ระบบจะแจ้งเตือนผ่าน LINE ล่วงหน้า 2 ชั่วโมงก่อนถึงเวลาที่กำหนด
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-medium text-destructive font-prompt">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full py-5 text-base font-bold text-white bg-primary rounded-[2rem] hover:brightness-105 shadow-xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-prompt"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึก...
              </span>
            ) : (
              '🔔 บันทึกการแจ้งเตือน'
            )}
          </button>
        </form>
      </Container>
    </SafeArea>
  );
}

