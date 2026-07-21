import { gsap } from 'gsap';
import {
  BUTTON_GROUP_EXPANDED_RATIO,
  BUTTON_GROUP_RELEASE_GATE,
  computeBouncedWidths,
  createButtonGroupBounce,
  createFastSpatialSpringSegment,
} from './button-group.animation';

// The driver specs use the same GSAP testing technique as
// `loading-indicator.animation.spec.ts`: drive GSAP's virtual playhead
// forward synchronously with `gsap.globalTimeline.time(...)` instead of
// waiting on real time/rAF.

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

/** Creates `count` fake button elements with a fixed measured width and end padding. */
function makeButtons(count: number, width = 40, endPadding = 8): HTMLElement[] {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return Array.from({ length: count }, () => {
    const button = document.createElement('button');
    button.style.paddingRight = `${endPadding}px`;
    button.getBoundingClientRect = () =>
      ({ width, height: 40, top: 0, left: 0, right: width, bottom: 40, x: 0, y: 0 }) as DOMRect;
    container.appendChild(button);
    return button;
  });
}

describe('createFastSpatialSpringSegment', () => {
  it('starts at `from` with the given velocity and settles at `target`', () => {
    const segment = createFastSpatialSpringSegment(0, 0, 1);
    expect(segment.valueAt(0)).toBeCloseTo(0, 6);
    expect(segment.velocityAt(0)).toBeCloseTo(0, 6);
    expect(segment.valueAt(segment.durationSeconds)).toBeCloseTo(1, 2);
  });

  it('overshoots a from-rest step by ~9.5% (spring dampingRatio 0.6)', () => {
    const segment = createFastSpatialSpringSegment(0, 0, 1);
    let max = 0;
    for (let i = 0; i <= 1000; i++) {
      max = Math.max(max, segment.valueAt((i / 1000) * segment.durationSeconds));
    }
    // exp(-ζπ/√(1-ζ²)) with ζ = 0.6 → 9.48% overshoot.
    expect(max).toBeGreaterThan(1.08);
    expect(max).toBeLessThan(1.11);
  });

  it('settles a from-rest step in roughly 330ms', () => {
    const segment = createFastSpatialSpringSegment(0, 0, 1);
    expect(segment.durationSeconds).toBeGreaterThan(0.28);
    expect(segment.durationSeconds).toBeLessThan(0.38);
  });

  it('is velocity-continuous across a mid-flight retarget', () => {
    const press = createFastSpatialSpringSegment(0, 0, 1);
    const tSwitch = 0.08; // mid-flight, moving fast
    const handoffValue = press.valueAt(tSwitch);
    const handoffVelocity = press.velocityAt(tSwitch);
    expect(Math.abs(handoffVelocity)).toBeGreaterThan(0.1); // genuinely mid-motion

    const release = createFastSpatialSpringSegment(handoffValue, handoffVelocity, 0);
    expect(release.valueAt(0)).toBeCloseTo(handoffValue, 9);
    expect(release.velocityAt(0)).toBeCloseTo(handoffVelocity, 9);
    expect(release.valueAt(release.durationSeconds)).toBeCloseTo(0, 2);
  });

  it('velocityAt is the derivative of valueAt', () => {
    const segment = createFastSpatialSpringSegment(0.3, -2, 1);
    const h = 1e-6;
    for (const t of [0.01, 0.05, 0.1, 0.2]) {
      const numeric = (segment.valueAt(t + h) - segment.valueAt(t - h)) / (2 * h);
      expect(segment.velocityAt(t)).toBeCloseTo(numeric, 3);
    }
  });

  it('clamps a near-settled retarget to a minimum duration', () => {
    const segment = createFastSpatialSpringSegment(0.999, 0, 1);
    expect(segment.durationSeconds).toBeGreaterThanOrEqual(0.05);
  });
});

describe('computeBouncedWidths', () => {
  const limits = [8, 8, 8];

  it('grows a middle child by ratio·w/2 from each neighbor (total width invariant)', () => {
    // min(0.15·40/2 = 3, 8, 8) = 3 from each side.
    const widths = computeBouncedWidths([40, 40, 40], 1, 1, limits);
    expect(widths).toEqual([37, 46, 37]);
    expect(widths[0] + widths[1] + widths[2]).toBe(120);
  });

  it('grows an edge child by ratio·w from its single neighbor', () => {
    // min(0.15·40 = 6, 8) = 6 from the one neighbor.
    expect(computeBouncedWidths([40, 40, 40], 0, 1, limits)).toEqual([46, 34, 40]);
    expect(computeBouncedWidths([40, 40, 40], 2, 1, limits)).toEqual([40, 34, 46]);
  });

  it('scales the redistribution with the press progress', () => {
    expect(computeBouncedWidths([40, 40, 40], 1, 0.5, limits)).toEqual([38.5, 43, 38.5]);
  });

  it("caps compression at the neighbors' compression limit", () => {
    // Limit 2 < 0.15·40/2 = 3, so only 2px may be taken from each neighbor.
    expect(computeBouncedWidths([40, 40, 40], 1, 1, [2, 2, 2])).toEqual([38, 44, 38]);
  });

  it('supports overshooting values past 1 (mid-spring)', () => {
    const widths = computeBouncedWidths([40, 40, 40], 1, 1.09, limits);
    expect(widths[1]).toBeCloseTo(40 + 2 * 3 * 1.09, 6);
    expect(widths[0] + widths[1] + widths[2]).toBeCloseTo(120, 6);
  });

  it('is a no-op for a lone child or when the press progress is 0', () => {
    expect(computeBouncedWidths([40], 0, 1, [8])).toEqual([40]);
    expect(computeBouncedWidths([40, 40, 40], 1, 0, limits)).toEqual([40, 40, 40]);
  });

  it('uses the documented default expanded ratio of 0.15', () => {
    expect(BUTTON_GROUP_EXPANDED_RATIO).toBe(0.15);
  });
});

