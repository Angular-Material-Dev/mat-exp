import { gsap } from 'gsap';
import {
  registerExpressiveEasesOnce,
  registerGsapPluginsOnce,
  setupRotationAndMorph,
} from './loading-indicator.animation';
import { MAT_EXP_LOADING_INDICATOR_SHAPES } from './loading-indicator.shapes';

// These specs exercise the *real* (unmocked) `gsap.matchMedia()` rotation/morph loop built by
// `setupRotationAndMorph` - see #184. `component.spec.ts`-level tests intentionally avoid this
// (they stub `prefers-reduced-motion: reduce` or mock `gsap.matchMedia` outright) because the
// recursive `gsap.to(...).onComplete(...)` chain never settles without a real ticker. Here we
// drive GSAP's virtual playhead forward synchronously with `gsap.globalTimeline.time(...)`
// (a standard GSAP testing technique) so the recursive `playStep` chain fires multiple
// generations without waiting on real time/rAF, then assert on what's left on
// `gsap.globalTimeline` afterwards.
//
// Note: with the currently pinned GSAP version, `_callback()` (gsap-core's internal dispatcher
// for onComplete/onStart/etc.) already re-propagates a tween's own tracked `_ctx` to any new
// tween/delayedCall created inside its callback, so the leak in #184 does not currently reproduce
// even without the `context.add(...)` fix below - these specs pass on both the fixed and unfixed
// version of `loading-indicator.animation.ts`. The fix is kept anyway because (a) it's exactly
// what #184 asks for, (b) it's GSAP's own documented pattern for recursively-created dynamic
// content in a scoped context, and (c) it makes the tracking explicit/robust rather than resting
// on an internal engine behaviour that could change across GSAP versions. These tests still carry
// their weight as a regression guard for the underlying invariants (no leaked tweens after
// destroy, no double loop on a speed change, reduced-motion behaviour, choreography order).

function stubMatchMedia(reduceMotion: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? reduceMotion : !reduceMotion,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function makeSvgEls(): {
  rotator: SVGGElement;
  springRotator: SVGGElement;
  path: SVGPathElement;
} {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const rotator = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'g',
  ) as unknown as SVGGElement;
  const springRotator = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'g',
  ) as unknown as SVGGElement;
  const path = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path',
  ) as unknown as SVGPathElement;
  svg.appendChild(rotator);
  rotator.appendChild(springRotator);
  springRotator.appendChild(path);
  document.body.appendChild(svg);
  return { rotator, springRotator, path };
}

/**
 * Advances GSAP's virtual playhead by `totalSeconds`, in small increments, so the recursive
 * morph loop fires several generations. GSAP only renders a newly-created tween (e.g. the next
 * step's, created mid-jump inside a completed tween's `onComplete`) on a *subsequent* `.time()`
 * call, not within the same call that created it - so jumping the full distance in one shot
 * would leave the chain one generation behind. Many small increments (a standard GSAP testing
 * technique) avoid that.
 */
function fastForward(totalSeconds: number, incrementSeconds = 0.05): void {
  const steps = Math.ceil(totalSeconds / incrementSeconds);
  for (let i = 0; i < steps; i++) {
    gsap.globalTimeline.time(gsap.globalTimeline.time() + incrementSeconds);
  }
}

