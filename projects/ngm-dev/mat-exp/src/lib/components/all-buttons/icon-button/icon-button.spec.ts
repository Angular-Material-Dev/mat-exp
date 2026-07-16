import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatExpIconButton } from './icon-button';
import { provideMatExpIconButtonOptions } from './icon-button.options';
import { MatExpButtonGroup } from '../button-group';
import type {
  MatExpButtonGroupAppearance,
  MatExpButtonShape,
  MatExpButtonSize,
  MatExpButtonToggle,
  MatExpIconButtonAppearance,
  MatExpIconButtonWidth,
} from '../../../types';

/** Host that never binds any input, so the directive's own defaults apply. */
@Component({
  imports: [MatIconButton, MatExpIconButton],
  template: `
    <button matIconButton matExpIconButton>
      <span>icon</span>
    </button>
  `,
})
class IconButtonDefaultsTestHost {}

/** Host that binds every input so tests can drive value changes through it. */
@Component({
  imports: [MatIconButton, MatExpIconButton],
  template: `
    <button
      matIconButton
      matExpIconButton
      [size]="size()"
      [shape]="shape()"
      [width]="width()"
      [appearance]="appearance()"
      [toggle]="toggle()"
    >
      <span>icon</span>
    </button>
  `,
})
class IconButtonBoundTestHost {
  readonly size = signal<MatExpButtonSize>('s');
  readonly shape = signal<MatExpButtonShape>('round');
  readonly width = signal<MatExpIconButtonWidth>('default');
  readonly appearance = signal<MatExpIconButtonAppearance>('text');
  readonly toggle = signal<MatExpButtonToggle | undefined>(undefined);
}

/** Host that projects icon buttons into a `MatExpButtonGroup`. */
@Component({
  imports: [MatIconButton, MatExpIconButton, MatExpButtonGroup],
  template: `
    <mat-exp-button-group
      [size]="size()"
      [shape]="shape()"
      [appearance]="appearance()"
      [disabled]="disabled()"
    >
      <button matIconButton matExpIconButton [value]="'a'"><span>a</span></button>
      <button matIconButton matExpIconButton [value]="'b'"><span>b</span></button>
    </mat-exp-button-group>
  `,
})
class IconButtonGroupTestHost {
  readonly size = signal<MatExpButtonSize>('s');
  readonly shape = signal<MatExpButtonShape>('round');
  readonly appearance = signal<MatExpButtonGroupAppearance | undefined>(undefined);
  readonly disabled = signal(false);
}

/** Host with a `MatMenuTrigger` attached to the icon button. */
@Component({
  imports: [MatIconButton, MatExpIconButton, MatMenu, MatMenuItem, MatMenuTrigger],
  template: `
    <button matIconButton matExpIconButton [matMenuTriggerFor]="menu">
      <span>icon</span>
    </button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Item</button>
    </mat-menu>
  `,
})
class IconButtonMenuTestHost {}

