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
          throw new Error('Could not initialize LIFF');
        }

        // Fetch user profile
        const profile = await getLiffProfile();

        if (!profile) {
          // If profile is null, user is not logged in.
          // getLiffProfile calls liff.login() automatically.
          return;
        }

        // Show user info
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
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    handleLogin();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <p>Logging in...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Information</h2>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {user.userId}</p>
        <p><strong>Display Name:</strong> {user.displayName}</p>
        {user.pictureUrl && (
          <div>
            <strong>Picture:</strong>
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

