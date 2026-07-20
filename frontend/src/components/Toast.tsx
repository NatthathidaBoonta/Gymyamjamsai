/**
 * Toast.tsx — ข้อความแจ้ง (success/error) ปรากฏชั่วครู่แล้วหายไป
 * ใช้ร่วมกับ useToast() hook
 */

import { useEffect, useState } from 'react';
import './Toast.css';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss?: () => void;
}

function Toast({ message, type = 'info', duration = 4000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button
        className="toast__close"
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
        aria-label="ปิด"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
