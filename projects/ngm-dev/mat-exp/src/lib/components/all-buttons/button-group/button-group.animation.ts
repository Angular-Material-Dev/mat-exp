import { gsap } from 'gsap';

// ---------------------------------------------------------------------------
// Motion tokens – M3 Expressive "standard button group" press bounce.
//
// All measurements are ported from the Jetpack Compose Material 3 reference
// implementation (androidx-main):
// - `ButtonGroup.kt`: `ButtonGroupDefaults.ExpandedRatio = 0.15f`, the
//   width-redistribution measure policy, and the 0.75 release gate in
//   `EnlargeOnPressNode` (`waitUntil { pressedAnimatable.value > 0.75f }`).
// - `MotionScheme.kt` + `tokens/ExpressiveMotionTokens.kt`: the group animates
//   with `MotionSchemeKeyTokens.FastSpatial`, i.e.
//   `spring(dampingRatio = 0.6f, stiffness = 800f)`.
//
// Like the loading-indicator tokens, these live in TS (not SCSS) so there is
// one place to retune the motion.
// ---------------------------------------------------------------------------

/**
 * `ButtonGroupDefaults.ExpandedRatio` — the fraction of the pressed child's
 * width by which it expands (and by which its neighbors are compressed).
 * A middle child takes at most `ratio * width / 2` from *each* neighbor; an
 * edge child takes at most `ratio * width` from its single neighbor, so the
 * pressed child grows by up to 15% of its own width and the group's total
 * width never changes.
 */
export const BUTTON_GROUP_EXPANDED_RATIO = 0.15;

/**
 * The expressive fast-spatial spring (`MotionSchemeKeyTokens.FastSpatial`):
 * `spring(dampingRatio = 0.6f, stiffness = 800f)` with unit mass. With these
 * constants the spring overshoots its target by ~9.5% once and settles from
 * rest in ~330ms.
 */
export const FAST_SPATIAL_SPRING = {
  dampingRatio: 0.6,
  stiffness: 800,
} as const;

/**
 * `EnlargeOnPressNode` only starts the release (return-to-rest) animation once
 * the press animation has progressed past this value — this is what makes a
 * quick tap still read as one full, energetic bounce instead of an aborted
 * blip.
 */
export const BUTTON_GROUP_RELEASE_GATE = 0.75;

/**
 * A segment is considered settled when its decay envelope shrinks below this
 * fraction of the unit press range (mirrors Compose's
 * `Spring.DefaultDisplacementThreshold`-style rest test).
 */
const REST_DELTA = 0.005;

/** Lower bound on a segment's duration so a near-settled retarget still eases. */
const MIN_SEGMENT_SECONDS = 0.05;

/**
 * One leg of underdamped fast-spatial spring motion, solved in closed form
 * from arbitrary initial conditions. See {@link createFastSpatialSpringSegment}.
 */
export interface SpringSegment {
  /** Time for the segment's decay envelope to shrink below {@link REST_DELTA}. */
  readonly durationSeconds: number;
  /** Exact spring position `t` seconds into the segment. */
  valueAt(tSeconds: number): number;
  /** Exact spring velocity (units/second) `t` seconds into the segment. */
  velocityAt(tSeconds: number): number;
}

/**
 * Solves the fast-spatial spring from initial position `from` and initial
 * velocity `velocity` toward `target`. Standard second-order underdamped
 * response for displacement u(t) = x(t) − target:
 *
 *   u(t) = e^(−λt) · (A·cos(ω_d t) + B·sin(ω_d t))
 *   A = u₀,  B = (v₀ + λu₀) / ω_d
 *
 * with λ = ζω₀, ω₀ = √stiffness (unit mass), ω_d = ω₀·√(1−ζ²) — the same
 * physics Compose's `SpringSimulation` solves. Because each segment starts
 * from the *current* position and velocity, retargeting mid-flight (press →
 * release) is velocity-continuous: no visible kink at the reversal, exactly
 * like retargeting a Compose `Animatable`.
 */
