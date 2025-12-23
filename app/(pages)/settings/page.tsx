'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User as UserIcon, List, Tags, LogOut, ChevronRight, PieChart } from 'lucide-react';
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
    <SettingsLayout title="Settings" showBackButton={false}>
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4 overflow-hidden border-4 border-white dark:border-black shadow-sm">
          {isLoading ? (
            <div className="w-full h-full animate-pulse bg-gray-300 dark:bg-gray-700" />
          ) : pictureUrl ? (
            <Image
              src={pictureUrl}
              alt={displayName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <UserIcon className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {isLoading ? '...' : displayName}
          </h2>
          <Link
            href="/settings/profile/edit"
            className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Main Settings */}
      <SettingsSection title="General">
        <SettingsListItem
          title="Category Breakdown"
          description="View spending statistics by category"
          icon={<PieChart className="w-5 h-5" />}
          href="/charts"
        />
        <SettingsListItem
          title="Categories"
          description="Manage spending categories"
          icon={<List className="w-5 h-5" />}
          href="/settings/category"
        />
        <SettingsListItem
          title="Tags"
          description="Manage transaction tags"
          icon={<Tags className="w-5 h-5" />}
          href="/tags"
        />
      </SettingsSection>

      {/* Account Actions */}
      <SettingsSection title="Account">
        <SettingsListItem
          title={isLoggingOut ? "Logging out..." : "Logout"}
          icon={<LogOut className="w-5 h-5" />}
          onClick={handleLogout}
          variant="danger"
          rightElement={null}
        />
      </SettingsSection>

      <BottomNavigation />
    </SettingsLayout>
  );
}
