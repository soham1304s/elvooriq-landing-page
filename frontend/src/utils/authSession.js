import axios from 'axios';
import { socket } from '../socket/socketManager';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

/**
 * Perform a clean, audited logout.
 * Notifies the backend so it can record the exact logoutAt timestamp,
 * calculate total session duration, and update user statistics.
 */
export async function performLogout(reason = 'USER_ACTION') {
  const token = localStorage.getItem('elvooriq_token');
  const sessionId = localStorage.getItem('elvooriq_session_id');

  try {
    if (token) {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        { sessionId, reason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 4000
        }
      );
    }
  } catch (err) {
    console.warn('Notice: Backend logout notification could not complete:', err.message);
  } finally {
    // Notify socket rooms if connected
    if (socket && socket.connected) {
      socket.emit('auth:logout', { sessionId, timestamp: new Date().toISOString() });
    }

    // Clear client-side stored session tokens and timestamps
    localStorage.removeItem('elvooriq_token');
    localStorage.removeItem('elvooriq_session_id');
    localStorage.removeItem('elvooriq_login_time');
    localStorage.removeItem('elvooriq_user');
    sessionStorage.clear();

    // Redirect to login
    window.location.href = '/login';
  }
}

/**
 * Send heartbeat to backend to keep active session status updated.
 */
export async function sendSessionHeartbeat() {
  const token = localStorage.getItem('elvooriq_token');
  const sessionId = localStorage.getItem('elvooriq_session_id');

  if (!token || !sessionId) return;

  try {
    await axios.post(
      `${API_URL}/api/auth/heartbeat`,
      { sessionId },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000
      }
    );
  } catch (err) {
    // Non-blocking heartbeat failure
  }
}

/**
 * Format duration in seconds into human-readable string.
 * Example: 3665 -> "1h 1m 5s"
 */
export function formatSessionDuration(seconds = 0) {
  if (!seconds || seconds <= 0) return 'Just started';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}