export function createFastSpatialSpringSegment(
  from: number,
  velocity: number,
  target: number,
): SpringSegment {
  const zeta = FAST_SPATIAL_SPRING.dampingRatio;
  const omega0 = Math.sqrt(FAST_SPATIAL_SPRING.stiffness);
  const lambda = zeta * omega0;
  const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);

  const u0 = from - target;
  const coeffA = u0;
  const coeffB = (velocity + lambda * u0) / omegaD;

  // e^(−λt)·√(A²+B²) bounds |u(t)|; solve for when it drops below REST_DELTA.
  const amplitude = Math.hypot(coeffA, coeffB);
  const durationSeconds = Math.max(
    MIN_SEGMENT_SECONDS,
    Math.log(Math.max(amplitude, REST_DELTA) / REST_DELTA) / lambda,
  );

  return {
    durationSeconds,
    valueAt(tSeconds: number): number {
      const decay = Math.exp(-lambda * tSeconds);
      return (
        target +
        decay * (coeffA * Math.cos(omegaD * tSeconds) + coeffB * Math.sin(omegaD * tSeconds))
      );
    },
    velocityAt(tSeconds: number): number {
      const decay = Math.exp(-lambda * tSeconds);
      const cos = Math.cos(omegaD * tSeconds);
      const sin = Math.sin(omegaD * tSeconds);
      return (
        decay *
        ((coeffB * omegaD - lambda * coeffA) * cos - (coeffA * omegaD + lambda * coeffB) * sin)
      );
    },
  };
}

/**
 * Pure port of the width-redistribution pass in Compose's
 * `ButtonGroupMeasurePolicy`: given the children's resting widths, which child
 * is pressed and how far the press animation has progressed (0..1, may
 * overshoot past 1 mid-spring), returns the widths to render this frame.
 *
 * - A middle child grows by `value * min(ratio·w/2, prevLimit, nextLimit)`
 *   taken from *each* neighbor.
 * - An edge child grows by `value * min(ratio·w, neighborLimit)` taken from
 *   its single neighbor.
 * - A neighbor is never compressed below zero, and the pressed child only
 *   grows by what its neighbors actually gave up, so the summed width of the
 *   group is invariant.
 *
 * `compressionLimits[i]` is child i's inline-end padding (Compose's
 * `compressionLimit.calculateEndPadding(layoutDirection)`) — the most that
 * child is allowed to squish. Unlike Compose we keep fractional pixels
 * (CSS renders subpixel widths smoothly; Compose rounds because its layout
 * is integer-based).
 */
export function computeBouncedWidths(
  baseWidths: readonly number[],
  pressedIndex: number,
  pressedValue: number,
  compressionLimits: readonly number[],
  expandedRatio: number = BUTTON_GROUP_EXPANDED_RATIO,
): number[] {
  const widths = [...baseWidths];
  const count = widths.length;
  if (count < 2 || pressedValue === 0 || pressedIndex < 0 || pressedIndex >= count) {
    return widths;
  }

  const pressedWidth = baseWidths[pressedIndex];

  if (pressedIndex > 0 && pressedIndex < count - 1) {
    const growth =
      pressedValue *
      Math.min(
        (expandedRatio * pressedWidth) / 2,
        compressionLimits[pressedIndex - 1],
        compressionLimits[pressedIndex + 1],
      );
    const growthLeft = Math.min(growth, widths[pressedIndex - 1]);
    const growthRight = Math.min(growth, widths[pressedIndex + 1]);
    widths[pressedIndex - 1] -= growthLeft;
    widths[pressedIndex + 1] -= growthRight;
    widths[pressedIndex] += growthLeft + growthRight;
  } else if (pressedIndex === 0) {
    const targetGrowth =
      pressedValue * Math.min(expandedRatio * pressedWidth, compressionLimits[1]);
    const growth = Math.min(targetGrowth, widths[1]);
    widths[1] -= growth;
    widths[0] += growth;
  } else {
    const targetGrowth =
      pressedValue * Math.min(expandedRatio * pressedWidth, compressionLimits[count - 2]);
    const growth = Math.min(targetGrowth, widths[count - 2]);
    widths[count - 2] -= growth;
    widths[count - 1] += growth;
  }

  return widths;
}

/** Press/release driver for one button group. See {@link createButtonGroupBounce}. */
export interface ButtonGroupBounceHandle {
  /** Starts the press (expand) animation on `button`. */
  press(button: HTMLElement): void;
  /**
   * Marks the active press as released. The return animation starts
   * immediately if the press animation is past {@link BUTTON_GROUP_RELEASE_GATE},
   * otherwise as soon as it crosses it.
   */
  release(): void;
  /** Kills any in-flight tween and removes all inline widths. */
  destroy(): void;
}

