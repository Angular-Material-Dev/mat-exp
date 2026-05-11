import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
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
 * Name of the M3 Expressive "fast spatial" cubic-bezier ease registered with
 * GSAP. Mirrors the Material 3 motion spring used for rotation and shape
 * morphing on the loading indicator (`cubic-bezier(0.42, 1.67, 0.21, 0.90)`).
 */
const EXPRESSIVE_FAST_SPATIAL_EASE = 'mat-expressive-fast-spatial';
const EXPRESSIVE_FAST_SPATIAL_BEZIER = '0.42, 1.67, 0.21, 0.90';

/** Defaults sourced from the Material 3 Expressive loading indicator spec. */
const DEFAULT_ENTRY_DURATION_MS = 200;
const DEFAULT_MORPH_STEP_DURATION_MS = 340;
const DEFAULT_ROTATION_DURATION_MS = 2400;
const DEFAULT_ENTRY_SCALE_FROM = 0.85;

/**
 * Material 3 Expressive loading indicator. Renders a continuously morphing and
 * rotating shape that loops through the seven canonical M3 shapes. Animations
 * are driven by GSAP (MorphSVGPlugin + CustomEase) so that paths with
 * different numbers of anchor points can be interpolated smoothly.
 *
 * The component automatically respects `prefers-reduced-motion: reduce`: when
 * the user opts out of motion, the indicator renders a single static shape
 * with no rotation, morph, or entry animation.
 */
@Component({
  selector: 'mat-expressive-loading-indicator',
  styleUrls: ['./loading-indicator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-busy': 'true',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'matExpressiveLoadingIndicatorClass',
    '[class.mat-expressive-loading-indicator-contained]': 'config() === "contained"',
  },
  template: `
    <svg
      #svg
      class="mat-expressive-loading-indicator-content"
      [attr.viewBox]="viewBox"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden="true"
    >
      <path #path [attr.d]="shapes[0]" fill="currentColor"></path>
    </svg>
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

  private readonly svgRef = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private readonly pathRef = viewChild.required<ElementRef<SVGPathElement>>('path');
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.initAnimations());
  }

  private initAnimations(): void {
    registerGsapPluginsOnce();

    const svg = this.svgRef().nativeElement;
    const path = this.pathRef().nativeElement;
    const host = this.hostRef.nativeElement;
    const shapes = this.shapes;

    const hostStyles = getComputedStyle(host);
    const entryDurationMs = readDurationVar(
      hostStyles,
      '--mat-expressive-loading-indicator-entry-duration',
      DEFAULT_ENTRY_DURATION_MS,
    );
    const morphDurationMs = readDurationVar(
      hostStyles,
      '--mat-expressive-loading-indicator-morph-step-duration',
      DEFAULT_MORPH_STEP_DURATION_MS,
    );
    const rotationDurationMs = readDurationVar(
      hostStyles,
      '--mat-expressive-loading-indicator-rotation-duration',
      DEFAULT_ROTATION_DURATION_MS,
    );
    const entryScaleFrom = readNumberVar(
      hostStyles,
      '--mat-expressive-loading-indicator-entry-scale-from',
      DEFAULT_ENTRY_SCALE_FROM,
    );

    // CustomEase is idempotent on the same name – cheap to call repeatedly.
    CustomEase.create(EXPRESSIVE_FAST_SPATIAL_EASE, EXPRESSIVE_FAST_SPATIAL_BEZIER);

    const mm = gsap.matchMedia();

    mm.add(
      {
        motionOk: '(prefers-reduced-motion: no-preference)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const reduceMotion = !!context.conditions?.['reduceMotion'];

        gsap.set(svg, {
          transformOrigin: '50% 50%',
          rotation: 0,
          scale: 1,
          autoAlpha: 1,
        });
        gsap.set(path, { attr: { d: shapes[0] } });

        if (reduceMotion) {
          return;
        }

        gsap.set(svg, { autoAlpha: 0, scale: entryScaleFrom });

        gsap.to(svg, {
          autoAlpha: 1,
          scale: 1,
          duration: entryDurationMs / 1000,
          ease: 'power2.out',
        });

        gsap.to(svg, {
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
            ease: EXPRESSIVE_FAST_SPATIAL_EASE,
          });
        }
      },
    );

    this.destroyRef.onDestroy(() => mm.revert());
  }
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
