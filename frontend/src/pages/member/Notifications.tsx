/**
 * Notifications.tsx — Member page เพื่อดูรายการแจ้งเตือนทั้งหมด
 * Phase 12: Notifications list with filters
 */

import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import { ApiError } from '../../services/api';
import * as notificationService from '../../services/notification.service';
import './Notifications.css';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const data = await notificationService.listNotifications(100, 0);
      setNotifications(data.notifications);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถโหลดแจ้งเตือน', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  async function handleMarkAsRead(id: string) {
    try {
      await notificationService.markAsRead(id);
      setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
      showToast('ทำเครื่องหมายว่าอ่านแล้ว', 'success');
    } catch (err) {
      showToast('ไม่สำเร็จ', 'error');
    }
  }

  async function handleDelete(id: string) {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(n => n.filter(x => x.id !== id));
      showToast('ลบแล้ว', 'success');
    } catch (err) {
      showToast('ไม่สำเร็จ', 'error');
    }
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
  }

  return (
    <div className="notifications-page">
      <h1>แจ้งเตือน</h1>

      <div className="notifications-page__filters">
        <button
          className={`notifications-page__filter ${filter === 'all' ? 'notifications-page__filter--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ทั้งหมด ({notifications.length})
        </button>
        <button
          className={`notifications-page__filter ${filter === 'unread' ? 'notifications-page__filter--active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          ยังไม่อ่าน ({notifications.filter(n => !n.is_read).length})
        </button>
        <button
          className={`notifications-page__filter ${filter === 'read' ? 'notifications-page__filter--active' : ''}`}
          onClick={() => setFilter('read')}
        >
          อ่านแล้ว ({notifications.filter(n => n.is_read).length})
        </button>
      </div>

      {notifications.filter(n => !n.is_read).length > 0 && (
        <button
          className="btn btn--ghost notifications-page__mark-all"
          onClick={() => notificationService.markAllAsRead().then(loadNotifications)}
        >
          ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
        </button>
      )}

      <div className="notifications-page__list">
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            {filter === 'all' ? 'ไม่มีแจ้งเตือน' : 'ไม่มีแจ้งเตือนในหมวดหมู่นี้'}
          </p>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`notifications-page__item ${n.is_read ? 'notifications-page__item--read' : ''}`}
            >
              <div className="notifications-page__content">
                <h3 className="notifications-page__title">{n.title}</h3>
                <p className="notifications-page__message">{n.message}</p>
                <p className="notifications-page__time">
                  {new Date(n.created_at).toLocaleString('th-TH')}
                </p>
              </div>
              <div className="notifications-page__actions">
                {!n.is_read && (
                  <button
                    className="notifications-page__btn notifications-page__btn--check"
                    onClick={() => handleMarkAsRead(n.id)}
                    title="ทำเครื่องหมายว่าอ่านแล้ว"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="notifications-page__btn notifications-page__btn--delete"
                  onClick={() => handleDelete(n.id)}
                  title="ลบ"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}

export default Notifications;
