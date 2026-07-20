/**
 * ToastContainer.tsx — ทั้งหมด toast ใน app จะ render ที่นี่
 * mount ที่ App.tsx root เพื่อให้ทุกหน้าใช้ได้
 */

import Toast from './Toast';

interface ContainerProps {
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
