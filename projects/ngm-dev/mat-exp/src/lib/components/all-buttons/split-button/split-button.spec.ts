import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatExpButton } from '../button';
import { MatExpIconButton } from '../icon-button';
import { MatExpSplitButton } from './split-button';
import { provideMatExpSplitButtonOptions } from './split-button.options';
import type { MatExpButtonSize, MatExpSplitButtonAppearance } from '../../../types';

/** Host that never binds `size`/`appearance`, so the component's own defaults apply. */
@Component({
  imports: [MatButton, MatIconButton, MatExpButton, MatExpIconButton, MatExpSplitButton],
  template: `
    <mat-exp-split-button>
      <button matButton matExpButton>Action</button>
      <button matIconButton matExpIconButton>
        <span>icon</span>
      </button>
    </mat-exp-split-button>
  `,
})
class SplitButtonDefaultsTestHost {}

/** Host that binds `size`/`appearance` so tests can drive value changes through it. */
@Component({
  imports: [MatButton, MatIconButton, MatExpButton, MatExpIconButton, MatExpSplitButton],
  template: `
    <mat-exp-split-button [size]="size()" [appearance]="appearance()">
      <button matButton matExpButton>Action</button>
      <button matIconButton matExpIconButton>
        <span>icon</span>
      </button>
    </mat-exp-split-button>
  `,
})
class SplitButtonBoundTestHost {
  readonly size = signal<MatExpButtonSize>('s');
  readonly appearance = signal<MatExpSplitButtonAppearance>('tonal');
}

describe('MatExpSplitButton', () => {
  it('renders with the default size and appearance', () => {
    const fixture = TestBed.createComponent(SplitButtonDefaultsTestHost);
    fixture.detectChanges();

    const splitButton = fixture.debugElement
      .query(By.directive(MatExpSplitButton))
      .injector.get(MatExpSplitButton);

    expect(splitButton.size()).toBe('s');
    expect(splitButton.appearance()).toBe('tonal');
  });

  it('exposes the default class and reflects size/appearance as host attributes', () => {
    const fixture = TestBed.createComponent(SplitButtonDefaultsTestHost);
    fixture.detectChanges();

    const debugElement = fixture.debugElement.query(By.directive(MatExpSplitButton));
    const splitButton = debugElement.injector.get(MatExpSplitButton);

    expect(splitButton.matExpSplitButtonClass).toBe('mat-exp-split-button');

    const nativeElement = debugElement.nativeElement as HTMLElement;
    expect(nativeElement.getAttribute('data-size')).toBe('s');
    expect(nativeElement.getAttribute('data-appearance')).toBe('tonal');
  });

  it('collects both MatExpButton and MatExpIconButton content children', () => {
    const fixture = TestBed.createComponent(SplitButtonDefaultsTestHost);
    fixture.detectChanges();

    const splitButton = fixture.debugElement
      .query(By.directive(MatExpSplitButton))
      .injector.get(MatExpSplitButton);

    expect(splitButton._matExpButtons().length).toBe(1);
    expect(splitButton._matExpIconButtons().length).toBe(1);
    expect(splitButton._allExpressiveButtons().length).toBe(2);
  });

  it('broadcasts size/appearance to every projected button via the ButtonGroupChild adapters', () => {
    const fixture = TestBed.createComponent(SplitButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const splitButton = fixture.debugElement
      .query(By.directive(MatExpSplitButton))
      .injector.get(MatExpSplitButton);

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

describe('MatExpSplitButton with provideMatExpSplitButtonOptions', () => {
  it('overrides the default size and appearance', () => {
    TestBed.configureTestingModule({
      providers: [provideMatExpSplitButtonOptions({ size: 'l', appearance: 'outlined' })],
    });

    const fixture = TestBed.createComponent(SplitButtonDefaultsTestHost);
    fixture.detectChanges();

    const splitButton = fixture.debugElement
      .query(By.directive(MatExpSplitButton))
      .injector.get(MatExpSplitButton);

    expect(splitButton.size()).toBe('l');
    expect(splitButton.appearance()).toBe('outlined');
  });
});
