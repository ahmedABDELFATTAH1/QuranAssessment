'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;
    
    // Redirect authenticated users to their appropriate dashboard
    if (user) {
      if (user.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/feedback');
      }
    } else {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [user, router, authLoading]);

  // Show loading while auth is being verified or redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
