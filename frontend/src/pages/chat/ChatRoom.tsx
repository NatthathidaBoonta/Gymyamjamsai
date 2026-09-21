/**
 * ChatRoom.tsx — ห้องแชทกลุ่มของคอร์ส (สมาชิกที่อนุมัติแล้ว + ผู้ฝึกสอนเจ้าของ)
 *
 * - โหลดห้อง + ประวัติผ่าน REST แล้วต่อ Socket.IO เพื่อรับข้อความใหม่
 * - socket ต่อไม่ได้ → ส่งผ่าน REST และดึงข้อความใหม่ทุก 5 วิ (polling fallback)
 * - ข้อความ render เป็น text node เท่านั้น (ไม่มี HTML)
 */

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../services/api';
import { HOME_BY_ROLE } from '../../routes/navConfig';
import * as chat from '../../services/chat.service';
import './ChatRoom.css';

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
}

function dayKey(iso: string) {
  return new Date(iso).toDateString();
}

export default function ChatRoom() {
  const { id: activityId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId, role } = useAuth();

  const [room, setRoom] = useState<chat.ChatRoom | null>(null);
  const [messages, setMessages] = useState<chat.ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false); // socket เชื่อมอยู่ไหม
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const append = useCallback((msg: chat.ChatMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  // ---------- โหลดห้อง + ประวัติ ----------
  useEffect(() => {
    if (!activityId) return;
    let cancelled = false;
    (async () => {
      try {
        const [r, msgs] = await Promise.all([chat.getRoom(activityId), chat.getMessages(activityId)]);
        if (cancelled) return;
        setRoom(r);
        setMessages(msgs);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'ไม่สามารถเปิดห้องแชทได้');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activityId]);

  // ---------- Socket ----------
  useEffect(() => {
    if (!activityId || !room) return;
    const socket = chat.connectChat();
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', { activityId }, (ack: chat.SocketAck) => {
        if (ack.success) setLive(true);
        else setError(ack.error);
      });
    });
    socket.on('disconnect', () => setLive(false));
    socket.on('connect_error', () => setLive(false));
    socket.on('receive_message', append);

    return () => {
      socket.emit('leave_room', { activityId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activityId, room, append]);

  // ---------- Polling fallback เมื่อ socket ไม่เชื่อม ----------
  useEffect(() => {
    if (!activityId || !room || live) return;
    const timer = window.setInterval(async () => {
      if (document.hidden) return;
      const last = messages[messages.length - 1];
      const after = last ? last.created_ms : undefined;
      try {
        const fresh = await chat.getMessages(activityId, after);
        fresh.forEach(append);
      } catch {
        /* เงียบ — รอบถัดไปลองใหม่ */
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activityId, room, live, messages, append]);

  // ---------- เลื่อนลงล่างเมื่อมีข้อความใหม่ ----------
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || !room?.can_send || sending) return;
    setSending(true);
    setInput('');
    try {
      const socket = socketRef.current;
      if (live && socket?.connected) {
        await new Promise<void>((resolve, reject) => {
          socket.emit('send_message', { activityId, message: text }, (ack: chat.SocketAck) => {
            if (ack.success) {
              if (ack.data) append(ack.data);
              resolve();
            } else reject(new Error(ack.error));
          });
        });
      } else {
        append(await chat.sendMessageRest(activityId, text));
      }
    } catch (err) {
      setInput(text); // คืนข้อความให้แก้/ส่งใหม่
      setError(err instanceof Error ? err.message : 'ส่งข้อความไม่สำเร็จ');
      window.setTimeout(() => setError(null), 3500);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const backTo = role ? HOME_BY_ROLE[role].replace('/dashboard', '/activities') : '/';

  if (loading) return <div className="chat__state">กำลังเปิดห้องแชท...</div>;

  if (!room) {
    return (
      <div className="card chat__state chat__state--card">
        <i className="ri-lock-2-line"></i>
        <p>{error ?? 'ไม่สามารถเปิดห้องแชทได้'}</p>
        <button type="button" className="btn btn--secondary" onClick={() => navigate(-1)}>กลับ</button>
      </div>
    );
  }

  let lastDay = '';

  return (
    <div className="chat">
      <header className="chat__head">
        <Link to={backTo} className="btn btn--ghost btn--sm" aria-label="กลับ">
          <i className="ri-arrow-left-line"></i> <span>กลับ</span>
        </Link>
        <div className="chat__title">
          <h1>{room.title}</h1>
          <span className="chat__members">ห้องแชทคอร์ส · เฉพาะผู้ฝึกสอนและสมาชิกที่อนุมัติแล้ว</span>
        </div>
        <span className={`chat__live ${live ? 'on' : ''}`} title={live ? 'เชื่อมต่อแบบเรียลไทม์' : 'โหมดสำรอง: ตรวจข้อความใหม่ทุก 5 วิ'}>
          <span></span>{live ? 'Live' : 'Polling'}
        </span>
      </header>

      <div className="chat__list" ref={listRef}>
        {messages.length === 0 && (
          <div className="chat__empty">
            <i className="ri-chat-smile-2-line"></i>
            <span>ยังไม่มีข้อความ — เริ่มทักทายผู้ร่วมคอร์สได้เลย</span>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          const trainer = m.role === 'trainer';
          const day = dayKey(m.created_at);
          const showDay = day !== lastDay;
          lastDay = day;
          const name = `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim() || (trainer ? 'ผู้ฝึกสอน' : 'สมาชิก');
          return (
            <div key={m.id}>
              {showDay && <div className="chat__day"><span>{fmtDay(m.created_at)}</span></div>}
              <div className={`chat__row ${mine ? 'chat__row--me' : ''}`}>
                {!mine && (
                  <span className={`chat__avatar ${trainer ? 'chat__avatar--trainer' : ''}`} aria-hidden="true">
                    {name.charAt(0)}
                  </span>
                )}
                <div className={`chat__bubble ${mine ? 'chat__bubble--me' : ''} ${trainer && !mine ? 'chat__bubble--trainer' : ''}`}>
                  {!mine && (
                    <div className="chat__name">
                      {name}
                      {trainer && <span className="chat__tag">ผู้ฝึกสอน</span>}
                    </div>
                  )}
                  <div className="chat__text">{m.message}</div>
                  <div className="chat__time">{fmtTime(m.created_at)}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {error && <div className="chat__error" role="alert">{error}</div>}

      {room.can_send ? (
        <form className="chat__compose" onSubmit={send}>
          <textarea
            className="chat__input"
            rows={1}
            maxLength={chat.CHAT_MAX_LEN}
            placeholder="พิมพ์ข้อความ… (Enter ส่ง · Shift+Enter ขึ้นบรรทัดใหม่)"
            value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`; }}
            onKeyDown={onKeyDown}
            disabled={sending}
          />
          <button type="submit" className="btn btn--primary" disabled={!input.trim() || sending} aria-label="ส่ง">
            <i className="ri-send-plane-fill"></i>
          </button>
        </form>
      ) : (
        <div className="chat__closed"><i className="ri-lock-line"></i> คอร์สนี้ปิดแล้ว — อ่านประวัติได้ แต่ส่งข้อความไม่ได้</div>
      )}
    </div>
  );
}
