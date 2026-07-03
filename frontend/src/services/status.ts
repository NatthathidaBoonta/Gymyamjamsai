/**
 * src/services/status.ts
 *
 * Status API Service
 * เรียกใช้ /api/status Endpoint
 */

import api from './api';

export interface ServerStatus {
  success: boolean;
  status: string;
  message: string;
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  database: {
    connected: boolean;
    provider: string;
    error: string | null;
  };
}

/**
 * ดึงสถานะการทำงานของ Backend Server
 */
export const getServerStatus = async (): Promise<ServerStatus> => {
  const response = await api.get<ServerStatus>('/api/status');
  return response.data;
};
