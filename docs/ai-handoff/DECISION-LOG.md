# DECISION-LOG.md — Architectural decisions, reverse-engineered, with revisit triggers

> The repo already has formal ADRs in `docs/adr/` (0001–0006) — read those first; they are
> good. This log covers (a) decisions *not* written down anywhere, (b) my assessment of each,
> and (c) explicit triggers for when to revisit. Format: Decision → Why → Would I keep it? →
> Revisit when.

## D1. Augment Angular Material in place; never fork or wrap
Directives on `MatButton`/`MatIconButton`/`MatMenu` + token overrides + `.mdc-*` escape hatches.
**Why:** consumers keep their Material knowledge, a11y, and upgrade path; the library stays
small; "not a fork" is the core positioning (`what-is-mat-expressive/index.md`).
**Keep?** Yes — it's the product's identity and its lowest-maintenance option.
**Revisit when:** an Angular Material minor structurally renames `.mdc-*` internals (audit the
`properties:` maps in `lib/styles/**/tokens/` after every Material bump), or D8 fires.

## D2. `data-*` attributes as the styling contract (not classes, not CSS-only inputs)
**Why:** one contract serves both usage styles — plain HTML/CSS users write
`class="mat-expressive-button" data-size="m"`, directive users get typed inputs that stamp the
same attributes. Debuggable in devtools.
**Keep?** Yes. It's also what makes the docs' "two usages" story coherent.
**Revisit:** never seriously — this is load-bearing for everything.

