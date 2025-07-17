'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to their appropriate dashboard
    if (user) {
      if (user.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/feedback');
      }
    }
  }, [user, router]);

  // Show loading or landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Real-Time Feedback Board
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Submit your feedback and see real-time updates on our admin dashboard. 
            Perfect for events, webinars, and collecting audience input.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-6">
            <Link href="/login">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">Submit Feedback</h3>
            <p className="mt-2 text-gray-600">
              Share your thoughts, questions, or suggestions with our team.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">Real-Time Updates</h3>
            <p className="mt-2 text-gray-600">
              Admin dashboard receives feedback instantly via WebSocket connections.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">Content Moderation</h3>
            <p className="mt-2 text-gray-600">
              Admins can review and remove inappropriate content as needed.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
