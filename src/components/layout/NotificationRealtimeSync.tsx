'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { notificationsApi } from '@/store/api/notificationsApi';
import { API_BASE_URL } from '@/store/api/baseQuery';

/**
 * Foreground-only authenticated SSE. Payloads never include private content:
 * the server signals "inbox" and RTK Query re-fetches the JWT-owned inbox.
 * Existing 60s polling remains a safety net during rollout/disconnects.
 * No third-party realtime service or paid infrastructure required.
 */
export function NotificationRealtimeSync({ token }: { token: string }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let stopped = false;
    let running = false;
    let controller: AbortController | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let backoffMs = 5000;
    let lastRefresh = 0;

    const refresh = () => {
      const now = Date.now();
      if (now - lastRefresh < 750) return;
      lastRefresh = now;
      dispatch(notificationsApi.util.invalidateTags(['Inbox']));
    };

    const connect = async () => {
      if (stopped || running || document.visibilityState !== 'visible') return;
      running = true;
      controller = new AbortController();
      let connectedAt = 0;
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/v2/stream`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
          },
          cache: 'no-store',
          redirect: 'error', // Never forward bearer tokens to redirected origins.
          signal: controller.signal,
        });
        // A signed-out, revoked or expired session never opens a stream.
        if ([401, 403, 404, 405].includes(response.status)) {
          // Unauthenticated sessions or an older backend without SSE:
          // keep the existing poll fallback instead of retrying pointlessly.
          stopped = true;
          return;
        }
        if (!response.ok || !response.body ||
            !response.headers.get('content-type')?.includes('text/event-stream')) {
          throw new Error('Notification stream unavailable');
        }
        connectedAt = Date.now();
        refresh(); // Reconcile messages that arrived while disconnected.
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let pending = '';

        while (!stopped && document.visibilityState === 'visible') {
          const chunk = await reader.read();
          if (chunk.done) break;
          pending += decoder.decode(chunk.value, { stream: true });
          pending = pending.replace(/\r\n/g, '\n');
          // The server emits no user data, and a broken proxy must not grow RAM.
          if (pending.length > 8192) throw new Error('Oversized SSE frame');
          let index = pending.indexOf('\n\n');
          while (index !== -1) {
            const frame = pending.slice(0, index);
            pending = pending.slice(index + 2);
            if (frame.split('\n').some(line => line.trim() === 'event: inbox')) refresh();
            index = pending.indexOf('\n\n');
          }
        }
      } catch {
        // Keep standard foreground polling as a fallback. Do not interrupt UI.
      } finally {
        running = false;
        controller = null;
        if (!stopped && document.visibilityState === 'visible') {
          // Short-lived streams and server outages must not generate a reconnect storm.
          if (connectedAt && Date.now() - connectedAt >= 60000) backoffMs = 5000;
          const delay = backoffMs + Math.floor(Math.random() * 1500);
          retryTimer = setTimeout(() => void connect(), delay);
          backoffMs = Math.min(backoffMs * 2, 120000);
        }
      }
    };

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') {
        if (retryTimer) clearTimeout(retryTimer);
        controller?.abort();
      } else {
        if (retryTimer) clearTimeout(retryTimer);
        void connect();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    void connect();
    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      controller?.abort();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [dispatch, token]);

  return null;
}
