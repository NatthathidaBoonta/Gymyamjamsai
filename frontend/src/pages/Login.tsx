/**
 * src/pages/Login.tsx
 *
 * Login / Register Page
 * จัดการ Tab switching ระหว่าง Login และ Register
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login, register, saveAuthData } from '../services/auth';
import { getMyProfile } from '../services/profile';
import './Login.css';

type TabMode = 'login' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<TabMode>(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  /** หลัง Login/Register สำเร็จ — เช็คว่ามี Profile แล้วหรือยัง ถ้ายังให้ไป Onboarding ก่อน */
  const redirectAfterAuth = async () => {
    try {
      const profileRes = await getMyProfile();
      navigate(profileRes.data ? '/' : '/profile', { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  };

  const handleTabChange = (tab: TabMode) => {
    setMode(tab);
    resetMessages();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const res = await login({ email, password });
        saveAuthData(res.data.token, res.data.user);
        await redirectAfterAuth();
      } else {
        const res = await register({ email, password, name });
        saveAuthData(res.data.token, res.data.user);
        setSuccess('Account created! Redirecting...');
        setTimeout(() => redirectAfterAuth(), 1000);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string; errors?: string[] } } };
      const msg =
        axiosError?.response?.data?.errors?.join(', ') ||
        axiosError?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Something went wrong');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">🏋️</span>
          <div className="login-logo-title">Gymyamjamsai</div>
          <div className="login-subtitle">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </div>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Login
          </button>
          <button
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Name (optional)
              </label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`form-input ${error && password !== confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <div className="login-message error">⚠️ {error}</div>}
          {success && <div className="login-message success">✅ {success}</div>}

          <button
            id="login-submit-btn"
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Processing...' : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
