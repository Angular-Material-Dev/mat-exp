import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { MatButton } from '@angular/material/button';
import { MatExpButton } from '../button';
import { MatExpButtonGroup } from './button-group';
import { MatExpSelectableButtonChange } from '../selectable-button/selectable-button';
import type { MatExpButtonGroupSelection, MatExpButtonSize } from '../../../types';

@Component({
  imports: [MatButton, MatExpButton, MatExpButtonGroup],
  template: `
    <mat-exp-button-group
      [selection]="selection()"
      [size]="size()"
      [disabled]="disabled()"
      [disableBounce]="disableBounce()"
      (selectionChange)="onSelectionChange($event)"
    >
      <button matButton matExpButton [value]="'a'">A</button>
      <button matButton matExpButton [value]="'b'">B</button>
      <button matButton matExpButton [value]="'c'">C</button>
    </mat-exp-button-group>
  `,
})
class ButtonGroupTestHost {
  readonly selection = signal<MatExpButtonGroupSelection>('single-select');
  readonly size = signal<MatExpButtonSize>('s');
  readonly disabled = signal(false);
  readonly disableBounce = signal(false);
  readonly changes: MatExpSelectableButtonChange[] = [];

  onSelectionChange(change: MatExpSelectableButtonChange): void {
    this.changes.push(change);
  }
}

describe('MatExpButtonGroup selection-sync', () => {
  function setup() {
    const fixture = TestBed.createComponent(ButtonGroupTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const group = fixture.debugElement
      .query(By.directive(MatExpButtonGroup))
      .injector.get(MatExpButtonGroup);

    // `_allButtonGroupChildren`/`_allExpressiveButtons` are populated from real projected
    // `MatExpButton` content children - this is the seam the `ButtonGroupChild`
    // adapters wrap, exercised end-to-end here.
    const buttons = group._allExpressiveButtons() as MatExpButton[];

    return { fixture, host, group, buttons };
  }

  it('selects the clicked button, syncs toggle state, and emits selectionChange', () => {
    const { fixture, host, group, buttons } = setup();

    buttons[0]._onButtonClick();
    fixture.detectChanges();

    expect(buttons[0].toggle()).toBe('selected');
    expect(buttons[1].toggle()).toBe('unselected');
    expect(buttons[2].toggle()).toBe('unselected');
    expect(group.value).toBe('a');
    expect(host.changes.length).toBe(1);
    expect(host.changes[0].value).toBe('a');
  });

  it('replaces the previous selection when a different button is clicked (single-select)', () => {
    const { fixture, group, buttons } = setup();

    buttons[0]._onButtonClick();
    fixture.detectChanges();
    buttons[1]._onButtonClick();
    fixture.detectChanges();

    expect(buttons[0].toggle()).toBe('unselected');
    expect(buttons[1].toggle()).toBe('selected');
    expect(group.value).toBe('b');
  });

  it('deselects a button when it is clicked again', () => {
    const { fixture, group, buttons } = setup();

    buttons[0]._onButtonClick();
    fixture.detectChanges();
    buttons[0]._onButtonClick();
    fixture.detectChanges();

    expect(buttons[0].toggle()).toBe('unselected');
    expect(group.value).toBeUndefined();
  });

  it('accumulates selections when switched to multi-select', () => {
    const { fixture, host, group, buttons } = setup();

    host.selection.set('multi-select');
    fixture.detectChanges();

    buttons[0]._onButtonClick();
    buttons[2]._onButtonClick();
    fixture.detectChanges();

    expect(group.value).toEqual(['a', 'c']);
    expect(buttons[0].toggle()).toBe('selected');
    expect(buttons[1].toggle()).toBe('unselected');
    expect(buttons[2].toggle()).toBe('selected');
  });

  it('syncs button toggle state from a programmatically-set value', () => {
    const { fixture, group, buttons } = setup();

    group.value = 'b';
    fixture.detectChanges();

    expect(buttons[0].toggle()).toBe('unselected');
    expect(buttons[1].toggle()).toBe('selected');
    expect(buttons[2].toggle()).toBe('unselected');
  });

  it('broadcasts size/disabled to every projected button via the ButtonGroupChild adapters', () => {
    const { fixture, host, buttons } = setup();

    host.size.set('l');
    host.disabled.set(true);
    fixture.detectChanges();

    for (const button of buttons) {
      expect(button.size()).toBe('l');
      expect(button.disabled).toBe(true);
    }
  });

  it('has `role="group"` and reflects `disabled` as `aria-disabled` on the host', () => {
    const { fixture, host, group } = setup();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpButtonGroup))
      .nativeElement as HTMLElement;

    expect(nativeElement.getAttribute('role')).toBe('group');
    expect(nativeElement.getAttribute('aria-disabled')).toBe('false');

    host.disabled.set(true);
    fixture.detectChanges();

    expect(nativeElement.getAttribute('aria-disabled')).toBe('true');
    expect(group.disabled()).toBe(true);
  });
});

describe('MatExpButtonGroup press-bounce (disableBounce input)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(ButtonGroupTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    // The bounce driver/interaction listeners are wired up in `afterNextRender`
    // (see button-group.ts) - `whenStable()` is the pattern this repo already
    // uses to wait for that (loading-indicator.spec.ts).
    await fixture.whenStable();

    const groupEl = fixture.debugElement.query(By.directive(MatExpButtonGroup))
      .nativeElement as HTMLElement;
    const buttonEls = Array.from(groupEl.querySelectorAll<HTMLElement>('.mat-exp-button'));

    return { fixture, host, buttonEls };
  }

  function press(button: HTMLElement): void {
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
  }

  function release(): void {
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
  }

  // Same technique as button-group.animation.spec.ts: drive GSAP's virtual
  // playhead forward synchronously instead of waiting on real rAF ticks.
  function advanceGsap(seconds: number): void {
    gsap.globalTimeline.time(gsap.globalTimeline.time() + seconds);
  }

  afterEach(() => {
    gsap.globalTimeline.getChildren(true, true, true).forEach((child) => child.kill());
  });

  it('animates the pressed button width by default', async () => {
    const { buttonEls } = await setup();

    press(buttonEls[1]);
    advanceGsap(0.1);
    expect(buttonEls[1].style.width).not.toBe('');

    release();
    advanceGsap(1);
    expect(buttonEls[1].style.width).toBe('');
  });

  it('does not animate any width when disableBounce is true', async () => {
    const { host, fixture, buttonEls } = await setup();
    host.disableBounce.set(true);
    fixture.detectChanges();

    press(buttonEls[1]);
    advanceGsap(0.1);

    for (const button of buttonEls) {
      expect(button.style.width).toBe('');
    }

    release();
  });

  it('snaps an in-flight bounce back to rest when disableBounce flips true mid-press', async () => {
    const { host, fixture, buttonEls } = await setup();

    press(buttonEls[1]);
    advanceGsap(0.1);
    expect(buttonEls[1].style.width).not.toBe('');

    host.disableBounce.set(true);
    fixture.detectChanges();

    expect(buttonEls[1].style.width).toBe('');

    release();
  });
});
