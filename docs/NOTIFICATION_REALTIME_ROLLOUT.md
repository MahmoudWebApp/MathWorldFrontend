# MathWorld — foreground notification realtime rollout

**Status: development PRs only.** Backend PR #20, Web PR #18, Flutter PR #12. Do not merge, run production migrations, deploy, enable Netlify builds, or enable payment without approval.

## What is implemented

- `GET /api/notifications/stream`: authenticated Server-Sent Events (SSE) endpoint. The JWT is in the `Authorization: Bearer` header, **never a query parameter or redirect**.
- `NotificationStreamBroker`: bounded, single-process, per-user listener registry. Sends only `event: inbox` / `data: {}`. A signal is an invalidation hint, **not** a notification's title, body, owner identity, or an entitlement grant.
- Server signals are emitted **after the DB write or transaction commit**, including manual admin messages, achievement milestone notices, admin subscription changes, Premium gift redemption, verified settlement (once a provider is integrated), and marking a notice/entire inbox as read. No signal is published for a failed command.
- Web: a single foreground SSE connection per authenticated account, with AbortController cancellation on hidden tab/logout/token switch, 5-minute server reconnection, bounded backoff on transient failures, and RTK Query `Inbox` tag invalidation. The existing 60-second foreground-only poll and reconnect/focus refresh remain.
- Flutter: a foreground SSE connection hosted by `MainShell`, with token retrieved from secure storage, request redirects disabled, auto-reconnect, and Riverpod inbox/page invalidation. It pauses when the app backgrounds and falls back to 60-second in-app polling.
- No third-party realtime SaaS, extra library dependency, browser push permission, ad SDK or payment integration was added.

## Important architectural limitations

1. **SSE is foreground in-app realtime, not phone push.** It cannot wake a force-quit/suspended Android or iOS app. True lock-screen push requires FCM/APNs, platform credentials, explicit opt-in and device-token lifecycle work.
2. The broker is **per backend process**. All connected students receive events only if their HTTP stream and the commit run in the same ASP.NET process. Before scaling to multiple Render/VPS replicas, add a distributed PostgreSQL LISTEN/NOTIFY or Redis backplane, or transition to SignalR with an appropriate backplane.
3. Signal delivery is best effort, not a durable queue. If a user reconnects or misses an event, the client must fetch the authoritative 30-day inbox; the DB remains the single source of truth.
4. SSE auth is rechecked during stream lifetime. Streams end after five minutes or sooner when JWT expires; disabled users lose streaming access. The streaming HTTP request is canceled when the tab becomes hidden or the app backgrounds.
5. Testing must confirm long-lived stream support and buffering policies on the staging HTTP proxy before rollout. A proxy that buffers SSE leaves polling fallback in place.

## Staging acceptance checklist (not executed in production)

1. Apply schema migrations **only on disposable PostgreSQL staging**; no DB migration was required for SSE itself.
2. Run backend PostgreSQL integration tests, especially `integration_editorial_notifications.py` (authenticated stream, committed admin notice, content-free SSE frame) and the PolicySmoke private-listener tests.
3. Log in as student A in two browser tabs and Android/iOS. Have admin send a private notice; only A's unread dot should update immediately. Student B should see nothing. Acknowledge the notice in one tab and verify other foreground tabs update.
4. Turn off internet and restore it; ensure the normal inbox still loads after recovery. Hide browser tab/background mobile app; verify no long-running notification stream remains. On resume, unread counts reconcile.
5. Verify actual Render/VPS reverse proxy forwards `Content-Type: text/event-stream` with no buffering or redirect. No real-time guarantee if hosting sleeps.
6. Verify RTL/LTR, dark/light and tablet/phone compact notification views; no stale content appears after account switch or logout.

## Outstanding notification work

- Background mobile pushes (FCM/APNs), notification permission and device-registration storage, store signing and test devices.
- Distributed realtime backplane if the API will run with multiple replicas.
- Delivery/latency metrics, load testing, retry/cancellation telemetry, production alerting and privacy/retention policy.
