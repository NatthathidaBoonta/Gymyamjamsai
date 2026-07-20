import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section style={{ textAlign: 'center', padding: 'var(--space-xl) var(--space-md)' }}>
      <h1>404 — ไม่พบหน้าที่ค้นหา</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
        หน้าที่คุณเปิดอาจถูกย้ายหรือไม่มีอยู่ในระบบ
      </p>
      <Link to="/" className="btn btn--primary">
        กลับหน้าแรก
      </Link>
    </section>
  );
}

export default NotFound;
