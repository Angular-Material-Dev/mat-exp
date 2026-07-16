import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatExpButton } from './button';
import { provideMatExpButtonOptions } from './button.options';
import { MatExpButtonGroup } from '../button-group';
import type { MatExpButtonShape, MatExpButtonSize, MatExpButtonToggle } from '../../../types';

/** Host that never binds any input, so the directive's own defaults apply. */
@Component({
  imports: [MatButton, MatExpButton],
  template: `<button matButton matExpButton>Click</button>`,
})
class ButtonDefaultsTestHost {}

/** Host that binds `size`/`shape`/`toggle` so tests can drive value changes through it. */
@Component({
  imports: [MatButton, MatExpButton],
  template: `
    <button matButton matExpButton [size]="size()" [shape]="shape()" [toggle]="toggle()">
      Click
    </button>
  `,
})
class ButtonBoundTestHost {
  readonly size = signal<MatExpButtonSize>('s');
  readonly shape = signal<MatExpButtonShape>('round');
  readonly toggle = signal<MatExpButtonToggle | undefined>(undefined);
}

/** Host that projects a button into a `MatExpButtonGroup`. */
@Component({
  imports: [MatButton, MatExpButton, MatExpButtonGroup],
  template: `
    <mat-exp-button-group>
      <button matButton matExpButton [value]="'a'">A</button>
    </mat-exp-button-group>
  `,
})
class ButtonGroupBroadcastTestHost {}

/** Host that pairs a button with a `MatMenuTrigger`. */
@Component({
  imports: [MatButton, MatExpButton, MatMenu, MatMenuItem, MatMenuTrigger],
  template: `
    <button matButton matExpButton [matMenuTriggerFor]="menu">Open</button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Item</button>
    </mat-menu>
  `,
})
class ButtonWithMenuTestHost {}

describe('MatExpButton defaults', () => {
  it('renders with the default size and shape', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const button = fixture.debugElement
      .query(By.directive(MatExpButton))
      .injector.get(MatExpButton);

    expect(button.size()).toBe('s');
    expect(button.shape()).toBe('round');
  });

  it('exposes the default class and reflects size/shape as host attributes', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const debugElement = fixture.debugElement.query(By.directive(MatExpButton));
    const button = debugElement.injector.get(MatExpButton);

    expect(button.matExpButtonClass).toBe('mat-exp-button');

    const nativeElement = debugElement.nativeElement as HTMLElement;
    expect(nativeElement.getAttribute('data-size')).toBe('s');
    expect(nativeElement.getAttribute('data-shape')).toBe('round');
  });
});

describe('MatExpButton input -> host attribute mapping', () => {
  it('reflects `size` as `data-size`', () => {
    const fixture = TestBed.createComponent(ButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpButton))
      .nativeElement as HTMLElement;

    host.size.set('l');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('data-size')).toBe('l');
  });

  it('reflects `shape` as `data-shape`', () => {
    const fixture = TestBed.createComponent(ButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpButton))
      .nativeElement as HTMLElement;

    host.shape.set('square');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('data-shape')).toBe('square');
  });

  it('reflects `toggle` as `data-toggle`', () => {
    const fixture = TestBed.createComponent(ButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpButton))
      .nativeElement as HTMLElement;

    expect(nativeElement.hasAttribute('data-toggle')).toBe(false);

    host.toggle.set('selected');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('data-toggle')).toBe('selected');

    host.toggle.set('unselected');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('data-toggle')).toBe('unselected');
  });

  it('renders no `aria-pressed` attribute when the button does not participate in toggle behavior', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpButton))
      .nativeElement as HTMLElement;

    expect(nativeElement.hasAttribute('aria-pressed')).toBe(false);
  });

  it('reflects `toggle` as `aria-pressed`, in sync with selection/deselection', () => {
    const fixture = TestBed.createComponent(ButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpButton))
      .nativeElement as HTMLElement;

    expect(nativeElement.hasAttribute('aria-pressed')).toBe(false);

    host.toggle.set('selected');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('aria-pressed')).toBe('true');

    host.toggle.set('unselected');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('aria-pressed')).toBe('false');

    host.toggle.set(undefined);
    fixture.detectChanges();

    expect(nativeElement.hasAttribute('aria-pressed')).toBe(false);
  });
});

