'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Send } from 'lucide-react';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import { getReminderSettings, updateReminderSettings } from '@/app/lib/api';
import { getUserSession } from '@/app/utils/storage.util';
import { sendDebugToOA } from '@/app/utils/debug.util';

export default function RemindingSettingsPage() {
  const router = useRouter();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderLeadMinutes, setReminderLeadMinutes] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format lead time in Thai
  const formatLeadTime = (minutes: number): string => {
    if (minutes === 15) return '15 นาที';
    if (minutes === 30) return '30 นาที';
    if (minutes === 120) return '2 ชั่วโมง';
    return `${minutes} นาที`;
  };

  useEffect(() => {
    async function loadSettings() {
      const session = getUserSession();
      if (!session?.lineUserId) {
        setError('กรุณาเข้าสู่ระบบก่อนครับ');
        router.push('/splash');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const settings = await getReminderSettings(session.lineUserId);
        setReminderEnabled(settings.reminderEnabled);
        setReminderLeadMinutes(settings.reminderLeadMinutes);
      } catch (err) {
        console.error('Failed to load reminder settings:', err);
        const errorObj = err as { error?: string };
        setError(errorObj.error || 'ไม่สามารถโหลดการตั้งค่าได้');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [router]);

  const handleToggle = async () => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('กรุณาเข้าสู่ระบบก่อนครับ');
      return;
    }

    const newValue = !reminderEnabled;
    setIsSaving(true);
    setError(null);

    try {
      await updateReminderSettings(session.lineUserId, { reminderEnabled: newValue });
      setReminderEnabled(newValue);
    } catch (err) {
      console.error('Failed to update reminder settings:', err);
      const errorObj = err as { error?: string };
      setError(errorObj.error || 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('กรุณาเข้าสู่ระบบก่อนครับ');
      return;
    }

    setIsSendingTest(true);
    setError(null);

    try {
      const success = await sendDebugToOA(
        session.lineUserId,
        '🔔 ทดสอบการแจ้งเตือน\n\nถ้าคุณได้รับข้อความนี้ แสดงว่าระบบแจ้งเตือนทำงานได้ปกติครับ!',
        'info'
      );

      if (success) {
        alert('ส่งข้อความทดสอบสำเร็จ! ตรวจสอบ LINE ของคุณครับ');
      } else {
        setError('ไม่สามารถส่งข้อความทดสอบได้');
      }
    } catch (err) {
      console.error('Failed to send test message:', err);
      setError('ไม่สามารถส่งข้อความทดสอบได้');
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <SettingsLayout title="การแจ้งเตือน" backUrl="/settings">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-medium text-foreground/30 font-prompt">กำลังโหลด...</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="การแจ้งเตือน" backUrl="/settings">
      {/* Info Card */}
      <div className="glass rounded-[2rem] p-6 mb-8 shadow-xl shadow-black/5 border-white/20 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground font-prompt mb-2">
              แจ้งเตือนผ่าน LINE
            </h3>
            <p className="text-sm text-foreground/50 font-prompt leading-relaxed">
              เมื่อเปิดใช้งาน ระบบจะส่งข้อความแจ้งเตือนไปยัง LINE ของคุณล่วงหน้า {formatLeadTime(reminderLeadMinutes)} ก่อนถึงเวลาที่กำหนด
            </p>
          </div>
        </div>
      </div>

      {/* Toggle Setting */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <SettingsSection title="ตั้งค่า">
          <div className="space-y-4">
            {/* Toggle Switch */}
            <div className="glass rounded-[2rem] p-6 shadow-xl shadow-black/5 border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-foreground/5 text-primary">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground font-prompt">
                      เปิดการแจ้งเตือน
                    </p>
                    <p className="text-xs text-foreground/40 font-medium font-prompt">
                      {reminderEnabled ? 'กำลังใช้งาน' : 'ปิดอยู่'}
                    </p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={handleToggle}
                  disabled={isSaving}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    reminderEnabled 
                      ? 'bg-primary shadow-lg shadow-primary/30' 
                      : 'bg-foreground/10'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                      reminderEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Lead Time Selector */}
            <div className="glass rounded-[2rem] p-6 shadow-xl shadow-black/5 border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-foreground/5 text-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground font-prompt">
                      แจ้งเตือนล่วงหน้า
                    </p>
                    <p className="text-xs text-foreground/40 font-medium font-prompt">
                      เลือกเวลาที่ต้องการแจ้งเตือนก่อนถึงเวลาจริง
                    </p>
                  </div>
                </div>
                
                {/* Lead Time Selector */}
                <select
                  value={reminderLeadMinutes}
                  onChange={async (e) => {
                    const newValue = parseInt(e.target.value, 10);
                    const session = getUserSession();
                    if (!session?.lineUserId) {
                      setError('กรุณาเข้าสู่ระบบก่อนครับ');
                      return;
                    }

                    setIsSaving(true);
                    setError(null);

                    try {
                      await updateReminderSettings(session.lineUserId, { reminderLeadMinutes: newValue });
                      setReminderLeadMinutes(newValue);
                    } catch (err) {
                      console.error('Failed to update reminder lead time:', err);
                      const errorObj = err as { error?: string };
                      setError(errorObj.error || 'ไม่สามารถบันทึกการตั้งค่าได้');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving || !reminderEnabled}
                  className="appearance-none px-4 py-2 pr-10 rounded-2xl border-0 bg-foreground/5 text-sm font-bold text-foreground hover:bg-foreground/10 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed font-prompt"
                >
                  <option value={15}>15 นาที</option>
                  <option value={30}>30 นาที</option>
                  <option value={120}>2 ชั่วโมง</option>
                </select>
              </div>
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* Test Message */}
      <div className="animate-fade-in-up mt-8" style={{ animationDelay: '0.2s' }}>
        <SettingsSection title="ทดสอบ">
          <button
            onClick={handleSendTestMessage}
            disabled={isSendingTest}
            className="w-full glass rounded-[2rem] p-6 shadow-xl shadow-black/5 border-white/20 flex items-center gap-4 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary">
              <Send className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground font-prompt">
                {isSendingTest ? 'กำลังส่ง...' : 'ส่งข้อความทดสอบ'}
              </p>
              <p className="text-xs text-foreground/40 font-medium font-prompt">
                ทดสอบว่าได้รับข้อความจาก LINE หรือไม่
              </p>
            </div>
            {isSendingTest && (
              <div className="w-5 h-5 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
            )}
          </button>
        </SettingsSection>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 animate-fade-in-up">
          <p className="text-sm font-medium text-destructive font-prompt">{error}</p>
        </div>
      )}
    </SettingsLayout>
  );
}

