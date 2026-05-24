import { isPlatformBrowser } from '@angular/common';
import {
  afterRenderEffect,
  type AnimationCallbackEvent,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { type MatExpressiveLoadingIndicatorSpeed } from '../../../types';
import {
  animateEnter,
  animateLeave,
  registerExpressiveEasesOnce,
  registerGsapPluginsOnce,
  setupRotationAndMorph,
} from './loading-indicator.animation';
import { MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS } from './loading-indicator.options';
import {
  MAT_EXPRESSIVE_LOADING_INDICATOR_SHAPES,
  MAT_EXPRESSIVE_LOADING_INDICATOR_VIEW_BOX,
} from './loading-indicator.shapes';

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
 *     (`intervalMs × ~7.178` per full revolution, matching Compose's ratio),
 *   - on top of it, a **per-step spring** that morphs the inner `<path>` to
 *     the next shape **and** kicks its rotation by 90°, eased through one of
 *     the M3 Expressive spatial spring cubic-bezier presets. The spring's
 *     overshoot is what produces the visible bounce at each morph boundary.
 *
 * Motion tokens live in `loading-indicator.animation.ts` – the SCSS only
 * ships visual tokens (size, colour, ratio). Override motion globally via
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
    '(animate.enter)': 'onEnter($event)',
    '(animate.leave)': 'onLeave($event)',
  },
  templateUrl: './loading-indicator.html',
})
export class MatExpressiveLoadingIndicator {
  private readonly _options = inject(MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS);

  /**
   * Visual configuration of the indicator.
   *
   * - `default` – renders just the morphing shape.
   * - `contained` – renders the morphing shape on top of a tonal background
   *   "container" circle.
   */
  public readonly config = input(this._options.config);

  /** Accessible label announced by screen readers while the indicator is shown. */
  public readonly ariaLabel = input(this._options.ariaLabel);

  /**
   * Speed preset for the shape morph and rotation animation. Each preset maps
   * to one of the M3 Expressive spatial spring tokens (`fast`, `default`,
   * `slow`) – see {@linkcode MatExpressiveLoadingIndicatorSpeed}.
   *
   * Changing this signal at runtime tears down the active GSAP timelines and
   * re-builds them with the new spring, so the indicator stays in sync with
   * the new motion language without recreating the component.
   */
  public readonly speed = input<MatExpressiveLoadingIndicatorSpeed>(
    this._options.speed ?? 'default',
  );

  /** @internal */
  public readonly matExpressiveLoadingIndicatorClass = 'mat-expressive-loading-indicator';

  /**
   * Ordered list of SVG path `d` strings used by the shape morph loop.
   * @internal
   */
  public readonly shapes = MAT_EXPRESSIVE_LOADING_INDICATOR_SHAPES;

  /** @internal */
  public readonly viewBox = MAT_EXPRESSIVE_LOADING_INDICATOR_VIEW_BOX;

  private readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('container');
  private readonly rotatorRef = viewChild<ElementRef<SVGGElement>>('rotator');
  private readonly springRotatorRef = viewChild<ElementRef<SVGGElement>>('springRotator');
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
    afterRenderEffect((onCleanup) => {
      const speed = this.speed();
      const pathEl = this.pathRef()?.nativeElement;
      const rotatorEl = this.rotatorRef()?.nativeElement;
      const springRotatorEl = this.springRotatorRef()?.nativeElement;
      if (!pathEl || !rotatorEl || !springRotatorEl || !speed) return;

      const mm = setupRotationAndMorph(rotatorEl, springRotatorEl, pathEl, speed, this.shapes);
      onCleanup(() => mm.revert());
    });
  }

  /**
   * @internal
   * Bound via `host` to `(animate.enter)`.
   */
  onEnter(event: AnimationCallbackEvent): void {
    const container = this.containerRef()?.nativeElement;
    if (!this.isBrowser || !container) {
      event.animationComplete();
      return;
    }
    animateEnter(container, () => event.animationComplete());
  }

  /**
   * @internal
   * Bound via `host` to `(animate.leave)`.
   */
  onLeave(event: AnimationCallbackEvent): void {
    const container = this.containerRef()?.nativeElement;
    if (!this.isBrowser || !container) {
      event.animationComplete();
      return;
    }
    animateLeave(container, () => event.animationComplete());
  }
}
