# MathWorld — 96-question bilingual editorial readiness gate

**Checked:** 2026-11-15  
**Scope:** draft CSV assets on the Next.js development branch only.  
**Status:** structurally checked; **NOT approved, migrated, imported, or published**.

## Inventory

| CSV | Draft questions | Categories | State |
| --- | ---: | ---: | --- |
| `mathworld-initial-32-questions.csv` | 32 | 16 existing | Draft |
| `mathworld-next-32-questions.csv` | 32 | Same 16 existing | Draft |
| `mathworld-proposed-categories-32-question-drafts.csv` | 32 | 16 proposed | Proposed |
| **Total** | **96** | **32** (16 existing + 16 proposed) | **Unpublished** |

The proposed category metadata resides in `mathworld-proposed-16-new-categories.csv`. Stages **1, 2, 3 and 4 each have 24 drafted questions** (16 for existing categories, 8 for proposed ones). Existing categories currently have **four** drafted questions each; new proposed categories have **two** each. These drafts do **not** satisfy the requirement for a deeper, reviewed problem bank (minimum ten problems per level).

## CSV structural inspection

A CSV-aware parse (including quoted commas and BOM handling) found:

- 32 + 32 + 32 question rows and 16 proposed category metadata rows.
- No column-width errors, missing Arabic/English prompt or detailed solution, empty options, repeated options inside a question, repeated `ContentKey`, or duplicate English prompts across the 96 rows.
- Every `CorrectOption` is an integer from 1 through 4.
- Each of the 16 proposed categories has exactly two draft questions.
- Every proposed question's category key exists in the proposed category table and maps to the same `StageId`.

These are structural checks, **not** independent mathematical verification, publisher acceptance, or database uniqueness proof.

## Mathematical and language review

The first 64 questions have a separate mathematical QA note in
`MATHWORLD_64_QUESTION_MATH_AUDIT.md`.

The additional 32 proposed-category questions were inspected manually against their supplied English explanations and indexed keys. The intended results appear consistent for the sample fractions, percentages, number patterns, time arithmetic, introductory trigonometry, statistics, coordinates, linear inequalities (including reversing an inequality on division by a negative), analytic geometry, vectors, elementary probability/combinations, graph transformations, Newton and bisection steps, set counting, optimization, and complex numbers. This manual inspection is not equivalent to an independent teacher's review.

**Specific editorial checks still required:**

1. Verify age appropriateness and curriculum placement, especially introductory trigonometry at stage 2 and numerical methods/discrete mathematics at stage 4. No national curriculum is assumed.
2. Check Arabic/English solution clarity and right-to-left rendering of coordinate pairs, negative numbers and inequality signs (`<`, `>`).
3. Inspect mixed Arabic/English distractors in `stage3_transform_q1` and `stage3_transform_q2`; their slash-separated bilingual choices may look crowded on mobile.
4. Preview each option and full worked solution with the real web and Flutter math renderer, including latex in the original 64-question files.
5. Run duplicate detection against **existing staging database questions**, not merely these CSVs.
6. Expand approved content toward at least ten problems per level/category as appropriate before broad release.

## Controlled publication gate

- First review and approve category labels/icons and 16 proposed category mappings.
- Add categories without changing existing category IDs or students' progress.
- Import question files into unpublished admin editorial drafts with strict preview, role authorization, and idempotency; never bulk-write directly to a live database.
- Obtain independent mathematical and bilingual educator sign-off; correct anything found during staging preview.
- Verify Free access to two admin-chosen categories **per stage**, with unlimited attempts in those categories, and all-category access for Premium.
- Stage-test after pending EF Core migrations are applied to a disposable database; preserve rollback and backup requirements.
- Publish only following explicit approval. Current feature-branch edits do not authorize production import or deployments.

**No production or staging data was changed by this audit.**
