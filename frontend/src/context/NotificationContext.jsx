import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getUnreadCount();
      if (res.status === 'success') {
        setUnreadCount(res.unreadCount ?? res.unread_count ?? 0);
        return;
      }
    } catch {
      // Fallback to main notifications endpoint which provides unreadCount on all backend versions
      try {
        const fallback = await notificationService.getNotifications({ limit: 1 });
        if (fallback.status === 'success') {
          setUnreadCount(fallback.unreadCount ?? fallback.unread_count ?? 0);
        }
      } catch {
        // Silently ignore polling error
      }
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({ limit: 15 });
      if (res.status === 'success' && res.data) {
        setNotifications(res.data);
        if (res.unreadCount !== undefined || res.unread_count !== undefined) {
          setUnreadCount(res.unreadCount ?? res.unread_count ?? 0);
        }
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    fetchUnreadCount();
    fetchNotifications();

    const interval = setInterval(fetchUnreadCount, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