## D3. Combinatorial SCSS generation from config lists
Per-size token files + config entry lists + a selector-building mixin (ARCHITECTURE.md §5).
**Why:** it makes the M3 spec transcription declarative and auditable, and `validate-config`
turns typos into build errors.
**Keep?** Yes, but it is the library's biggest cost center: verbose (≈40 SCSS files for six
button components), and it emits ~153 KB flat CSS for all-buttons. The structure is sound; the
output size and authoring burden need tooling (COMPONENT-FACTORY.md §9.1/§9.4,
ISSUES-TRIAGED.md #15).
**Revisit when:** component #10 lands (authoring pain compounds), or a customer complains
about CSS size — add size/appearance filtering options to the mixins before rewriting anything.

## D4. TS unions as single source of truth, SCSS whitelist generated
`scripts/generate-style-constants.ts` (issue #102).
**Why:** rename-safety across language boundaries. **Keep?** Unambiguously yes — extend the
same generation idea to token-name validation if Material bumps keep biting.

## D5. Options-bags via one deep DI factory (`matExpressiveCreateOptions`)
**Why:** collapses token+provider+inject ceremony (was three files, issue #100); merge
semantics down the injector tree give app-wide, route-level, and component-level defaults.
**Keep?** Yes. Reference implementation quality.

## D6. GSAP as the animation engine (with MorphSVG + CustomEase)
**Why:** M3 Expressive's spring-overshoot morphs are beyond Angular's animation DSL and CSS;
GSAP 3.13+ is fully free (post-Webflow acquisition) so the previously-paid MorphSVG plugin is
a normal npm dependency (peer `gsap: ^3.13.0`).
**Keep?** Yes, but note the cost: gsap is a ~70 KB peer that exists (today) for one component.
**Revisit when:** more animated components arrive (cost amortizes, good) or if a consumer
segment rejects the peer dep (offer a no-animation build? unlikely to matter).

## D7. Docs = custom Angular SSG, markdown-as-static-assets, Pagefind, subdomain versioning
ADRs 0001–0005 cover these; all reasonable, all shipped, e2e-tested.
**Keep?** Yes for the SSG/static-assets/Pagefind pieces. The subdomain-versioning piece
(ADR 0005) was reversed 2026-07-12 as part of the MIT OSS migration — see ADR 0005's
"Update: superseded" note — because no versioned branch had ever actually been cut, so the
revisit condition below never materialized. The one remaining structural risk: the docs app
consumes library styles **from source** (`src/styles/_base.scss:2`) — fine for DX, but it
removed the only consumer of the built package and let the packaging break invisibly. Keep the
source link for iteration speed, but the package smoke test (QUALITY-BAR.md §5 step 7) is the
non-negotiable compensating control.
**Revisit when:** n/a — versioning was removed rather than revisited.

## D8. THE EXISTENTIAL ONE: what happens when Angular Material ships M3 Expressive natively
Not written down anywhere in the repo; it must be. Reality: Google's Material team has shipped
M3 Expressive in Compose and it is progressively landing across Google products; Angular
Material historically follows the spec with a multi-quarter lag and gates visual overhauls
behind system-token opt-ins. When (not if) Angular Material ships expressive buttons natively:

- **What survives:** components Material doesn't have (loading-indicator today; fab-menu
  composition, split-button, button-group semantics with CVA — Material has never shipped a
  split button; navigation-rail-style compositions; anything you build that is *new component*
  rather than *restyle*). The M3-spec expertise embodied in the token tables also transfers.
- **What dies:** the pure restyle layer (button/icon-button size/shape tokens) becomes
  redundant the day `mat.theme` emits expressive defaults.
- **Strategic posture (my recommendation, argued in BUSINESS-STRATEGY.md):** treat the restyle
  layer as a *time-limited wedge*, not the moat. Weight the roadmap toward components Material
  lacks (split button, FAB menu, loading indicator, toolbar/dock patterns) — they remain
  sellable after native support lands — and pitch the library as "M3 Expressive *today*, plus
  components Material will never have," so native support degrades the pitch instead of
  killing it.
- **Tripwire to watch:** angular/components CHANGELOG + RFC issues mentioning "expressive";
  each Angular major release notes. Check quarterly; when a public RFC lands you likely have
  ~2-3 quarters of wedge left.

## D9. Dual licensing: PolyForm Noncommercial + one-time $49 commercial (Polar.sh)
Files: `LICENSE` (PolyForm NC 1.0.0), `public/license/index.md`, pricing page,
`environment.licensePrice: 49`. Missing: `COMMERCIAL_LICENSE.md` (README links it), live Polar
product.
**Keep?** The *mechanism* (PolyForm NC + paid commercial) is sane for a solo dev — it prevents
free-riding by companies while keeping hobby/OSS adoption frictionless. Whether the *price
model* is right is a business question → BUSINESS-STRATEGY.md. One legal note: PolyForm NC is
not OSI-open-source; "open source" must not appear in marketing copy (currently it doesn't).
**Revisit when:** deciding the launch model (BUSINESS-STRATEGY.md gives one recommendation).

## D10. semantic-release from `main`, maintenance `N.x.x` branches, Vercel per-branch deploys
**Keep?** The semantic-release + `N.x.x` maintenance-branch mechanism for the npm package: yes
— but it currently fails silently (npm has 1.0.1, git has 1.1.1 — ISSUES-TRIAGED.md #2), and a
release pipeline you don't watch is worse than a manual one. Post-publish verification is now
in the pre-release checklist. The "Vercel per-branch deploys" half of this decision was
reversed 2026-07-12 (MIT OSS migration): Vercel is gone, GitHub Pages is the sole deploy
target, and there is no per-branch docs deployment — see ADR 0005's superseded note.
**Revisit when:** never structurally for the release mechanism; just make it observable (a
workflow step that fails the job when `npm view` doesn't show the new version within N
minutes).

## D11. Minimal unit tests, heavy docs e2e
Observed, presumably deliberate time allocation: 298 e2e tests for the docs site vs 9 unit
tests for the library.
**Keep?** No — this inversion is backwards for a *component library* whose product is the
library, not the site. The e2e suite protects the storefront; almost nothing protects the
goods. Rebalance per QUALITY-BAR.md §3 (and ISSUES-TRIAGED.md #7/#8).
**Revisit:** immediately; start with fab-menu (live bug) and loading-indicator.

## D12. Empty-`styles.css` + missing SCSS packaging (NOT a decision — an accident)
Recorded here so no future model mistakes it for intent: `exports` promising a Sass entry that
isn't shipped, an `assets` glob pointing at a nonexistent directory, and a `build:sass` step
compiling a forward-only file to 41 bytes are all unintended. The intended design (infer from
`exports` + docs) is: SCSS sources shipped for the mixin path, plus a real prebuilt CSS for
no-Sass consumers. Fix per ISSUES-TRIAGED.md #1.