describe('MatExpIconButton', () => {
  it('renders with the default size and shape', () => {
    const fixture = TestBed.createComponent(IconButtonDefaultsTestHost);
    fixture.detectChanges();

    const iconButton = fixture.debugElement
      .query(By.directive(MatExpIconButton))
      .injector.get(MatExpIconButton);

    expect(iconButton.size()).toBe('s');
    expect(iconButton.shape()).toBe('round');
  });

  it('exposes the default class and reflects size/shape as host attributes', () => {
    const fixture = TestBed.createComponent(IconButtonDefaultsTestHost);
    fixture.detectChanges();

    const debugElement = fixture.debugElement.query(By.directive(MatExpIconButton));
    const iconButton = debugElement.injector.get(MatExpIconButton);

    expect(iconButton.matExpIconButtonClass).toBe('mat-exp-icon-button');

    const nativeElement = debugElement.nativeElement as HTMLElement;
    expect(nativeElement.getAttribute('data-size')).toBe('s');
    expect(nativeElement.getAttribute('data-shape')).toBe('round');
  });

  it('reflects size/shape/width/appearance/toggle as host attributes', () => {
    const fixture = TestBed.createComponent(IconButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpIconButton))
      .nativeElement as HTMLElement;

    expect(nativeElement.getAttribute('data-size')).toBe('s');
    expect(nativeElement.getAttribute('data-shape')).toBe('round');
    expect(nativeElement.getAttribute('data-width')).toBe('default');
    expect(nativeElement.getAttribute('data-appearance')).toBe('text');
    expect(nativeElement.hasAttribute('data-toggle')).toBe(false);

    host.size.set('l');
    host.shape.set('square');
    host.width.set('wide');
    host.appearance.set('filled');
    host.toggle.set('selected');
    fixture.detectChanges();

    expect(nativeElement.getAttribute('data-size')).toBe('l');
    expect(nativeElement.getAttribute('data-shape')).toBe('square');
    expect(nativeElement.getAttribute('data-width')).toBe('wide');
    expect(nativeElement.getAttribute('data-appearance')).toBe('filled');
    expect(nativeElement.getAttribute('data-toggle')).toBe('selected');
  });

  it('renders no `aria-pressed` attribute when the icon button does not participate in toggle behavior', () => {
    const fixture = TestBed.createComponent(IconButtonDefaultsTestHost);
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpIconButton))
      .nativeElement as HTMLElement;

    expect(nativeElement.hasAttribute('aria-pressed')).toBe(false);
  });

  it('reflects `toggle` as `aria-pressed`, in sync with selection/deselection', () => {
    const fixture = TestBed.createComponent(IconButtonBoundTestHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.debugElement.query(By.directive(MatExpIconButton))
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

describe('MatExpIconButton with provideMatExpIconButtonOptions', () => {
  it('overrides the default size, shape, width, and appearance', () => {
    TestBed.configureTestingModule({
      providers: [
        provideMatExpIconButtonOptions({
          size: 'l',
          shape: 'square',
          width: 'wide',
          appearance: 'filled',
        }),
      ],
    });

    const fixture = TestBed.createComponent(IconButtonDefaultsTestHost);
    fixture.detectChanges();

    const iconButton = fixture.debugElement
      .query(By.directive(MatExpIconButton))
      .injector.get(MatExpIconButton);

    expect(iconButton.size()).toBe('l');
    expect(iconButton.shape()).toBe('square');
    expect(iconButton.width()).toBe('wide');
    expect(iconButton.appearance).toBe('filled');
  });
});

describe('MatExpIconButton inside MatExpButtonGroup', () => {
  function setup() {
    const fixture = TestBed.createComponent(IconButtonGroupTestHost);
    fixture.detectChanges();

    const group = fixture.debugElement
      .query(By.directive(MatExpButtonGroup))
      .injector.get(MatExpButtonGroup);

    const iconButtons = group._matExpIconButtons() as MatExpIconButton[];

    return { fixture, host: fixture.componentInstance, group, iconButtons };
  }

  it('broadcasts size/shape/appearance/disabled to every projected icon button via the ButtonGroupChild adapter', () => {
    const { fixture, host, iconButtons } = setup();

    expect(iconButtons.length).toBe(2);

    host.size.set('l');
    host.shape.set('square');
    host.appearance.set('filled');
    host.disabled.set(true);
    fixture.detectChanges();

    for (const button of iconButtons) {
      expect(button.size()).toBe('l');
      expect(button.shape()).toBe('square');
      expect(button.appearance).toBe('filled');
      expect(button.disabled).toBe(true);
    }
  });

  it('selects the clicked icon button and syncs its toggle state via the group', () => {
    const { fixture, group, iconButtons } = setup();

    iconButtons[0]._onButtonClick();
    fixture.detectChanges();

    expect(iconButtons[0].toggle()).toBe('selected');
    expect(iconButtons[1].toggle()).toBe('unselected');
    expect(group.value).toBe('a');
  });

  it('reflects `aria-pressed` in sync when the group syncs toggle state programmatically (CVA writeValue)', () => {
    const { fixture, group, iconButtons } = setup();

    const nativeElements = iconButtons.map(
      (button) =>
        fixture.debugElement
          .queryAll(By.directive(MatExpIconButton))
          .find((el) => el.injector.get(MatExpIconButton) === button)?.nativeElement as HTMLElement,
    );

    expect(nativeElements[0].getAttribute('aria-pressed')).toBe('false');
    expect(nativeElements[1].getAttribute('aria-pressed')).toBe('false');

    group.writeValue('a');
    fixture.detectChanges();

    expect(nativeElements[0].getAttribute('aria-pressed')).toBe('true');
    expect(nativeElements[1].getAttribute('aria-pressed')).toBe('false');

    group.writeValue('b');
    fixture.detectChanges();

    expect(nativeElements[0].getAttribute('aria-pressed')).toBe('false');
    expect(nativeElements[1].getAttribute('aria-pressed')).toBe('true');
  });
});

describe('MatExpIconButton isMenuOpen', () => {
  it('starts closed and reflects `isMenuOpen`/`data-menu-open` as the menu opens/closes', () => {
    const fixture = TestBed.createComponent(IconButtonMenuTestHost);
    fixture.detectChanges();

    const debugElement = fixture.debugElement.query(By.directive(MatExpIconButton));
    const iconButton = debugElement.injector.get(MatExpIconButton);
    const matMenuTrigger = debugElement.injector.get(MatMenuTrigger);
    const nativeElement = debugElement.nativeElement as HTMLElement;

    expect(iconButton.isMenuOpen).toBe(false);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('false');

    matMenuTrigger.openMenu();
    fixture.detectChanges();

    expect(iconButton.isMenuOpen).toBe(true);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('true');

    matMenuTrigger.closeMenu();
    fixture.detectChanges();

    expect(iconButton.isMenuOpen).toBe(false);
    expect(nativeElement.getAttribute('data-menu-open')).toBe('false');
  });
});
