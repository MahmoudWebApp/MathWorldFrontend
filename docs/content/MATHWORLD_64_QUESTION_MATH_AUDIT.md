# MathWorld initial 64 draft questions — mathematical QA notes

**Reviewed:** 2026-11-15 on the Next.js feature branch. **Status: draft only.**
Files: `mathworld-initial-32-questions.csv` and `mathworld-next-32-questions.csv`.

## What was inspected

All 64 English math prompts, explanations, four answer options and indexed
correct answers were inspected across the four seeded stages and 16 categories.
The answer keys matched the intended computations for the elementary arithmetic,
linear equations, geometry, statistics, basic calculus, algebra, linear algebra,
ODEs and limits represented in these draft rows. This is a **content review**,
not runtime integration proof or an independent curriculum accreditation.

- **32 + 32 rows** with four options per row and index 1..4.
- **16 categories**, four questions per existing category, for a very small
  initial corpus (not sufficient for a full public launch).
- **One ambiguity fixed:** `s1_dat_04` implied disjoint apple/banana groups
  in the English prompt, while the Arabic wording could allow students to
  belong to both groups. The Arabic prompt now explicitly says they are
  distinct groups.
- Geometry problems requesting an area or angle often offer only **numeric**
  options (without repeated units); acceptability and rendering should be
  checked during editorial preview.
- Some answer options contain LaTeX fractions and exponents. **Verify the
  published question renderer** in Arabic RTL and English LTR before approval.
- Differential equations and trigonometric limits implicitly use conventional
  educational domains; curriculum grade placement still needs educator review.

## Release acceptance — still required

1. Confirm the 16 category IDs and their stage mapping in the actual migrated
   staging database; import as an **unpublished editorial draft**, never direct
   production insertion.
2. Open both 32-row batches using the protected Admin draft preview; visually
   inspect math rendering, Arabic terms, option direction, formulas and units.
3. An educational reviewer validates age/grade suitability, every Arabic
   translation, local curriculum coverage, explanation clarity and distractors.
4. Check duplicate questions against **existing database content** and any
   planned curriculum, not merely these two CSV files.
5. Use explicit draft approval + publish with admin account in staging;
   confirm new problem/option records, correct-option semantics, Free category
   access and historical progress remain sound.
6. Add enough accepted questions for the expected student session depth, stage
   journey and achievement thresholds before launch.

**No approved or published data has been changed by this QA document.**
