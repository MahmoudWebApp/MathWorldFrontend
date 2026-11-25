'use client';

import { useEffect } from 'react';
import { API_BASE_URL } from '@/store/api/baseQuery';

/**
 * A privacy-minimal foreground heartbeat: not a precise login/logout tracker.
 * Mounted only for authenticated students. The server validates the JWT,
 * account status and role, and measures time with its own clock.
 */
export function StudentPresenceHeartbeat({ token }: { token: string }) {
  useEffect(() => {
    const sessionId = crypto.randomUUID();
    let lastSent = 0;
    let stopped = false;
    let inFlight = false;
    let failureDelay = 0;
    let disabled = false;
    const report = async () => {
      if (stopped || disabled || inFlight || document.visibilityState !== 'visible') return;
      // Avoid bursts when a browser fires focus and visibilitychange together.
      if (Date.now() - lastSent < Math.max(25_000, failureDelay)) return;
      lastSent = Date.now();
      inFlight = true;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      try {
      const response = await fetch(`${API_BASE_URL}/users/presence/heartbeat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        redirect: 'error',
        signal: controller.signal,
        body: JSON.stringify({ SessionId: sessionId }),
      });
      if (response.status === 401 || response.status === 403) disabled = true;
      if (!response.ok) throw new Error('Presence unavailable');
      failureDelay = 0;
      } catch {
        failureDelay = Math.min(Math.max(failureDelay * 2, 120000), 300000);
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
      }
    };

    void report();
    const interval = window.setInterval(report, 60_000);
    document.addEventListener('visibilitychange', report);
    window.addEventListener('focus', report);
    return () => {
      stopped = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', report);
      window.removeEventListener('focus', report);
      // Best effort only; network and tab shutdown may prevent delivery.
      if (!disabled && failureDelay === 0) void fetch(`${API_BASE_URL}/users/presence/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        keepalive: true,
        cache: 'no-store',
      }).catch(() => {});
    };
  }, [token]);

  return null;
}