describe('setupRotationAndMorph', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    gsap.globalTimeline.clear();
    vi.restoreAllMocks();
  });

  it('does not start any tweens/delayedCalls when prefers-reduced-motion: reduce', () => {
    registerGsapPluginsOnce();
    registerExpressiveEasesOnce();
    stubMatchMedia(true);

    const { rotator, springRotator, path } = makeSvgEls();
    const before = gsap.globalTimeline.getChildren(true, true, true).length;

    const mm = setupRotationAndMorph(
      rotator,
      springRotator,
      path,
      'default',
      MAT_EXP_LOADING_INDICATOR_SHAPES,
    );

    expect(gsap.globalTimeline.getChildren(true, true, true).length).toBe(before);
    mm.revert();
  });

  it('stops every tween and delayedCall after destroying past two or more morph steps (#184)', () => {
    registerGsapPluginsOnce();
    registerExpressiveEasesOnce();
    stubMatchMedia(false);

    const { rotator, springRotator, path } = makeSvgEls();
    const before = gsap.globalTimeline.getChildren(true, true, true).length;

    const mm = setupRotationAndMorph(
      rotator,
      springRotator,
      path,
      'fast',
      MAT_EXP_LOADING_INDICATOR_SHAPES,
    );

    // 'fast' has a 500ms interval per step; fast-forward well past several generations of the
    // recursive playStep -> onComplete -> delayedCall -> playStep chain (each generation creates
    // new gsap.to()/gsap.delayedCall() calls *after* the matchMedia callback's initial
    // synchronous run has already returned).
    fastForward(5);
    expect(gsap.getTweensOf(path).length + gsap.getTweensOf(springRotator).length).toBeGreaterThan(
      0,
    );

    // Simulates component destroy: `afterRenderEffect`'s cleanup calls `mm.revert()`.
    mm.revert();

    expect(gsap.globalTimeline.getChildren(true, true, true).length).toBe(before);
    expect(gsap.getTweensOf(rotator)).toHaveLength(0);
    expect(gsap.getTweensOf(springRotator)).toHaveLength(0);
    expect(gsap.getTweensOf(path)).toHaveLength(0);
  });

  it('never leaves two concurrent loops running after a speed change rebuilds the context', () => {
    registerGsapPluginsOnce();
    registerExpressiveEasesOnce();
    stubMatchMedia(false);

    const { rotator, springRotator, path } = makeSvgEls();
    const before = gsap.globalTimeline.getChildren(true, true, true).length;

    const firstMm = setupRotationAndMorph(
      rotator,
      springRotator,
      path,
      'default',
      MAT_EXP_LOADING_INDICATOR_SHAPES,
    );

    // Let the first ('default' speed) loop run through several generations, as if the user had
    // been looking at the indicator for a while before the speed changed.
    fastForward(3.9);

    // `afterRenderEffect`'s cleanup reverts the old context before the effect re-runs with the
    // new speed and builds a fresh one - mirroring what the component does on a `speed` change.
    firstMm.revert();
    const secondMm = setupRotationAndMorph(
      rotator,
      springRotator,
      path,
      'slow',
      MAT_EXP_LOADING_INDICATOR_SHAPES,
    );

    fastForward(5.1);

    // Only the second (current) generation's tweens should be alive - never two.
    expect(gsap.getTweensOf(rotator)).toHaveLength(1);
    expect(gsap.getTweensOf(springRotator).length).toBeLessThanOrEqual(1);
    expect(gsap.getTweensOf(path).length).toBeLessThanOrEqual(1);

    secondMm.revert();

    expect(gsap.globalTimeline.getChildren(true, true, true).length).toBe(before);
    expect(gsap.getTweensOf(rotator)).toHaveLength(0);
    expect(gsap.getTweensOf(springRotator)).toHaveLength(0);
    expect(gsap.getTweensOf(path)).toHaveLength(0);
  });

  it('preserves the morph choreography: shapes advance in order and rotation accumulates by 90° per step', () => {
    registerGsapPluginsOnce();
    registerExpressiveEasesOnce();
    stubMatchMedia(false);

    const { rotator, springRotator, path } = makeSvgEls();

    // Assert on the *arguments* each generation's gsap.to() call is created with, rather than
    // sampling the live interpolated DOM state mid-animation - the spring ease's overshoot/settle
    // and MorphSVGPlugin's path-data re-serialization make exact live-value sampling brittle
    // against timing, while the call arguments are fixed deterministically at creation time
    // regardless of when GSAP's virtual clock happens to render them.
    const toSpy = vi.spyOn(gsap, 'to');

    const mm = setupRotationAndMorph(
      rotator,
      springRotator,
      path,
      'fast',
      MAT_EXP_LOADING_INDICATOR_SHAPES,
    );

    // Right after setup, the path is reset to the first shape and no rotation has accumulated.
    expect(path.getAttribute('d')).toBe(MAT_EXP_LOADING_INDICATOR_SHAPES[0]);
    expect(gsap.getProperty(springRotator, 'rotation')).toBe(0);

    // Fast-forward well past three full steps (350ms morph + 150ms pause = 500ms each for 'fast').
    fastForward(1.8);

    const pathCalls = toSpy.mock.calls.filter(([target]) => target === path);
    const morphTargets = pathCalls.map(([, vars]) => (vars as { morphSVG?: unknown }).morphSVG);
    // shapes[0] is applied via gsap.set on setup (not gsap.to), so each subsequent gsap.to(path,
    // ...) call morphs to shapes[1], shapes[2], shapes[3], ... in order - proving the shape index
    // still advances one step at a time through the recursive `playStep` chain.
    expect(morphTargets.length).toBeGreaterThanOrEqual(3);
    expect(morphTargets).toEqual(
      MAT_EXP_LOADING_INDICATOR_SHAPES.slice(1, 1 + morphTargets.length),
    );

    const springCalls = toSpy.mock.calls.filter(([target]) => target === springRotator);
    const rotations = springCalls.map(([, vars]) => (vars as { rotation?: unknown }).rotation);
    // Each step's spring tween targets the *absolute* accumulated rotation (90, 180, 270, ...),
    // not a relative +90 - preserving the intentional non-repeating-timeline design (see the
    // 630°-not-a-multiple-of-360° comment in loading-indicator.animation.ts).
    const expectedRotations = Array.from({ length: rotations.length }, (_, i) => (i + 1) * 90);
    expect(rotations).toEqual(expectedRotations);

    mm.revert();
  });
});