/**
 * Creates the press-bounce driver for a standard button group. On `press`,
 * the pressed child's width springs up by {@link BUTTON_GROUP_EXPANDED_RATIO}
 * of its width (fast-spatial spring, visible overshoot) while its neighbors
 * compress to keep the group's total width constant; on `release` everything
 * springs back — velocity-continuously, from wherever the press spring
 * currently is — and the inline widths are cleared so CSS regains ownership.
 *
 * Widths are written as fractional pixels straight to `style.width` (not via
 * GSAP's CSS plugin, which auto-rounds layout properties to whole pixels —
 * on a ~40px button whose whole excursion is ~7px, 1px quantization reads as
 * visible stepping). GSAP still drives the clock: each spring segment is a
 * linear tween of elapsed time on the global timeline.
 *
 * `getButtons` is re-read on every press so dynamically added/removed
 * children are picked up. No-ops (leaving layout fully CSS-driven) when
 * `prefers-reduced-motion: reduce` is active.
 */
export function createButtonGroupBounce(
  getButtons: () => readonly HTMLElement[],
): ButtonGroupBounceHandle {
  let buttons: readonly HTMLElement[] = [];
  let baseWidths: number[] = [];
  let compressionLimits: number[] = [];
  let pressedIndex = -1;
  let released = false;
  let returning = false;
  let value = 0;
  let velocity = 0;
  let tween: gsap.core.Tween | null = null;

  const applyWidths = (): void => {
    const widths = computeBouncedWidths(baseWidths, pressedIndex, value, compressionLimits);
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].style.width = `${widths[i]}px`;
    }
  };

  const clearWidths = (): void => {
    for (const button of buttons) {
      button.style.removeProperty('width');
    }
  };

  /**
   * Runs one spring segment from the current (value, velocity) toward
   * `target`, applying widths every tick. The proxy tween animates elapsed
   * time linearly; position/velocity come from the exact closed-form
   * solution, so motion is identical at any frame rate.
   */
  const animateTo = (target: number, onSettled: () => void): void => {
    tween?.kill();
    const segment = createFastSpatialSpringSegment(value, velocity, target);
    const clock = { t: 0 };
    tween = gsap.to(clock, {
      t: segment.durationSeconds,
      duration: segment.durationSeconds,
      ease: 'none',
      onUpdate: () => {
        value = segment.valueAt(clock.t);
        velocity = segment.velocityAt(clock.t);
        applyWidths();
        if (target === 1 && released && !returning && value > BUTTON_GROUP_RELEASE_GATE) {
          startReturn();
        }
      },
      onComplete: () => {
        // Snap the ~0.5% residual displacement to the exact target and paint
        // it — the final onUpdate rendered valueAt(duration), not the target.
        value = target;
        velocity = 0;
        applyWidths();
        tween = null;
        onSettled();
      },
    });
  };

  const startReturn = (): void => {
    returning = true;
    animateTo(0, () => {
      clearWidths();
      pressedIndex = -1;
      returning = false;
    });
  };

  return {
    press(button: HTMLElement): void {
      if (prefersReducedMotion()) return;

      const nextButtons = getButtons();
      const index = nextButtons.indexOf(button);
      // A lone child has no neighbors to redistribute width with — Compose
      // skips the whole pass for groups of one, and so do we.
      if (index < 0 || nextButtons.length < 2) return;

      if (tween !== null && index === pressedIndex && buttons === nextButtons) {
        // Re-press of the same child mid-flight (e.g. a quick double tap):
        // retarget the running spring back to 1 with its current momentum
        // instead of snapping to a fresh baseline.
        released = false;
        returning = false;
        animateTo(1, () => {
          if (released) startReturn();
        });
        return;
      }

      // A press on a different child while a previous bounce is mid-flight:
      // reset cleanly so stale inline widths from the old press never leak
      // into the new snapshot of resting widths.
      tween?.kill();
      tween = null;
      clearWidths();
      value = 0;
      velocity = 0;

      buttons = nextButtons;
      pressedIndex = index;
      released = false;
      returning = false;
      baseWidths = buttons.map((el) => el.getBoundingClientRect().width);
      compressionLimits = buttons.map(readInlineEndPadding);

      animateTo(1, () => {
        // Settled fully expanded while still held; a release after this point
        // is past the gate by definition.
        if (released) startReturn();
      });
    },

    release(): void {
      if (pressedIndex < 0 || released || returning) return;
      released = true;
      if (value > BUTTON_GROUP_RELEASE_GATE) {
        startReturn();
      }
    },

    destroy(): void {
      tween?.kill();
      tween = null;
      clearWidths();
      pressedIndex = -1;
    },
  };
}

/**
 * The most a child may be compressed by: its inline-end padding, the DOM
 * equivalent of Compose's `compressionLimit.calculateEndPadding(layoutDirection)`.
 */
function readInlineEndPadding(element: HTMLElement): number {
  const style = getComputedStyle(element);
  const endPadding = style.direction === 'rtl' ? style.paddingLeft : style.paddingRight;
  return parseFloat(endPadding) || 0;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
