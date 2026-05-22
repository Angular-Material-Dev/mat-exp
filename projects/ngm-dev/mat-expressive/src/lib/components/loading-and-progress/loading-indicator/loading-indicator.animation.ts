import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { type MatExpressiveLoadingIndicatorSpeed } from '../../../types';

// ---------------------------------------------------------------------------
// GSAP plugin bootstrap
// ---------------------------------------------------------------------------

let gsapPluginsRegistered = false;

export function registerGsapPluginsOnce(): void {
  if (gsapPluginsRegistered) return;
  gsap.registerPlugin(MorphSVGPlugin, CustomEase);
  gsapPluginsRegistered = true;
}

// ---------------------------------------------------------------------------
// Motion tokens – single source of truth for the indicator's choreography.
//
// These values intentionally live in TS rather than CSS variables so that
// there is one place to retune the motion. Visual tokens (size, colour,
// active-indicator ratio) still live in `loading-indicator.scss` because they
// are pure presentation. If a consumer needs to override a motion value
// globally, they can do so by providing custom `MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS`
// (see `loading-indicator.options.ts`).
// ---------------------------------------------------------------------------

/**
 * M3 Expressive spatial spring tokens. Each speed preset maps to one cubic
 * bezier (registered with GSAP as a `CustomEase`), a spring duration (how
 * long the per-step spring tween runs) and an interval (how long the entire
 * step takes including the pause that follows the spring). The defaults
 * mirror the Material 3 reference implementation in Jetpack Compose
 * (`spring(dampingRatio = 0.6f, stiffness = 200f)` + `MorphIntervalMillis = 650`).
 */
export const EXPRESSIVE_SPATIAL_SPRINGS: Record<
  MatExpressiveLoadingIndicatorSpeed,
  {
    readonly ease: string;
    readonly bezier: string;
    readonly durationMs: number;
    readonly intervalMs: number;
  }
> = {
  fast: {
    ease: 'mat-expressive-fast-spatial',
    bezier: '0.42, 1.67, 0.21, 0.90',
    durationMs: 350,
    intervalMs: 500,
  },
  default: {
    ease: 'mat-expressive-default-spatial',
    bezier: '0.38, 1.21, 0.22, 1.00',
    durationMs: 500,
    intervalMs: 650,
  },
  slow: {
    ease: 'mat-expressive-slow-spatial',
    bezier: '0.39, 1.29, 0.35, 0.98',
    durationMs: 650,
    intervalMs: 845,
  },
};

let expressiveEasesRegistered = false;

export function registerExpressiveEasesOnce(): void {
  if (expressiveEasesRegistered) return;
  for (const { ease, bezier } of Object.values(EXPRESSIVE_SPATIAL_SPRINGS)) {
    CustomEase.create(ease, bezier);
  }
  expressiveEasesRegistered = true;
}

// ---------------------------------------------------------------------------
// Entry / exit tweens – speed-independent
// ---------------------------------------------------------------------------

const ENTRY_DURATION_MS = 200;
const ENTRY_EASE = 'power2.out';
const EXIT_DURATION_MS = 150;
const EXIT_EASE = 'power2.in';
const ENTRY_SCALE_FROM = 0.85;

/**
 * Animates the indicator container in (fade + scale). Calls `onComplete` when
 * the tween finishes so Angular can mark the enter animation as done.
 * Short-circuits to an instant show when `prefers-reduced-motion: reduce` is
 * active.
 */
export function animateEnter(container: HTMLElement, onComplete: () => void): void {
  if (prefersReducedMotion()) {
    gsap.set(container, { autoAlpha: 1, scale: 1 });
    onComplete();
    return;
  }

  gsap.fromTo(
    container,
    { autoAlpha: 0, scale: ENTRY_SCALE_FROM, transformOrigin: '50% 50%' },
    {
      autoAlpha: 1,
      scale: 1,
      duration: ENTRY_DURATION_MS / 1000,
      ease: ENTRY_EASE,
      onComplete,
    },
  );
}

/**
 * Animates the indicator container out (fade + scale). Calls `onComplete` when
 * the tween finishes so Angular can detach the element from the DOM.
 * Short-circuits to an instant hide when `prefers-reduced-motion: reduce` is
 * active.
 */
