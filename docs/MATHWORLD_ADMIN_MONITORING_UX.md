# MathWorld admin monitoring: simplified information architecture

Updated: 2026-11-15. Development branches only. No production deploy, schema migration or payment activation.

## One admin navigation, not two

The desktop navbar uses the existing **System Admin account dropdown**
as the only administration menu. The previous top-level
"إدارة المنصة / Administration" mega-menu is removed.
On narrow screens, the existing mobile drawer remains the sole admin menu.

Admin-facing routes are intentionally separated:

| Route | Purpose | Not shown |
| --- | --- | --- |
| `/admin` | High-level new registrations, people practicing, daily active learners, per-stage adoption | Individual answers |
| `/admin/engagement` | Interactive stage selection, category activity chart, top student in each category, stage leaderboard | Correct vs incorrect answer clutter |
| `/admin/engagement/students` | Searchable learner directory: created at, last successful login, last recorded practice, attempts | Invented logout time |
| `/admin/audit` | Timestamped successful server-observed commands; filter by student/admin, user ID and period | Passwords, response bodies, full answer text |
| `/admin/users` | User management and individual details; separated from monitoring | Main monitoring metrics |
| `/admin/stages`, `/admin/categories`, `/admin/problems` | Editorial authoring | Live adoption dashboard |

## Activity and ranking definitions

- **New students:** created student accounts within the selected date window.
- **Active student:** distinct student with at least one saved practice attempt in the selected period. This is not a live socket/presence count.
- **Last login:** last *successful server-recorded login*, when available; an auth failure is not a login.
- **Last practice:** latest saved problem attempt, never a proxy for session end.
- **Top solvers:** distinct problems with saved solved progress, across all history, not the number of attempts or correct-answer percentage. UI must clearly show **all-time** rankings independently of the selected activity window.
- **Category usage:** distinct learners with attempts in that category within the selected time window. A learner practicing two categories contributes to each category, so summing category counts does not yield unique people in the whole stage.
- **Logout:** a browser tab/app being closed does **not** produce a reliable explicit logout event. A complete session-presence system requires an authenticated presence heartbeat, session identifiers, expiry, explicit logout, and appropriate data minimization.
- **Audit:** database activity events begin when the required migration/instrumentation is deployed. Successful admin and selected student command endpoints are recorded after execution, plus explicit login/registration. Historic unrecorded actions cannot be retroactively recreated. These best-effort records are not a tamper-proof legal audit or a transactional event store.

## Geometric visual direction

- Preserve MathWorld's purple logo, typography, accessibility and overall identity.
- Four stage palettes: **cyan, orange, emerald and violet**. Use icons and stage names as redundant cues (never rely on colors alone).
- Web stage cards use lightweight original SVG geometry. Flutter stage and stage-selection cards use shared mathematical line-art painters: circles/radii, triangle, nested squares and overlapping ellipses.
- Background symbols are subtle, non-interactive and excluded from screen-reader semantics. Avoid unnecessary animation, dense dashboards and excessive decorative layers.
- Review contrast in both light and dark modes, Arabic RTL and English LTR, at narrow widths and with enlarged text.

## Remaining release checks

1. Real staging PostgreSQL migration rehearsal for `PlatformActivityEvents`, integration tests for the admin-only endpoints and middleware action coverage; verify data minimization and log retention policy.
2. Physical-device web/Android/iOS review of chart labels, arrows, geometric cards, contrast and large text.
3. Decide whether a genuine online-presence/heartbeat feature is necessary before claiming a user is "online now" or recording automatic "left at" timestamps.
4. Confirm notifications, exports, Google OAuth configuration, full educational content approval, backups and release signing. Payment selection remains **deferred**.