describe('createButtonGroupBounce', () => {
  afterEach(() => {
    gsap.globalTimeline.getChildren(true, true, true).forEach((child) => child.kill());
    document.body.innerHTML = '';
  });

  function advance(seconds: number): void {
    gsap.globalTimeline.time(gsap.globalTimeline.time() + seconds);
  }

  it('expands the pressed child and compresses its neighbors, then restores on release', () => {
    stubMatchMedia(false);
    const buttons = makeButtons(3);
    const bounce = createButtonGroupBounce(() => buttons);

    bounce.press(buttons[1]);
    advance(1);

    // Press animation settled at 1: middle grew by 6px, 3px from each side.
    expect(buttons[1].style.width).toBe('46px');
    expect(buttons[0].style.width).toBe('37px');
    expect(buttons[2].style.width).toBe('37px');

    bounce.release();
    advance(1);

    // Return animation completed and inline widths were cleared.
    expect(buttons[0].style.width).toBe('');
    expect(buttons[1].style.width).toBe('');
    expect(buttons[2].style.width).toBe('');
  });

  it('writes fractional pixel widths mid-flight (no whole-pixel quantization)', () => {
    stubMatchMedia(false);
    const buttons = makeButtons(3);
    const bounce = createButtonGroupBounce(() => buttons);

    bounce.press(buttons[1]);
    const fractionalSeen: boolean[] = [];
    for (let i = 0; i < 12; i++) {
      advance(0.02);
      const width = parseFloat(buttons[1].style.width);
      fractionalSeen.push(Math.abs(width - Math.round(width)) > 0.01);
    }
    expect(fractionalSeen).toContain(true);
    bounce.destroy();
  });

  it(`gates an early release until the press passes ${BUTTON_GROUP_RELEASE_GATE} progress`, () => {
    stubMatchMedia(false);
    const buttons = makeButtons(3);
    const bounce = createButtonGroupBounce(() => buttons);

    bounce.press(buttons[1]);
    advance(0.05); // spring position ≈ 0.53, below the 0.75 gate
    bounce.release();

    // The return has not started yet — the press keeps expanding.
    advance(0.03);
    expect(parseFloat(buttons[1].style.width)).toBeGreaterThan(40);

    // Once the gate is crossed the return runs and everything restores.
    advance(2);
    expect(buttons[1].style.width).toBe('');
  });

  it('does nothing when prefers-reduced-motion is set', () => {
    stubMatchMedia(true);
    const buttons = makeButtons(3);
    const bounce = createButtonGroupBounce(() => buttons);

    bounce.press(buttons[1]);
    advance(1);

    expect(buttons[0].style.width).toBe('');
    expect(buttons[1].style.width).toBe('');
    expect(buttons[2].style.width).toBe('');
    bounce.destroy();
  });

  it('does nothing for a group with a single child', () => {
    stubMatchMedia(false);
    const buttons = makeButtons(1);
    const bounce = createButtonGroupBounce(() => buttons);

    bounce.press(buttons[0]);
    advance(1);

    expect(buttons[0].style.width).toBe('');
    bounce.destroy();
  });

  it('clears inline widths and kills the tween on destroy mid-flight', () => {
    stubMatchMedia(false);
    const buttons = makeButtons(3);
    const bounce = createButtonGroupBounce(() => buttons);

    bounce.press(buttons[0]);
    advance(0.1);
    expect(buttons[0].style.width).not.toBe('');

    bounce.destroy();
    expect(buttons[0].style.width).toBe('');
    expect(buttons[1].style.width).toBe('');

    // Nothing left running that would re-apply widths.
    advance(1);
    expect(buttons[0].style.width).toBe('');
  });

  it('retargets smoothly when the same child is re-pressed mid-return', () => {
    stubMatchMedia(false);
    const buttons = makeButtons(3);
    const bounce = createButtonGroupBounce(() => buttons);

    bounce.press(buttons[1]);
    advance(0.12);
    bounce.release();
    advance(0.05); // mid-return
    const midReturnWidth = parseFloat(buttons[1].style.width);

    bounce.press(buttons[1]);
    // No snap back to the resting width: the spring retargets from where it is.
    const rePressWidth = parseFloat(buttons[1].style.width);
    expect(Math.abs(rePressWidth - midReturnWidth)).toBeLessThan(1);

    advance(1);
    expect(buttons[1].style.width).toBe('46px');

    bounce.release();
    advance(1);
    expect(buttons[1].style.width).toBe('');
  });

  it('resets cleanly when a different child is pressed while a bounce is mid-flight', () => {
    stubMatchMedia(false);
    const buttons = makeButtons(3);
    const bounce = createButtonGroupBounce(() => buttons);

    bounce.press(buttons[1]);
    advance(0.12);
    bounce.release();
    advance(0.02);

    // New press on another child: base widths are re-snapshotted from the
    // (stubbed) layout, not from the half-bounced inline widths.
    bounce.press(buttons[2]);
    advance(1);
    expect(buttons[2].style.width).toBe('46px');
    expect(buttons[1].style.width).toBe('34px');
    expect(buttons[0].style.width).toBe('40px');

    bounce.release();
    advance(1);
    expect(buttons[2].style.width).toBe('');
  });
});