export function animateLeave(container: HTMLElement, onComplete: () => void): void {
  if (prefersReducedMotion()) {
    onComplete();
    return;
  }

  gsap.to(container, {
    autoAlpha: 0,
    scale: ENTRY_SCALE_FROM,
    transformOrigin: '50% 50%',
    duration: EXIT_DURATION_MS / 1000,
    ease: EXIT_EASE,
    onComplete,
  });
}

// ---------------------------------------------------------------------------
// Rotation + morph loop
// ---------------------------------------------------------------------------

/**
 * Per-morph rotation kick. Mirrors `QuarterRotation = FullRotation / 4f` in
 * the Compose reference; combined with the spring overshoot, this is what
 * produces the "bounce" visible at each shape transition.
 */
const ROTATION_KICK_PER_STEP_DEG = 90;

/**
 * Builds the continuous rotation + shape-morph timelines and returns the
 * `gsap.MatchMedia` context so the caller can `revert()` it on cleanup.
 *
 * Two separate `<g>` elements are rotated so the morphing `<path>` never
 * carries a rotation transform simultaneously (which caused `svgOrigin`-based
 * transform-origin to drift as the path bounding box changed on each morph).
 *
 * - `rotator`       – receives the slow linear background rotation.
 * - `springRotator` – receives the per-step spring kick (90° each step).
 * - `path`          – receives only `morphSVG` changes.
 *
 * Both `<g>` elements must have `transform-box: view-box` in CSS so that
 * GSAP's `transformOrigin: '50% 50%'` always resolves to the SVG viewport
 * centre, independent of the child path's bounding box.
 */
export function setupRotationAndMorph(
  rotator: SVGGElement,
  springRotator: SVGGElement,
  path: SVGPathElement,
  speed: MatExpressiveLoadingIndicatorSpeed,
  shapes: readonly string[],
): gsap.MatchMedia {
  const spring = EXPRESSIVE_SPATIAL_SPRINGS[speed];

  const morphDurationMs = spring.durationMs;
  const morphIntervalMs = spring.intervalMs;
  // Matches Compose's GlobalRotationDurationMillis proportionally across speeds.
  // Compose uses 4666ms for the default 650ms interval: 4666/650 ≈ 7.178 × interval.
  const rotationDurationMs = morphIntervalMs * (4666 / 650);
  const pauseMs = Math.max(0, morphIntervalMs - morphDurationMs);

  const mm = gsap.matchMedia();

  mm.add(
    {
      motionOk: '(prefers-reduced-motion: no-preference)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const reduceMotion = !!context.conditions?.['reduceMotion'];

      // Reset transforms / shape to a known baseline so a speed change
      // doesn't leave us mid-spring on an unknown rotation.
      gsap.set(rotator, { transformOrigin: '50% 50%', rotation: 0 });
      gsap.set(springRotator, { transformOrigin: '50% 50%', rotation: 0 });
      gsap.set(path, { attr: { d: shapes[0] } });

      if (reduceMotion) {
        return;
      }

      // Continuous slow linear rotation on the outer wrapper `<g>`. Matches
      // Compose's `globalRotation` (linear tween from 0 to 360° on
      // `infiniteRepeatable`).
      gsap.to(rotator, {
        rotation: 360,
        duration: rotationDurationMs / 1000,
        ease: 'none',
        repeat: -1,
        transformOrigin: '50% 50%',
      });

      // Per-step spring on the inner `<g>` (springRotator) – the "bounce".
      // We drive this with a recursive `onComplete` rather than a
      // `gsap.timeline({ repeat: -1 })` because the per-step rotation
      // accumulates absolute degrees (90, 180, 270, …) and 7 × 90° = 630°
      // is not a multiple of 360° – a repeating timeline would snap the
      // rotation back to 0 on loop and produce a visible jump.
      let absoluteRotation = 0;
      let stepIndex = 0;

      const playStep = (): void => {
        stepIndex = (stepIndex + 1) % shapes.length;
        absoluteRotation += ROTATION_KICK_PER_STEP_DEG;

        gsap.to(springRotator, {
          rotation: absoluteRotation,
          duration: morphDurationMs / 1000,
          ease: spring.ease,
          transformOrigin: '50% 50%',
        });

        gsap.to(path, {
          morphSVG: shapes[stepIndex],
          duration: morphDurationMs / 1000,
          ease: spring.ease,
          onComplete: () => {
            if (pauseMs > 0) {
              gsap.delayedCall(pauseMs / 1000, playStep);
            } else {
              playStep();
            }
          },
        });
      };

      playStep();
    },
  );

  return mm;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
