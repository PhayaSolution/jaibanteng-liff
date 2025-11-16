'use client';

import { useEffect, useState } from 'react';
import { initLiff, getLiffProfile, isLiff } from '@/app/utils/liff.util';

interface LineUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
  phoneNumber?: string;
}

export default function LineLogin() {
  const [user, setUser] = useState<LineUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLogin = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize LIFF (don't check isLiff() first - let initialization determine)
        const initialized = await initLiff({
          withLoginOnExternalBrowser: true,
        });

        if (!initialized) {
          throw new Error('ไม่สามารถ initialize LIFF ได้');
        }

        // ดึงข้อมูล user profile
        const profile = await getLiffProfile();

        if (!profile) {
          // ถ้า profile เป็น null แสดงว่า user ยังไม่ได้ login
          // getLiffProfile จะเรียก liff.login() ให้อัตโนมัติ
          // และจะ redirect กลับมาหลัง login เสร็จ
          return;
        }

        // แสดงข้อมูล user
        setUser({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage,
          email: 'email' in profile ? profile.email : undefined,
          phoneNumber: 'phoneNumber' in profile ? profile.phoneNumber : undefined,
        });
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
        setIsLoading(false);
      }
    };

    handleLogin();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>เกิดข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <p>กำลัง login...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ข้อมูล User</h2>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {user.userId}</p>
        <p><strong>Display Name:</strong> {user.displayName}</p>
        {user.pictureUrl && (
          <div>
            <strong>รูปภาพ:</strong>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.pictureUrl} alt={user.displayName} className="w-20 h-20 rounded-full mt-2" />
          </div>
        )}
        {user.email && <p><strong>Email:</strong> {user.email}</p>}
        {user.phoneNumber && <p><strong>Phone:</strong> {user.phoneNumber}</p>}
        {user.statusMessage && <p><strong>Status:</strong> {user.statusMessage}</p>}
      </div>
    </div>
  );
}

