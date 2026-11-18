# MathWorld — 320 bilingual question drafts: curriculum acceptance gate

**Feature-branch checkpoint:** 2026-11-15.  
**Release status:** **Drafts only / NOT educator-approved / NOT imported / NOT published.**

## Inventory and scope

| File | Draft questions | Notes |
| --- | ---: | --- |
| `mathworld-initial-32-questions.csv` | 32 | Legacy numeric category IDs 1–16 |
| `mathworld-next-32-questions.csv` | 32 | Same existing categories |
| `mathworld-existing-categories-96-expansion-drafts.csv` | 96 | Six additional questions per existing category |
| `mathworld-proposed-categories-32-question-drafts.csv` | 32 | 16 proposed category keys, not numeric IDs |
| `mathworld-proposed-categories-next-32-question-drafts.csv` | 32 | Additional proposed-category draft questions |
| `mathworld-proposed-categories-96-expansion-drafts.csv` | 96 | Six additional questions per proposed category |
| **Total** | **320** | **32 categories, ten drafts/category, 80 drafts/stage** |

Category proposals are defined in `mathworld-proposed-16-new-categories.csv`. All 16 proposed categories **still require curriculum approval and creation/mapping**. There are 160 questions for existing IDs and 160 for the proposed category keys, across four stage numbers, 80 questions per stage. This is *draft coverage*, not 320 actual available student questions.

## Automated structural gate

`scripts/validate-content-drafts.mjs` and `.github/workflows/content-draft-integrity.yml` enforce a dependency-free GitHub Actions check on content changes:

- Parse all seven CSVs with quoted-field, escaped-quote, BOM and CRLF support, and reject unclosed quotes and wrong column counts.
- Check 320 unique content keys and **no identical Arabic or English question text**, even across CSV batches.
- Check nonempty bilingual question/solution text, all four nonempty distinct answer options, a single 1-based correct-option index, and a positive integer point value.
- Reject mathematically equivalent **numeric** answer choices even if they have different strings, such as `1/2` and `2/4` or `50%` and `0.5`. This covers unambiguous numeric literals, simple fractions, percentages, and simple square roots. It does **not** prove the chosen answer is correct or detect equivalent symbolic expressions.
- Check all 16 existing category IDs belong to the expected stage, and each proposed-key category matches `mathworld-proposed-16-new-categories.csv`.
- Fail if any of the **32 categories** has fewer than **ten draft questions**, or if any stage falls below 80.
- Check `ReviewStatus=Proposed` for proposals; the validation **never imports or publishes**.

**Result observed on workflow `Bilingual curriculum draft integrity`**: passed on commit `10686a71382289d9d86d8d7004aa5ab13ed5e095`. Later docs-only commits must be checked on their respective SHA.

## Mathematical and instructional review REQUIRED

A structural CI pass **cannot** prove that the correct answer is actually correct, that its worked explanation is valid, that the distractors are pedagogically appropriate, or that the question belongs to the intended learner age and curriculum. Do not describe these 320 entries as independently teacher-reviewed or production ready.

A subject-matter reviewer must inspect **all 320** bilingual questions and, for each item, mark: grade appropriateness, mathematical derivation, uniquely correct option, Arabic/English equivalence, notation/formula rendering, and overlap with published database questions. Extra attention is needed for:

- RTL negative values and inequalities, fractions, superscripts, Arabic number punctuation and geometric coordinates.
- Higher-stage calculus, complex numbers, linear algebra, numerical methods and probability assumptions.
- Rich math rendering on both Next.js and Flutter with large font settings.
- Distinction between basic complex-number arithmetic and advanced **complex analysis** curriculum; rename or extend that category only with approved curriculum scope.
- Unicode math text (`√`, `²`, `≥`, `≤`, `π`, `−`, `∞`) and correct display in PDF/Excel if exported.

## Safe review → staging → publication workflow

1. Educator checks the **actual 320 problem prompts, options, and solution steps**; corrections are tracked by `ContentKey`, then re-run structural checks.
2. Map stage IDs and existing numeric category IDs against the live *staging* catalog; do not assume 1–16 remain correct in production.
3. Approve 16 proposed category names, icons and age-level placement. Create them through protected admin tooling on staging; map `ProposedCategoryKey` to actual new IDs only after that approval.
4. Convert draft sheets to the protected question-import schema, use **dry-run preview**, check duplicates against staging, and store only **unpublished editorial drafts**.
5. Examine every math rendering and option order in both languages in the admin editorial review queue.
6. Publish only after independent admin review and **explicit owner approval**, then confirm Free can practice unrestricted within the admin's two unlocked categories per stage, Premium sees all categories, and locked direct API requests fail.
7. Repeat migration, seeded content, and end-to-end tests in disposable/staging PostgreSQL before any production merge/deployment.

**Prohibited automatic steps:** production insert/migration, direct publication, changing student access policy, checkout, rewarded ads, and merging feature branches. No such action was taken in this batch.

## What is actually closed versus pending

**Closed in development:** structural coverage expanded to 10 drafts/category; duplicate prompt detection, stable keys, and automated content CI gate.  
**Pending external acceptance:** independent math/curriculum approval of all questions, real staging ID mapping/import, native Android/iOS device UI inspection, and owner-approved rollout. These are not coding defects but mandatory release gates.
