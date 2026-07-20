/**
 * Login.tsx — หน้าเข้าสู่ระบบ (เชื่อม POST /api/auth/login)
 * เข้าสำเร็จแล้วจะพาไปหน้าแรกตาม Role หรือกลับหน้าที่ผู้ใช้ตั้งใจเปิดไว้ก่อนถูกเด้งมา
 */

import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HOME_BY_ROLE } from '../../routes/navConfig';
import { ApiError } from '../../services/api';
import './AuthForm.css';

function Login() {
  const { login, isAuthenticated, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // เข้าสู่ระบบอยู่แล้ว → ไม่ต้องเห็นหน้านี้อีก
  if (!isLoading && isAuthenticated && role) {
    return <Navigate to={HOME_BY_ROLE[role]} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedInRole = await login(email.trim(), password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? HOME_BY_ROLE[loggedInRole], { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth">
      <h1 className="auth__title">เข้าสู่ระบบ</h1>
      <p className="auth__subtitle">เข้าใช้งานระบบติดตามพัฒนาการการออกกำลังกาย</p>

      {error && (
        <p className="auth__error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth__field">
          <label className="auth__label" htmlFor="email">
            อีเมล
          </label>
          <input
            id="email"
            className="auth__input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth__field">
          <label className="auth__label" htmlFor="password">
            รหัสผ่าน
          </label>
          <input
            id="password"
            className="auth__input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn--primary auth__submit" disabled={submitting}>
          {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <p className="auth__switch">
        ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
      </p>
    </section>
  );
}

export default Login;
