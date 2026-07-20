# Locale consistency audit

Fixed localized RTK Query cache keys for:

- stages
- categories
- dashboard
- favorites
- solved problems
- error notebook
- problem attempt history

The active locale is now part of each query argument, so Arabic and English responses cannot share the same cache entry. Localized queries also refetch when mounted or when the locale argument changes. The favorites remove action uses logical positioning (`end-4`) for RTL/LTR consistency.
