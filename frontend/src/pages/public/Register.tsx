/**
 * Register.tsx — หน้าสมัครสมาชิก (เชื่อม POST /api/auth/register)
 * สมัครสำเร็จจะได้ role member และเข้าสู่ระบบทันที
 */

import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HOME_BY_ROLE } from '../../routes/navConfig';
import { ApiError } from '../../services/api';
import AuthWrapper from './AuthWrapper';
import './AuthForm.css';

const MIN_PASSWORD_LENGTH = 6;

function Register() {
  const { register, isAuthenticated, role, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated && role) {
    return <Navigate to={HOME_BY_ROLE[role]} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    // ตรวจฝั่ง client ก่อน ลดการยิง API ที่รู้ผลอยู่แล้ว
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`);
      return;
    }
    if (password !== confirm) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    setSubmitting(true);
    try {
      const newRole = await register(email.trim(), password);
      navigate(HOME_BY_ROLE[newRole], { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthWrapper>
      <section className="auth">
        <h1 className="auth__title">สมัครสมาชิก</h1>
        <p className="auth__subtitle">สร้างบัญชีเพื่อเริ่มต้นติดตามการออกกำลังกาย</p>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="auth__field">
          <label className="auth__label" htmlFor="confirm">
            ยืนยันรหัสผ่าน
          </label>
          <input
            id="confirm"
            className="auth__input"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn--primary auth__submit" disabled={submitting}>
          {submitting ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
      </form>

      <p className="auth__switch">
        มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
      </p>
    </section>
    </AuthWrapper>
  );
}

export default Register;
