import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatExpressiveButton } from '../button';
import { MatExpressiveIconButton } from '../icon-button';
import { MatExpressiveSplitButton } from './split-button';
import { provideMatExpressiveSplitButtonOptions } from './split-button.options';
import type { MatExpressiveButtonSize, MatExpressiveSplitButtonAppearance } from '../../../types';

/** Host that never binds `size`/`appearance`, so the component's own defaults apply. */
@Component({
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatExpressiveButton,
    MatExpressiveIconButton,
    MatExpressiveSplitButton,
  ],
  template: `
    <mat-expressive-split-button>
      <button matButton matExpressiveButton>Action</button>
      <button matIconButton matExpressiveIconButton>
        <span>icon</span>
      </button>
    </mat-expressive-split-button>
  `,
})
class SplitButtonDefaultsTestHost {}

/** Host that binds `size`/`appearance` so tests can drive value changes through it. */
@Component({
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatExpressiveButton,
    MatExpressiveIconButton,
    MatExpressiveSplitButton,
  ],
  template: `
    <mat-expressive-split-button [size]="size()" [appearance]="appearance()">
      <button matButton matExpressiveButton>Action</button>
      <button matIconButton matExpressiveIconButton>
        <span>icon</span>
      </button>
    </mat-expressive-split-button>
  `,
})
class SplitButtonBoundTestHost {
  readonly size = signal<MatExpressiveButtonSize>('s');
  readonly appearance = signal<MatExpressiveSplitButtonAppearance>('tonal');
}

describe('MatExpressiveSplitButton', () => {
  it('renders with the default size and appearance', () => {
    const fixture = TestBed.createComponent(SplitButtonDefaultsTestHost);
    fixture.detectChanges();

    const splitButton = fixture.debugElement
      .query(By.directive(MatExpressiveSplitButton))
      .injector.get(MatExpressiveSplitButton);

    expect(splitButton.size()).toBe('s');
    expect(splitButton.appearance()).toBe('tonal');
  });

  it('exposes the default class and reflects size/appearance as host attributes', () => {
    const fixture = TestBed.createComponent(SplitButtonDefaultsTestHost);
    fixture.detectChanges();

    const debugElement = fixture.debugElement.query(By.directive(MatExpressiveSplitButton));
    const splitButton = debugElement.injector.get(MatExpressiveSplitButton);

    expect(splitButton.matExpressiveSplitButtonClass).toBe('mat-expressive-split-button');

    const nativeElement = debugElement.nativeElement as HTMLElement;
    expect(nativeElement.getAttribute('data-size')).toBe('s');
    expect(nativeElement.getAttribute('data-appearance')).toBe('tonal');
  });

  it('collects both MatExpressiveButton and MatExpressiveIconButton content children', () => {
    const fixture = TestBed.createComponent(SplitButtonDefaultsTestHost);
    fixture.detectChanges();

    const splitButton = fixture.debugElement
      .query(By.directive(MatExpressiveSplitButton))
      .injector.get(MatExpressiveSplitButton);

    expect(splitButton._matExpressiveButtons().length).toBe(1);
    expect(splitButton._matExpressiveIconButtons().length).toBe(1);
    expect(splitButton._allExpressiveButtons().length).toBe(2);
  });

  it('broadcasts size/appearance to every projected button via the ButtonGroupChild adapters', () => {
    const fixture = TestBed.createComponent(SplitButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const splitButton = fixture.debugElement
      .query(By.directive(MatExpressiveSplitButton))
      .injector.get(MatExpressiveSplitButton);

    host.size.set('l');
    host.appearance.set('outlined');
    fixture.detectChanges();

    const buttons = splitButton._allExpressiveButtons();
    expect(buttons.length).toBe(2);
    for (const button of buttons) {
      expect(button.size()).toBe('l');
      expect(button.appearance).toBe('outlined');
    }
  });
});

describe('MatExpressiveSplitButton with provideMatExpressiveSplitButtonOptions', () => {
  it('overrides the default size and appearance', () => {
    TestBed.configureTestingModule({
      providers: [provideMatExpressiveSplitButtonOptions({ size: 'l', appearance: 'outlined' })],
    });

    const fixture = TestBed.createComponent(SplitButtonDefaultsTestHost);
    fixture.detectChanges();

    const splitButton = fixture.debugElement
      .query(By.directive(MatExpressiveSplitButton))
      .injector.get(MatExpressiveSplitButton);

    expect(splitButton.size()).toBe('l');
    expect(splitButton.appearance()).toBe('outlined');
  });
});
