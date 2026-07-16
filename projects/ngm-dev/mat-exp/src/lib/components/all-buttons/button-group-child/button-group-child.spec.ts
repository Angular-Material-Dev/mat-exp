import { Component, signal, type Signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type MatButtonAppearance } from '@angular/material/button';
import { bindButtonGroupChildren, type ButtonGroupChild } from './button-group-child';
import type { MatExpButtonShape, MatExpButtonSize } from '../../../types';

/** Minimal `ButtonGroupChild` fake that records every call it receives. */
class FakeButtonGroupChild implements ButtonGroupChild {
  size?: MatExpButtonSize;
  shape?: MatExpButtonShape;
  appearance?: MatButtonAppearance;
  disabled?: boolean;

  setSize(size: MatExpButtonSize): void {
    this.size = size;
  }

  setShape(shape: MatExpButtonShape): void {
    this.shape = shape;
  }

  setAppearance(appearance: MatButtonAppearance): void {
    this.appearance = appearance;
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }
}

/**
 * Host used purely to obtain a real injection context (a component constructor) in which to
 * call `bindButtonGroupChildren` - exactly how `MatExpButtonGroup` and
 * `MatExpSplitButton` call it from their own constructors.
 */
@Component({ template: '' })
class BroadcastHost {
  readonly children: WritableSignal<readonly ButtonGroupChild[]> = signal([]);
  readonly size: WritableSignal<MatExpButtonSize | undefined> = signal(undefined);
  readonly shape: WritableSignal<MatExpButtonShape | undefined> = signal(undefined);
  readonly appearance: WritableSignal<MatButtonAppearance | undefined> = signal(undefined);
  readonly disabled: WritableSignal<boolean | undefined> = signal(undefined);

  constructor() {
    bindButtonGroupChildren({
      children: this.children as Signal<readonly ButtonGroupChild[]>,
      size: this.size,
      shape: this.shape,
      appearance: this.appearance,
      disabled: this.disabled,
    });
  }
}

describe('bindButtonGroupChildren', () => {
  function setup() {
    const fixture = TestBed.createComponent(BroadcastHost);
    fixture.detectChanges();
    return fixture;
  }

  it('broadcasts size/shape/appearance/disabled to every registered child', () => {
    const fixture = setup();
    const host = fixture.componentInstance;
    const childA = new FakeButtonGroupChild();
    const childB = new FakeButtonGroupChild();

    host.children.set([childA, childB]);
    host.size.set('m');
    host.shape.set('square');
    host.appearance.set('tonal');
    host.disabled.set(true);
    fixture.detectChanges();

    for (const child of [childA, childB]) {
      expect(child.size).toBe('m');
      expect(child.shape).toBe('square');
      expect(child.appearance).toBe('tonal');
      expect(child.disabled).toBe(true);
    }
  });

  it('skips broadcasting falsy size/shape/appearance but always broadcasts disabled', () => {
    const fixture = setup();
    const host = fixture.componentInstance;
    const child = new FakeButtonGroupChild();

    host.children.set([child]);
    fixture.detectChanges();

    // size/shape/appearance were never set (stay `undefined`) - they must not be broadcast.
    expect(child.size).toBeUndefined();
    expect(child.shape).toBeUndefined();
    expect(child.appearance).toBeUndefined();
    // disabled has no "skip falsy" guard - it is always broadcast, `false` included.
    expect(child.disabled).toBe(false);
  });

  it('re-broadcasts to newly added children when the children signal changes', () => {
    const fixture = setup();
    const host = fixture.componentInstance;

    host.size.set('l');
    fixture.detectChanges();

    const lateChild = new FakeButtonGroupChild();
    host.children.set([lateChild]);
    fixture.detectChanges();

    expect(lateChild.size).toBe('l');
  });
});
