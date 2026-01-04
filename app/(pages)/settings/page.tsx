'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User as UserIcon, List, Tags, LogOut, ChevronRight, PieChart, Bell, Download } from 'lucide-react';
import BottomNavigation from '@/app/components/layout/bottom-navigation.component';
import SettingsLayout from '@/app/components/settings/settings-layout.component';
import SettingsSection from '@/app/components/settings/settings-section.component';
import SettingsListItem from '@/app/components/settings/settings-list-item.component';
import { getUserSession, clearUserSession } from '@/app/utils/storage.util';
import { fetchCurrentUser } from '@/app/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('User');
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const session = getUserSession();
        if (!session?.lineUserId) {
          setIsLoading(false);
          return;
        }

        // Try to fetch latest user data from API
        try {
          const user = await fetchCurrentUser(session.lineUserId);
          setDisplayName(user.displayName || 'User');
          setPictureUrl(user.pictureUrl || null);
        } catch (error) {
          // Fallback to session data if API fails
          console.error('Failed to fetch user from API:', error);
          setDisplayName(session.displayName || 'User');
          setPictureUrl(session.pictureUrl || null);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) {
      return;
    }

    setIsLoggingOut(true);
    try {
      clearUserSession();
      router.push('/splash');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <SettingsLayout title="ตั้งค่า" showBackButton={false} footer={<BottomNavigation />}>
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-10 animate-fade-in-up">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-28 h-28 rounded-[2.5rem] bg-foreground/5 p-1 relative z-10 overflow-hidden border-2 border-white/20 shadow-2xl">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-foreground/10 rounded-[2rem]" />
            ) : pictureUrl ? (
              <Image
                src={pictureUrl}
                alt={displayName}
                width={112}
                height={112}
                className="w-full h-full object-cover rounded-[2rem]"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <UserIcon className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 mt-5">
          <h2 className="text-2xl font-black text-foreground font-prompt tracking-tight">
            {isLoading ? 'รอสักครู่...' : displayName}
          </h2>
          <Link
            href="/settings/profile/edit"
            className="text-xs text-primary font-bold font-prompt px-4 py-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-all active:scale-95"
          >
            แก้ไขโปรไฟล์
          </Link>
        </div>
      </div>

      {/* Main Settings */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <SettingsSection title="ทั่วไป">
          <SettingsListItem
            title="สถิติการใช้จ่าย"
            description="ดูสรุปภาพรวมรายหมวดหมู่ของคุณ"
            icon={<PieChart className="w-5 h-5" />}
            href="/charts"
          />
          <SettingsListItem
            title="จัดการหมวดหมู่"
            description="ปรับแต่งหมวดหมู่ให้เข้ากับไลฟ์สไตล์"
            icon={<List className="w-5 h-5" />}
            href="/settings/category"
          />
          <SettingsListItem
            title="แท็กที่ใช้บ่อย"
            description="จัดการแท็กเพื่อการจดที่ไวยิ่งขึ้น"
            icon={<Tags className="w-5 h-5" />}
            href="/tags"
          />
          <SettingsListItem
            title="การแจ้งเตือน"
            description="เปิด/ปิดการแจ้งเตือนผ่าน LINE"
            icon={<Bell className="w-5 h-5" />}
            href="/settings/reminding"
          />
          <SettingsListItem
            title="ส่งออก CSV"
            description="ดาวน์โหลดรายรับรายจ่ายเป็นไฟล์ CSV"
            icon={<Download className="w-5 h-5" />}
            href="/settings/export"
          />
        </SettingsSection>
      </div>

      {/* Account Actions */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <SettingsSection title="บัญชี">
          <SettingsListItem
            title={isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
            icon={<LogOut className="w-5 h-5" />}
            onClick={handleLogout}
            variant="danger"
            rightElement={null}
          />
        </SettingsSection>
      </div>
    </SettingsLayout>
  );
}
