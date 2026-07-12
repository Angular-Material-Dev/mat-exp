# Each major version is served from its own subdomain via Vercel branch deployments

The docs site must present version-accurate documentation for each major library release — including a fully functional Playground built against that version's components. Any approach that serves multiple versions from a single Angular bundle cannot satisfy this requirement, because the Playground embeds live Angular components from the library.

We chose Vercel branch deployments: each major version lives on a long-lived `N.x.x` branch (e.g. `1.x.x`, `2.x.x`) following the semantic-release maintenance branch naming convention. Vercel deploys each such branch as an independent deployment. A custom subdomain (`v1.expressive.angular-material.dev`, `v2.…`) is assigned manually once in Vercel project settings after the first branch deployment. `main` is always "Latest" at `expressive.angular-material.dev`.

Version identity is a build-time constant (`environment.version`): empty string on `main`, `"v1"` on the `1.x.x` branch, etc. A GitHub Actions workflow (`.github/workflows/version-snapshot.yml`) fires on `release: published` events for major-version tags (`v*.0.0`). It cuts the `N.x.x` branch from the release commit, sets `environment.version` in `environment.prod.ts`, and appends the version identifier to `public/versions.json` on `main`. The `VersionsService` on `main` fetches this list at runtime to populate the Version Switcher. The Deprecation Banner is baked into prerendered HTML at build time from the non-empty `environment.version` value.

## Considered Options

- **Single Vercel deployment with `/vN/` path prefixes**: all versions served from one Angular app, with the router recognising a `/v1/`, `/v2/` prefix segment and loading version-specific content from `public/versioned-docs/vN/`. Implemented in PR #32, then reverted by PR #44 (issue #35). This approach fails the version-accurate Playground requirement: a single Angular bundle can only embed one version of the library. It also adds routing complexity (prefix-stripping, redirect rules) and makes `public/versioned-docs/` a growing snapshot tree in the repository.
- **Separate Vercel projects per version**: each major version is its own Vercel project with its own Git repository or monorepo configuration. Avoids custom domain configuration within a shared project but multiplies project management overhead and breaks the single-repo workflow.

## Consequences

Each Version Branch is fully independent: its Angular bundle, Playground, prerendered HTML, and Pagefind index are all built against that version's library code. The Angular app itself has no version-aware routing — there are no `/vN/` prefix segments to parse or strip anywhere in the app. Switching versions performs a full cross-domain redirect (handled by `VersionSwitcherComponent`).

The `N.x.x` branch naming aligns with semantic-release's maintenance branch convention, so future patch releases on a version branch can be automated with standard tooling. Future doc patches for a shipped version are committed directly to that branch's deployment — there is no copy or merge back to `main`.

The one ongoing manual step is assigning a custom subdomain in Vercel project settings after a new `N.x.x` branch is first deployed. This is a one-time action per major version.

## Update: superseded

As part of the MIT OSS relicense, we dropped Vercel entirely (deploying to GitHub Pages instead) and, with it, the versioned-subdomain strategy this ADR describes — no `N.x.x` maintenance branch had ever been cut, so the machinery was unused in practice. There is now exactly one live deployment ("Latest," from `main`); developers who need a prior major version's docs read them directly on GitHub via that release's tag or branch instead of a redeployed site. `VersionsService`, `VersionSwitcherComponent`, `DeprecationBannerComponent`, `public/versions.json`, `.github/workflows/version-snapshot.yml`, and `scripts/local-version-snapshot.sh` were all deleted; `environment.version` was removed from `src/environments/environment*.ts`.
