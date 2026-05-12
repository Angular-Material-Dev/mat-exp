import { isPlatformBrowser } from '@angular/common';
import {
  type AnimationCallbackEvent,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { type MatExpressiveLoadingIndicatorSpeed } from '../../../types';
import { MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS } from './loading-indicator.options';
import {
  MAT_EXPRESSIVE_LOADING_INDICATOR_SHAPES,
  MAT_EXPRESSIVE_LOADING_INDICATOR_VIEW_BOX,
} from './loading-indicator.shapes';

let gsapPluginsRegistered = false;
function registerGsapPluginsOnce(): void {
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
const EXPRESSIVE_SPATIAL_SPRINGS: Record<
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
function registerExpressiveEasesOnce(): void {
  if (expressiveEasesRegistered) return;
  for (const { ease, bezier } of Object.values(EXPRESSIVE_SPATIAL_SPRINGS)) {
    CustomEase.create(ease, bezier);
  }
  expressiveEasesRegistered = true;
}

/** Entry / exit tweens – speed-independent and not part of the M3 spring set. */
const ENTRY_DURATION_MS = 200;
const ENTRY_EASE = 'power2.out';
const EXIT_DURATION_MS = 150;
const EXIT_EASE = 'power2.in';
const ENTRY_SCALE_FROM = 0.85;

/** SVG coordinate origin used for path / group rotation – centre of the shared viewBox. */
const SVG_ROTATION_ORIGIN = '190 190';

/**
 * Per-morph rotation kick. Mirrors `QuarterRotation = FullRotation / 4f` in
 * the Compose reference; combined with the spring overshoot, this is what
 * produces the "bounce" visible at each shape transition.
 */
const ROTATION_KICK_PER_STEP_DEG = 90;

/**
 * Material 3 Expressive loading indicator. Renders a continuously morphing and
 * rotating shape that loops through the seven canonical M3 shapes.
 *
 * All animation work is driven by GSAP – there are no CSS keyframes:
 *
 * - **Entry** – Angular's `(animate.enter)` event binding hands control to
 *   GSAP, which fades the wrapper from `autoAlpha: 0 / scale: 0.85 → 1` over
 *   ~200ms (`power2.out`) and calls `event.animationComplete()` once the
 *   tween finishes.
 * - **Exit** – `(animate.leave)` runs the inverse tween over ~150ms
 *   (`power2.in`); Angular waits for `animationComplete()` before detaching
 *   the element from the DOM.
 * - **Rotation & shape morph** – modelled on the Compose Material3
 *   `LoadingIndicator` choreography:
 *   - a continuous **linear background rotation** on a wrapper `<g>`
 *     (`intervalMs × shapes.length` per full revolution),
 *   - on top of it, a **per-step spring** that morphs the inner `<path>` to
 *     the next shape **and** kicks its rotation by 90°, eased through one of
 *     the M3 Expressive spatial spring cubic-bezier presets. The spring's
 *     overshoot is what produces the visible bounce at each morph boundary
 *     (the path momentarily extrapolates past the target shape and the
 *     rotation momentarily overshoots past 90° before settling).
 *
 * Motion tokens live in this file (see {@linkcode EXPRESSIVE_SPATIAL_SPRINGS}
 * and the entry / exit constants above) – the SCSS only ships visual tokens
 * (size, colour, ratio). Override motion globally via
 * `provideMatExpressiveLoadingIndicatorOptions` or per-instance via the
 * `speed` input.
 *
 * `prefers-reduced-motion: reduce` is honoured on every layer: the entry /
 * exit tweens short-circuit to `event.animationComplete()`, and the
 * rotation / morph timelines are skipped via `gsap.matchMedia()`.
 */
@Component({
  selector: 'mat-expressive-loading-indicator',
  styleUrls: ['./loading-indicator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-busy': 'true',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-speed]': 'speed()',
    '[class]': 'matExpressiveLoadingIndicatorClass',
  },
  template: `
    <div
      #container
      class="mat-expressive-loading-indicator-container"
      [class.mat-expressive-loading-indicator-container-contained]="config() === 'contained'"
      (animate.enter)="onEnter($event)"
      (animate.leave)="onLeave($event)"
    >
      <svg
        class="mat-expressive-loading-indicator-svg"
        [attr.viewBox]="viewBox"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        aria-hidden="true"
      >
        <g #rotator class="mat-expressive-loading-indicator-rotator">
          <path #path [attr.d]="shapes[0]" fill="currentColor"></path>
        </g>
      </svg>
    </div>
  `,
})
export class MatExpressiveLoadingIndicator {
  /**
   * Visual configuration of the indicator.
   *
   * - `default` – renders just the morphing shape.
   * - `contained` – renders the morphing shape on top of a tonal background
   *   "container" circle.
   */
  public readonly config = input(inject(MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS).config);

  /**
   * Accessible label announced by screen readers while the indicator is shown.
   */
  public readonly ariaLabel = input(
    inject(MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS).ariaLabel ?? 'Loading',
  );

  /**
   * Speed preset for the shape morph and rotation animation. Each preset maps
   * to one of the M3 Expressive spatial spring tokens (`fast`, `default`,
   * `slow`) – see {@linkcode MatExpressiveLoadingIndicatorSpeed}.
   *
   * Changing this signal at runtime tears down the active GSAP timelines and
   * re-builds them with the new spring, so the indicator stays in sync with
   * the new motion language without recreating the component.
   */
  public readonly speed = input(inject(MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS).speed ?? 'fast');

  /**
   * @internal
   */
  public readonly matExpressiveLoadingIndicatorClass = 'mat-expressive-loading-indicator';

  /**
   * Ordered list of SVG path `d` strings used by the shape morph loop. The
   * indicator continuously interpolates between these seven shapes.
   *
   * @internal
   */
  public readonly shapes = MAT_EXPRESSIVE_LOADING_INDICATOR_SHAPES;

  /**
   * @internal
   */
  public readonly viewBox = MAT_EXPRESSIVE_LOADING_INDICATOR_VIEW_BOX;

  private readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('container');
  private readonly rotatorRef = viewChild<ElementRef<SVGGElement>>('rotator');
  private readonly pathRef = viewChild<ElementRef<SVGPathElement>>('path');
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    registerGsapPluginsOnce();
    registerExpressiveEasesOnce();

    // The rotation + morph timelines are reactive: they rebuild whenever the
    // `speed` input changes (or the viewChild refs become available).
    // `onCleanup` reverts the previous `gsap.matchMedia` context, so we never
    // leak running tweens across speed changes or component destruction.
    effect((onCleanup) => {
      const speed = this.speed();
      const pathEl = this.pathRef()?.nativeElement;
      const rotatorEl = this.rotatorRef()?.nativeElement;
      if (!pathEl || !rotatorEl) return;

      const mm = this.setupRotationAndMorph(rotatorEl, pathEl, speed);
      onCleanup(() => mm.revert());
    });
  }

  /**
   * @internal
   *
   * Bound to the wrapper's `(animate.enter)`. Drives the entry fade + scale
   * via a GSAP tween and notifies Angular when the animation completes.
   */
  onEnter(event: AnimationCallbackEvent): void {
    const container = this.containerRef()?.nativeElement;
    if (!this.isBrowser || !container) {
      event.animationComplete();
      return;
    }

    if (prefersReducedMotion()) {
      gsap.set(container, { autoAlpha: 1, scale: 1 });
      event.animationComplete();
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
        onComplete: () => event.animationComplete(),
      },
    );
  }

  /**
   * @internal
   *
   * Bound to the wrapper's `(animate.leave)`. Drives the exit fade + scale
   * via a GSAP tween and notifies Angular when the animation completes so the
   * element can be detached from the DOM.
   */
  onLeave(event: AnimationCallbackEvent): void {
    const container = this.containerRef()?.nativeElement;
    if (!this.isBrowser || !container) {
      event.animationComplete();
      return;
    }

    if (prefersReducedMotion()) {
      event.animationComplete();
      return;
    }

    gsap.to(container, {
      autoAlpha: 0,
      scale: ENTRY_SCALE_FROM,
      transformOrigin: '50% 50%',
      duration: EXIT_DURATION_MS / 1000,
      ease: EXIT_EASE,
      onComplete: () => event.animationComplete(),
    });
  }

  private setupRotationAndMorph(
    rotator: SVGGElement,
    path: SVGPathElement,
    speed: MatExpressiveLoadingIndicatorSpeed,
  ): gsap.MatchMedia {
    const spring = EXPRESSIVE_SPATIAL_SPRINGS[speed];
    const shapes = this.shapes;

    const morphDurationMs = spring.durationMs;
    const morphIntervalMs = spring.intervalMs;
    // Lock the background rotation period to a full morph loop so the linear
    // spin and the per-step spring kicks don't visibly drift against each
    // other (interval × 7 shapes ≈ Compose's `GlobalRotationDurationMillis`).
    const rotationDurationMs = morphIntervalMs * shapes.length;
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
        gsap.set(rotator, { svgOrigin: SVG_ROTATION_ORIGIN, rotation: 0 });
        gsap.set(path, { svgOrigin: SVG_ROTATION_ORIGIN, rotation: 0 });
        gsap.set(path, { attr: { d: shapes[0] } });

        if (reduceMotion) {
          return;
        }

        // Continuous slow linear rotation on the wrapper `<g>`. Matches
        // Compose's `globalRotation` (linear tween from 0 to 360° on
        // `infiniteRepeatable`).
        gsap.to(rotator, {
          rotation: 360,
          duration: rotationDurationMs / 1000,
          ease: 'none',
          repeat: -1,
        });

        // Per-step spring on the inner `<path>` – the "bounce". Each step
        // tweens the path's `d` (morphSVG) AND its rotation by 90° together,
        // through the M3 Expressive spatial spring cubic-bezier (whose y > 1
        // control point produces the overshoot that visually reads as a
        // bounce on both morph and rotation).
        //
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

          gsap.to(path, {
            morphSVG: shapes[stepIndex],
            rotation: absoluteRotation,
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
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
