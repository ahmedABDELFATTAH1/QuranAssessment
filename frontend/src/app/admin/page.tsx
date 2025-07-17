'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { io } from 'socket.io-client';

interface Feedback {
  id: number;
  name: string;
  message: string;
  category?: string;
  createdAt: string;
  isInappropriate: boolean;
  user: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

interface FeedbackNotification {
  type: string;
  data: Feedback;
  timestamp: string;
}

export default function AdminDashboard() {
  const { user, getToken, logout } = useAuth();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [notifications, setNotifications] = useState<FeedbackNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    // Check if user is admin first
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!user.isAdmin) {
      router.push('/feedback');
      return;
    }

    const loadFeedbacks = async () => {
      try {
        const response = await fetch('/api/feedback', {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFeedbacks(data.feedback || []);
        }
      } catch (error) {
        console.error('Failed to load feedbacks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize WebSocket connection
    const token = getToken();
    if (token) {
      const newSocket = io('http://localhost:3001', {
        auth: {
          token: token,
        },
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
        setConnectionStatus('Connected');
        
        // Join admin room
        newSocket.emit('join-admin-room');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
        setConnectionStatus('Disconnected');
      });

      newSocket.on('new-feedback', (notification: FeedbackNotification) => {
        console.log('New feedback received:', notification);
        setNotifications(prev => [notification, ...prev]);
        
        // Add to feedbacks list
        setFeedbacks(prev => [notification.data, ...prev]);
        
        // Show browser notification if supported
        if (Notification.permission === 'granted') {
          new Notification('New Feedback Received', {
            body: `From ${notification.data.name}: ${notification.data.message.substring(0, 100)}...`,
            icon: '/favicon.ico',
          });
        }
      });

      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Load existing feedbacks
      loadFeedbacks();

      return () => {
        newSocket.close();
      };
    }
  }, [user, getToken, router]);

  // Show loading or redirect if not admin
  if (!user?.isAdmin) {
    return null;
  }

  const markAsInappropriate = async (feedbackId: number) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/mark-inappropriate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        setFeedbacks(prev =>
          prev.map(feedback =>
            feedback.id === feedbackId
              ? { ...feedback, isInappropriate: true }
              : feedback
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark feedback as inappropriate:', error);
    }
  };

  const deleteFeedback = async (feedbackId: number) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        setFeedbacks(prev => prev.filter(feedback => feedback.id !== feedbackId));
      }
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">{connectionStatus}</span>
              </div>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Notifications */}
        {notifications.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Real-time Notifications ({notifications.length})
              </h2>
              <Button onClick={clearNotifications} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-blue-900">New feedback from {notification.data.name}</p>
                      <p className="text-blue-700 mt-1">{notification.data.message.substring(0, 150)}...</p>
                      {notification.data.category && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                          {notification.data.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-600">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            All Feedback ({feedbacks.length})
          </h2>
          
          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No feedback submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className={`bg-white rounded-lg shadow p-6 ${
                    feedback.isInappropriate ? 'border-l-4 border-red-500 bg-red-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{feedback.name}</h3>
                      <p className="text-sm text-gray-600">
                        From: {feedback.user.username} | {new Date(feedback.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!feedback.isInappropriate && (
                        <Button
                          onClick={() => markAsInappropriate(feedback.id)}
                          variant="outline"
                          size="sm"
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        >
                          Mark Inappropriate
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteFeedback(feedback.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 mb-4">{feedback.message}</p>
                  
                  <div className="flex items-center space-x-4">
                    {feedback.category && (
                      <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded">
                        {feedback.category}
                      </span>
                    )}
                    {feedback.isInappropriate && (
                      <span className="inline-block bg-red-100 text-red-800 text-sm px-3 py-1 rounded">
                        Inappropriate
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
