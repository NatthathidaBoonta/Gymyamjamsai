/**
 * NotificationBell.tsx — กระดิ่งแจ้งเตือนบน TopNav (ทุกบทบาท)
 * - poll ทุก 15 วิ + รีเฟรชเมื่อกลับมาที่แท็บ
 * - กดรายการ → ทำเครื่องหมายอ่านแล้ว + พาไปหน้าที่เกี่ยวข้อง (ตามชนิด/บทบาท)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as ns from '../services/notification.service';
import { notificationIcon, notificationLink, timeAgo } from '../utils/notificationLink';
import './NotificationBell.css';

const POLL_MS = 15_000;

export default function NotificationBell() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<ns.Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await ns.listNotifications(8, 0);
      setItems(data.notifications);
      setUnread(data.unread_count);
    } catch {
      /* เงียบ — รอบถัดไป */
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  async function openItem(n: ns.Notification) {
    if (!n.is_read) {
      setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((c) => Math.max(0, c - 1));
      ns.markAsRead(n.id).catch(() => undefined);
    }
    const to = notificationLink(n.type, n.related_id, role);
    setOpen(false);
    if (to) navigate(to);
  }

  async function markAll() {
    setLoading(true);
    try {
      await ns.markAllAsRead();
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function remove(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setItems((cur) => cur.filter((x) => x.id !== id));
    try { await ns.deleteNotification(id); } finally { load(); }
  }

  return (
    <div className="nb" ref={boxRef}>
      <button type="button" className="nb__btn" onClick={() => setOpen((o) => !o)} aria-label={`แจ้งเตือน${unread ? ` ${unread} รายการใหม่` : ''}`} aria-expanded={open}>
        <i className="ri-notification-3-line"></i>
        {unread > 0 && <span className="nb__badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="nb__panel" role="dialog" aria-label="แจ้งเตือน">
          <div className="nb__head">
            <strong>แจ้งเตือน</strong>
            {unread > 0 && (
              <button type="button" className="nb__markall" onClick={markAll} disabled={loading}>อ่านทั้งหมด</button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="nb__empty"><i className="ri-notification-off-line"></i>ยังไม่มีแจ้งเตือน</div>
          ) : (
            <ul className="nb__list">
              {items.map((n) => {
                const to = notificationLink(n.type, n.related_id, role);
                return (
                  <li key={n.id} className={`nb__item ${n.is_read ? '' : 'nb__item--new'} ${to ? 'nb__item--link' : ''}`} onClick={() => openItem(n)}>
                    <span className={`nb__icon nb__icon--${n.type}`}><i className={notificationIcon(n.type)}></i></span>
                    <div className="nb__body">
                      <div className="nb__title">{n.title}</div>
                      <div className="nb__msg">{n.message}</div>
                      <div className="nb__time">{timeAgo(n.created_at)}{to && <span> · เปิด</span>}</div>
                    </div>
                    <button type="button" className="nb__del" onClick={(e) => remove(e, n.id)} aria-label="ลบ"><i className="ri-close-line"></i></button>
                  </li>
                );
              })}
            </ul>
          )}

          {role === 'member' && (
            <button type="button" className="nb__all" onClick={() => { setOpen(false); navigate('/member/notifications'); }}>
              ดูทั้งหมด <i className="ri-arrow-right-line"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
