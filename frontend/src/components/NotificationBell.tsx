/**
 * NotificationBell.tsx — Notification badge + dropdown in topbar
 * Shows unread count and recent notifications with polling
 */

import { useEffect, useState, useRef } from 'react';
import * as notificationService from '../services/notification.service';
import { ApiError } from '../services/api';
import './NotificationBell.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ดึงข้อมูล notifications
  async function loadNotifications() {
    setLoading(true);
    try {
      const data = await notificationService.listNotifications(5, 0);
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  // Load on mount + polling every 30 seconds
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  async function handleMarkAsRead(id: string) {
    try {
      await notificationService.markAsRead(id);
      setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(n => n.filter(x => x.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-bell__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        🔔
        {unreadCount > 0 && <span className="notification-bell__badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-bell__dropdown">
          <div className="notification-bell__header">
            <h3>แจ้งเตือน</h3>
            {unreadCount > 0 && (
              <button
                className="notification-bell__mark-all"
                onClick={() => notificationService.markAllAsRead().then(loadNotifications)}
              >
                ทำเครื่องหมายว่าอ่านแล้ว
              </button>
            )}
          </div>

          {loading ? (
            <p className="notification-bell__empty">กำลังโหลด...</p>
          ) : notifications.length === 0 ? (
            <p className="notification-bell__empty">ไม่มีแจ้งเตือน</p>
          ) : (
            <div className="notification-bell__list">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-bell__item ${n.is_read ? 'notification-bell__item--read' : ''}`}
                >
                  <div className="notification-bell__content">
                    <p className="notification-bell__title">{n.title}</p>
                    <p className="notification-bell__message">{n.message}</p>
                    <p className="notification-bell__time">
                      {new Date(n.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <button
                    className="notification-bell__delete"
                    onClick={() => handleDelete(n.id)}
                    title="ลบ"
                  >
                    ✕
                  </button>
                  {!n.is_read && (
                    <button
                      className="notification-bell__check"
                      onClick={() => handleMarkAsRead(n.id)}
                      title="ทำเครื่องหมายว่าอ่านแล้ว"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <a href="/member/notifications" className="notification-bell__footer">
            ดูทั้งหมด →
          </a>
        </div>
      )}
    </div>
  );
}
