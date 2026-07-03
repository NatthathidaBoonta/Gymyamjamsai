/**
 * src/components/status/Status.tsx
 *
 * Backend Status Component
 * ดึงและแสดงสถานะการทำงานของ Backend Server
 */

import { useEffect, useState, useCallback } from 'react';
import { getServerStatus, type ServerStatus } from '../../services/status';
import './Status.css';

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export default function Status() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setFetchState('loading');
    }
    setErrorMsg('');

    try {
      const data = await getServerStatus();
      setStatus(data);
      setFetchState('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to server';
      setErrorMsg(message);
      setFetchState('error');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchStatus(), 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatTimestamp = (iso: string) => {
    return new Date(iso).toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // ---- Loading State ----
  if (fetchState === 'loading') {
    return (
      <div className="status-card">
        <div className="status-header">
          <div className="status-icon">📡</div>
          <span className="status-title">Server Status</span>
          <span className="status-badge loading">
            <span className="status-dot pulse" />
            Connecting...
          </span>
        </div>
        <div className="status-skeleton status-skeleton-line" style={{ width: '70%' }} />
        <div className="status-skeleton status-skeleton-line" style={{ width: '50%' }} />
        <div className="status-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="status-skeleton" style={{ height: 56, borderRadius: 10 }} />
          ))}
        </div>
      </div>
    );
  }

  // ---- Error State ----
  if (fetchState === 'error') {
    return (
      <div className="status-card">
        <div className="status-header">
          <div className="status-icon">📡</div>
          <span className="status-title">Server Status</span>
          <span className="status-badge offline">
            <span className="status-dot" />
            Offline
          </span>
        </div>
        <div className="status-error">
          ⚠️ Cannot connect to backend: {errorMsg}
        </div>
        <button
          className="status-refresh-btn"
          onClick={() => fetchStatus(true)}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  // ---- Success State ----
  return (
    <div className="status-card">
      <div className="status-header">
        <div className="status-icon">📡</div>
        <span className="status-title">Server Status</span>
        {status && (
          <span className="status-badge online">
            <span className="status-dot pulse" />
            {status.status === 'ok' ? 'Online' : status.status}
          </span>
        )}
      </div>

      {status && (
        <>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-item-label">Environment</span>
              <span className="status-item-value">{status.environment}</span>
            </div>
            <div className="status-item">
              <span className="status-item-label">Version</span>
              <span className="status-item-value">v{status.version}</span>
            </div>
            <div className="status-item">
              <span className="status-item-label">Uptime</span>
              <span className="status-item-value">{formatUptime(status.uptime)}</span>
            </div>
            <div className="status-item">
              <span className="status-item-label">Last Check</span>
              <span className="status-item-value">{formatTimestamp(status.timestamp)}</span>
            </div>
          </div>

          <div className="db-status">
            <div
              className={`db-status-indicator ${status.database.connected ? 'connected' : 'disconnected'}`}
            />
            <span className="db-status-text">
              Database: <strong>{status.database.provider}</strong>{' '}
              — {status.database.connected ? '✅ Connected' : `❌ ${status.database.error}`}
            </span>
          </div>
        </>
      )}

      <button
        className={`status-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
        onClick={() => fetchStatus(true)}
        disabled={isRefreshing}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
}
