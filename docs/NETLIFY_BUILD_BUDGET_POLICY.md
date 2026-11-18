# MathWorld — Netlify build budget protection (November 2026)

**Owner warning:** On 2026-11-14 Netlify warned that team `mahmoudTeam`
had used **75% of November 2026 monthly build minutes**. The notification
explicitly warned of team project suspension if the remaining quota is
exhausted before the monthly reset. Do not interpret 25% remaining as a
specific number of minutes unless the Netlify usage dashboard confirms it.

## Effective immediately

1. **No production deployment or PR preview is needed while coding.**
   Continue all changes on the development branches, with GitHub Actions
   typecheck/build/tests as the primary validation pipeline. Those runs are
   **GitHub Actions quota**, not proof that Netlify consumes zero minutes.
2. Web PR #18 has a `[skip netlify]` title marker to suppress Netlify Deploy
   Previews. **Also append `[skip netlify]` to every development-branch web
   commit message** while Netlify branch deployments might still be enabled.
   Do not use `[skip ci]`: it may suppress GitHub verification too.
3. Do not merge to the production branch, manually trigger a deploy,
   force redeploy, use build hooks, or repeatedly retry failed Netlify deploys
   during development.
4. Do not change the live site's Netlify settings, paid plan or billing limits
   without explicit owner action. A PR-title skip marker is not a guarantee
   against separately configured branch builds or production builds.
5. **Recommended owner UI action now:** in the MathWorld Netlify project,
   open `Project configuration > Developer settings > Continuous deployment >
   Build settings > Configure` and set **Build status: Stopped builds**.
   This prevents Netlify building the production branch, PR previews and
   branch deploys while keeping the last published deploy available.
   Before an owner-approved release, restore **Active builds**, which alone
   does not queue a new build.
6. If the owner wants production automatic builds to remain enabled, instead
   open `Project configuration > Developer settings > Continuous deployment >
   Branches and deploy contexts > Configure`, set **Branch deploys: None**
   and disable **Deploy Previews**. Production builds will still occur after
   pushes/merges to the designated production branch, so that branch is
   frozen until release.
7. Check actual team-wide Netlify usage before every release, including
   other projects in `mahmoudTeam`. If the account approaches the limit,
   defer Netlify deployments until the allowance resets, or obtain explicit
   approval for a different hosting/billing strategy.

## Release gate

- Merge only after GitHub build/tests and mobile QA pass.
- Prepare **one** owner-reviewed production change set, not dozens of
  microdeploys.
- Verify usage headroom before triggering the single production build.
- Follow previous backup, staging DB, rollout/rollback and app-signing
  requirements; no production migrations without explicit authorization.
- Netlify build minutes are a separate resource from GitHub Actions minutes.
- The existing planned VPS transition is still deferred until explicit
  subscription/domain approval; never presume free hosting is unlimited.

References:
- https://docs.netlify.com/build/configure-builds/stop-or-activate-builds/
- https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/
- https://docs.netlify.com/deploy/deploy-types/deploy-previews/
- https://docs.netlify.com/deploy/deploy-types/branch-deploys/
