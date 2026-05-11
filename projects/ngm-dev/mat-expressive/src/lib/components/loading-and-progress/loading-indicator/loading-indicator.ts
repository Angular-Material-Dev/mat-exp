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

/**
 * M3 Expressive spatial spring tokens. Each speed preset maps to one cubic
 * bezier (registered with GSAP as a `CustomEase`) and one per-morph-step
 * duration in milliseconds. The rotation period is kept in sync with the
 * morph loop by being a multiple of the per-step duration.
 */
const EXPRESSIVE_SPATIAL_SPRINGS: Record<
  MatExpressiveLoadingIndicatorSpeed,
  { readonly ease: string; readonly bezier: string; readonly durationMs: number }
> = {
  fast: {
    ease: 'mat-expressive-fast-spatial',
    bezier: '0.42, 1.67, 0.21, 0.90',
    durationMs: 350,
  },
  default: {
    ease: 'mat-expressive-default-spatial',
    bezier: '0.38, 1.21, 0.22, 1.00',
    durationMs: 500,
  },
  slow: {
    ease: 'mat-expressive-slow-spatial',
    bezier: '0.39, 1.29, 0.35, 0.98',
    durationMs: 650,
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

/** SVG coordinate origin used for path rotation – centre of the shared viewBox. */
const SVG_ROTATION_ORIGIN = '190 190';

/** Defaults sourced from the Material 3 Expressive loading indicator spec. */
const DEFAULT_ENTRY_DURATION_MS = 200;
const DEFAULT_EXIT_DURATION_MS = 150;
const DEFAULT_ENTRY_SCALE_FROM = 0.85;

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
 * - **Rotation & shape morph** – set up inside a reactive `effect()` so they
 *   re-arm whenever the {@linkcode speed} input changes. Uses GSAP's
 *   `MorphSVGPlugin` to reconcile differing anchor counts and `CustomEase`
 *   for the three M3 Expressive spatial springs.
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
        <path #path [attr.d]="shapes[0]" fill="currentColor"></path>
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
  private readonly pathRef = viewChild<ElementRef<SVGPathElement>>('path');
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    registerGsapPluginsOnce();
    registerExpressiveEasesOnce();

    // The rotation + morph timelines are reactive: they rebuild whenever the
    // `speed` input changes (or the viewChild path ref becomes available).
    // `onCleanup` reverts the previous `gsap.matchMedia` context, so we never
    // leak running tweens across speed changes or component destruction.
    effect((onCleanup) => {
      const speed = this.speed();
      const pathEl = this.pathRef()?.nativeElement;
      if (!pathEl) return;

      const mm = this.setupRotationAndMorph(pathEl, speed);
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

    const { durationMs, scaleFrom } = this.readEntryExitTokens();

    gsap.fromTo(
      container,
      { autoAlpha: 0, scale: scaleFrom, transformOrigin: '50% 50%' },
      {
        autoAlpha: 1,
        scale: 1,
        duration: durationMs / 1000,
        ease: 'power2.out',
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

    const { exitDurationMs, scaleFrom } = this.readEntryExitTokens();

    gsap.to(container, {
      autoAlpha: 0,
      scale: scaleFrom,
      transformOrigin: '50% 50%',
      duration: exitDurationMs / 1000,
      ease: 'power2.in',
      onComplete: () => event.animationComplete(),
    });
  }

  private readEntryExitTokens(): {
    durationMs: number;
    exitDurationMs: number;
    scaleFrom: number;
  } {
    const styles = getComputedStyle(this.hostRef.nativeElement);
    return {
      durationMs: readDurationVar(
        styles,
        '--mat-expressive-loading-indicator-entry-duration',
        DEFAULT_ENTRY_DURATION_MS,
      ),
      exitDurationMs: readDurationVar(
        styles,
        '--mat-expressive-loading-indicator-exit-duration',
        DEFAULT_EXIT_DURATION_MS,
      ),
      scaleFrom: readNumberVar(
        styles,
        '--mat-expressive-loading-indicator-entry-scale-from',
        DEFAULT_ENTRY_SCALE_FROM,
      ),
    };
  }

  private setupRotationAndMorph(
    path: SVGPathElement,
    speed: MatExpressiveLoadingIndicatorSpeed,
  ): gsap.MatchMedia {
    const spring = EXPRESSIVE_SPATIAL_SPRINGS[speed];
    const shapes = this.shapes;

    const hostStyles = getComputedStyle(this.hostRef.nativeElement);
    const morphDurationMs = readDurationVar(
      hostStyles,
      '--mat-expressive-loading-indicator-morph-step-duration',
      spring.durationMs,
    );
    // Keep the rotation period locked to the morph loop period so the spin
    // never visibly drifts against the morph cycle.
    const rotationDurationMs = readDurationVar(
      hostStyles,
      '--mat-expressive-loading-indicator-rotation-duration',
      spring.durationMs * shapes.length,
    );

    const mm = gsap.matchMedia();

    mm.add(
      {
        motionOk: '(prefers-reduced-motion: no-preference)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const reduceMotion = !!context.conditions?.['reduceMotion'];

        // Reset path state before re-arming the loop – needed when re-running
        // the effect because of a `speed` change so the new tweens start from
        // a known baseline.
        gsap.set(path, { svgOrigin: SVG_ROTATION_ORIGIN, rotation: 0 });
        gsap.set(path, { attr: { d: shapes[0] } });

        if (reduceMotion) {
          return;
        }

        gsap.to(path, {
          rotation: 360,
          duration: rotationDurationMs / 1000,
          ease: 'none',
          repeat: -1,
        });

        // Cycle: shapes[0] → shapes[1] → … → shapes[n-1] → shapes[0]. MorphSVG
        // automatically reconciles paths with different anchor counts, so the
        // 12-sided cookie morphing into a pentagon or oval stays smooth.
        const morphTimeline = gsap.timeline({ repeat: -1, defaults: { overwrite: false } });
        for (let i = 0; i < shapes.length; i++) {
          const nextShape = shapes[(i + 1) % shapes.length];
          morphTimeline.to(path, {
            morphSVG: nextShape,
            duration: morphDurationMs / 1000,
            ease: spring.ease,
          });
        }
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

function readDurationVar(styles: CSSStyleDeclaration, name: string, fallback: number): number {
  return parseCssDuration(styles.getPropertyValue(name), fallback);
}

function readNumberVar(styles: CSSStyleDeclaration, name: string, fallback: number): number {
  const trimmed = styles.getPropertyValue(name).trim();
  if (!trimmed) return fallback;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCssDuration(value: string, fallback: number): number {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) return fallback;
  if (trimmed.endsWith('ms')) return parsed;
  if (trimmed.endsWith('s')) return parsed * 1000;
  return parsed;
}