describe('MatExpButton with provideMatExpButtonOptions', () => {
  it('overrides the default size, shape, and toggle', () => {
    TestBed.configureTestingModule({
      providers: [provideMatExpButtonOptions({ size: 'l', shape: 'square', toggle: 'selected' })],
    });

    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const button = fixture.debugElement
      .query(By.directive(MatExpButton))
      .injector.get(MatExpButton);

    expect(button.size()).toBe('l');
    expect(button.shape()).toBe('square');
    expect(button.toggle()).toBe('selected');
  });
});

describe('MatExpButton appearance/disabled passthrough', () => {
  it('delegates `appearance` and `disabled` to the underlying MatButton', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const button = fixture.debugElement
      .query(By.directive(MatExpButton))
      .injector.get(MatExpButton);

    button.appearance = 'filled';
    expect(button.appearance).toBe('filled');

    button.disabled = true;
    expect(button.disabled).toBe(true);
  });
});

describe('MatExpButton inside a MatExpButtonGroup', () => {
  it('delegates `_onButtonClick()` to the group with itself as the argument', () => {
    const fixture = TestBed.createComponent(ButtonGroupBroadcastTestHost);
    fixture.detectChanges();

    const group = fixture.debugElement
      .query(By.directive(MatExpButtonGroup))
      .injector.get(MatExpButtonGroup);
    const button = fixture.debugElement
      .query(By.directive(MatExpButton))
      .injector.get(MatExpButton);

    const onButtonClickSpy = vi.spyOn(group, '_onButtonClick');

    button._onButtonClick();

    expect(onButtonClickSpy).toHaveBeenCalledTimes(1);
    expect(onButtonClickSpy).toHaveBeenCalledWith(button);
  });

  it('reflects `aria-pressed` in sync when the group syncs toggle state programmatically (CVA writeValue)', () => {
    const fixture = TestBed.createComponent(ButtonGroupBroadcastTestHost);
    fixture.detectChanges();

    const group = fixture.debugElement
      .query(By.directive(MatExpButtonGroup))
      .injector.get(MatExpButtonGroup);
    const debugElement = fixture.debugElement.query(By.directive(MatExpButton));
    const nativeElement = debugElement.nativeElement as HTMLElement;

    expect(nativeElement.getAttribute('aria-pressed')).toBe('false');

    group.writeValue('a');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('aria-pressed')).toBe('true');

    group.writeValue(undefined);
    fixture.detectChanges();

    expect(nativeElement.getAttribute('aria-pressed')).toBe('false');
  });
});

describe('MatExpButton without a MatExpButtonGroup', () => {
  it('does not throw when `_onButtonClick()` is called with no group present', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const button = fixture.debugElement
      .query(By.directive(MatExpButton))
      .injector.get(MatExpButton);

    expect(() => button._onButtonClick()).not.toThrow();
  });
});

describe('MatExpButton isMenuOpen', () => {
  it('returns false when no MatMenuTrigger is present', () => {
    const fixture = TestBed.createComponent(ButtonDefaultsTestHost);
    fixture.detectChanges();

    const button = fixture.debugElement
      .query(By.directive(MatExpButton))
      .injector.get(MatExpButton);

    expect(button.isMenuOpen).toBe(false);
  });

  it('reflects `MatMenuTrigger.menuOpen` (and `data-menu-open`) as the menu opens/closes', () => {
    const fixture = TestBed.createComponent(ButtonWithMenuTestHost);
    fixture.detectChanges();

    const debugElement = fixture.debugElement.query(By.directive(MatExpButton));
    const button = debugElement.injector.get(MatExpButton);
    const matMenuTrigger = debugElement.injector.get(MatMenuTrigger);
    const nativeElement = debugElement.nativeElement as HTMLElement;

    expect(button.isMenuOpen).toBe(false);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('false');

    matMenuTrigger.openMenu();
    fixture.detectChanges();

    expect(button.isMenuOpen).toBe(true);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('true');

    matMenuTrigger.closeMenu();
    fixture.detectChanges();

    expect(button.isMenuOpen).toBe(false);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('false');
  });
});
