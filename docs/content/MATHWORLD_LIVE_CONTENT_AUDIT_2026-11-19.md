# MathWorld content checkpoint — 19 November 2026

Status: **read-only verification and editorial preparation, not publication approval.**
Source: read-only SQL against the connected MathWorldDB Supabase PostgreSQL project,
plus the tracked six bilingual draft CSV files. No student, progress, content, or
subscription records were modified.

## Current published catalog

| Stage | Existing categories | Existing problems |
| --- | ---: | ---: |
| Elementary School | 4 | 18 |
| Middle School | 4 | 16 |
| High School | 4 | 16 |
| University | 4 | 16 |
| **Total** | **16** | **66** |

There are no existing categories with zero published problems at this checkpoint.
All 19 EF migrations listed in the database history are applied.

### Existing duplicate requiring history-safe correction

The English/Arabic text of problem IDs **3** and **4** in stage 1 is identical
(the apples subtraction question). This was confirmed from a normalized,
stage-scoped exact-text query, not inferred from the number of views.

- Problem **3** has **1 progress row and 1 attempt row**.
- Problem **4** has **2 progress rows and 2 attempt rows**.

**Never delete either ID, renumber problems, or rewrite attempts in a bulk content
import.** Decide with an educator whether one question may be edited into a
mathematically distinct vetted problem. If changing existing content would
misrepresent past attempts, preserve both histories and introduce a separate
safe publication/deprecation mechanism rather than deleting.

## 320-question editorial preparation

- All **320 unique ContentKeys** exist across six draft CSVs; 80 drafts per
  educational stage and 10 per intended category.
- 16 original categories (160 draft entries) and 16 proposed categories
  (160 draft entries). Some draft entries may already correspond to
  published questions; the full live-DB duplicate comparison must be performed
  before importing any batch.
- The new `mathworld-320-editorial-review-ledger.csv` has one row per
  ContentKey. Every field starts at **Pending**, never falsely approved.
- The existing validator checks format, duplicate prompts, basic numeric
  equivalence of options, category and stage mapping, and editorial coverage.
- An additional conservative spot audit of **8** unambiguous arithmetic
  expressions found no mismatched selected numeric answer. This is **not**
  mathematical verification of the remaining **312** questions.

## Acceptance gates before adding any content

1. Teacher checks arithmetic, algebra, geometry, advanced topics, the selected
   correct option, and every worked solution in both languages.
2. Approve and map 16 proposed category keys to real stage-specific IDs;
   preserve existing numeric category IDs.
3. Review every editorial-ledger row; record reviewer and corrections. The
   structural CI does not prove math correctness.
4. Compare both question languages and mathematical equivalence against the 66
   live records, not only the draft files.
5. Dry-run the protected editorial import into isolated PostgreSQL and
   confirm no duplicate, category mismatch or permissions regression.
6. Publish only approved questions after separate owner acceptance. Verify
   Free two-category access, Premium unrestricted access, search and reporting.
7. Keep live student attempts and problem history immutable.

**No content was published, and no production database write was performed.**
