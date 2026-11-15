# MathWorld — 128-question bilingual content gate

**Checked on:** 2026-11-15  
**State:** Development-only CSV drafts. **No import, staging mutation, production publication, or learner-facing content change.**

## Draft inventory and current depth

| Source CSV | Questions | Category scope | Status |
| --- | ---: | --- | --- |
| `mathworld-initial-32-questions.csv` | 32 | 16 existing category IDs | Draft |
| `mathworld-next-32-questions.csv` | 32 | Same 16 existing IDs | Draft |
| `mathworld-proposed-categories-32-question-drafts.csv` | 32 | 16 new category keys | Proposed |
| `mathworld-proposed-categories-next-32-question-drafts.csv` | **32 new** | Same 16 proposed keys | Proposed |
| **All files** | **128** | **32 categories across 4 stages** | Unpublished |

Category definitions are proposals in `mathworld-proposed-16-new-categories.csv`, **not database IDs**. Current draft coverage is **32 questions per educational stage, four per category**, and does **not** meet the agreed minimum of ten vetted problems per learning level/category. The count is of authored drafts, not publicly available questions.

## Verified structural inspection

A quote-aware CSV read of all four question files and the 16-category metadata file found:

- 32 rows in each question file and 16 metadata rows; no bad column widths.
- 128 unique `ContentKey` values and no exact repeated English prompts across the files.
- Every question has nonempty Arabic/English prompts and worked explanations.
- Four distinct, nonempty options and a single 1-based correct-option index from 1 through 4.
- All proposed-category keys map to the expected stage IDs.
- Every existing category and proposed category now has exactly four **draft** questions.

The inspection compares option text without removing mathematical signs; deleting symbols such as `-`, `+`, `<` or `>` creates false duplicate reports for inequations, signed answers and complex numbers.

## Editorial math/content risks to review

The added 32 drafts have authored stepwise solutions in Arabic and English for fractions, percentages, arithmetic progressions, time and change, trigonometry, statistics, analytic coordinates, inequalities, vectors, probability, graph transformations, numerical methods, discrete mathematics, optimization and complex numbers. Their answer indices were inspected alongside these explanations, but **no independent teacher/curriculum approval is claimed**.

The first structural review found two repeated English prompts in the new CSV (`stage2_trig_q4`, `stage3_vectors_q4`). Both were replaced with distinct exercises (tangent at 45 degrees; a different signed dot product); a second cross-file structural review found **zero duplicate English prompts**.

Before editorial approval:

1. Confirm grade-level suitability for all four educational stages; the exact national curriculum is still undecided.
2. Review mathematical correctness, uniqueness, plausible distractors and Arabic terminology **independently**.
3. Inspect Arabic RTL, negative values and inequality direction for `stage2_ineq_q3/q4`, and vector/coordinate notation on web + Flutter.
4. Check formula rendering including `√`, superscripts, Unicode inequality signs, negative numbers and time strings on small devices; consider supported LaTeX equivalents if the current math parser needs them.
5. Compare against **the real staging database** for semantic duplicates, verify current category IDs 1–16 and mapping of proposed keys to newly approved IDs.
6. Expand category/level coverage toward ten or more vetted problems, with a robust long-term content pipeline rather than publishing unreviewed filler.

## Safe import workflow

1. Approve the new category names and mapping first, preserving IDs and historical attempts.
2. Preview category CSV via protected Admin import review; store unpublished editorial drafts only.
3. Convert the proposed-category question files to confirmed numeric category IDs **only after** category approval, in the editorial import workflow. These proposed CSVs do not directly match the legacy numeric CategoryId import contract.
4. Inspect all question options, correct answers, solutions, and translation UI in staging; run duplicate checks across the database and batch files.
5. Require an explicit educator/admin approval step and protected publishing action; confirm Free access to two stage-specific categories, unlimited attempts there, Premium all categories.
6. Run migration and content tests on a disposable/staging database before any production action.

**Status:** structural audit passed; educational review, staging acceptance, and publication pending. The checkout/ads/tutor features remain disabled.
