# Frontend Integration Changes

## API integration

- Added `NEXT_PUBLIC_API_BASE_URL` environment configuration.
- Standardized backend envelope unwrapping in the shared RTK Query base query.
- Normalized API error responses.
- Added automatic local logout handling for HTTP 401 responses.
- Changed problem search to use PostgreSQL by default.
- Updated problem and answer DTOs to match the current backend contract.
- Updated list and admin user queries to consume unwrapped response data.
- Removed unsupported user update, delete, activate, and deactivate calls from the frontend.

## Problem attempts

- Restored the previously selected option when reopening a problem.
- Distinguished attempted problems from correctly solved problems.
- Prevented a second attempt after either a correct or incorrect submission.
- Displayed the selected wrong option in red and the correct option in green.
- Displayed detailed solutions after any completed attempt.

## Authentication

- Removed token logging and legacy role-cookie authorization.
- Validated JWT structure and expiration in middleware.
- Read the role from the signed JWT payload.
- Centralized session cookie persistence and removal.
- Cleared RTK Query caches on logout.

## RTL and math rendering

- Standardized directional icons with RTL transforms.
- Improved mixed Arabic, English, and LaTeX rendering.
- Preserved line breaks in rich math text.
- Added a safe fallback for invalid LaTeX expressions.
- Confirmed that problem titles, questions, solutions, options, and activity titles use shared math renderers.

## Project maintenance

- Added a `typecheck` script.
- Removed explicit `any` usages from TypeScript source files.
- Added English comments for updated code.
- Standardized the project on the existing pnpm lockfile.
