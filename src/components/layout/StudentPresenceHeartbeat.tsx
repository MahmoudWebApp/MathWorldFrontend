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
    const report = () => {
      if (stopped || document.visibilityState !== 'visible') return;
      // Avoid bursts when a browser fires focus and visibilitychange together.
      if (Date.now() - lastSent < 25_000) return;
      lastSent = Date.now();
      void fetch(`${API_BASE_URL}/users/presence/heartbeat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({ SessionId: sessionId }),
      }).catch(() => {
        // Presence is optional telemetry. Never interrupt math practice.
      });
    };

    report();
    const interval = window.setInterval(report, 60_000);
    document.addEventListener('visibilitychange', report);
    window.addEventListener('focus', report);
    return () => {
      stopped = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', report);
      window.removeEventListener('focus', report);
      // Best effort only; network and tab shutdown may prevent delivery.
      void fetch(`${API_BASE_URL}/users/presence/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        keepalive: true,
        cache: 'no-store',
      }).catch(() => {});
    };
  }, [token]);

  return null;
}
