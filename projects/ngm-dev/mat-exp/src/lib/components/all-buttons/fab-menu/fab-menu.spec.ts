import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatExpFabMenu } from './fab-menu';
import type { MatExpFabMenuColor } from '../../../types/appearance';

@Component({
  imports: [MatMenuModule, MatExpFabMenu],
  template: `<mat-menu matExpFabMenu [color]="color()"></mat-menu>`,
})
class FabMenuTestHost {
  readonly color = signal<MatExpFabMenuColor>('primary');
}

@Component({
  imports: [MatMenuModule, MatExpFabMenu],
  template: `<mat-menu matExpFabMenu class="my-custom-panel" [color]="color()"></mat-menu>`,
})
class FabMenuConsumerClassTestHost {
  readonly color = signal<MatExpFabMenuColor>('primary');
}

describe('MatExpFabMenu panelClass', () => {
  function setup() {
    const fixture = TestBed.createComponent(FabMenuTestHost);
    const host = fixture.componentInstance;

    const menu = fixture.debugElement.query(By.directive(MatMenu)).injector.get(MatMenu);
    const panelClassSetter = vi.spyOn(menu, 'panelClass', 'set');

    fixture.detectChanges();

    return { fixture, host, panelClassSetter };
  }

  it('sets exactly one mat-exp-fab-menu-{color} class on initial render', () => {
    const { panelClassSetter } = setup();

    expect(panelClassSetter).toHaveBeenCalledTimes(1);
    expect(panelClassSetter.mock.calls[0][0]).toBe('mat-exp-fab-menu mat-exp-fab-menu-primary');
  });

  it('recomputes panelClass from scratch on each color change, without accumulating previous colors', () => {
    const { fixture, host, panelClassSetter } = setup();

    host.color.set('secondary');
    fixture.detectChanges();

    expect(panelClassSetter).toHaveBeenCalledTimes(2);
    const afterSecondary = panelClassSetter.mock.calls[1][0];
    expect(afterSecondary).toBe('mat-exp-fab-menu mat-exp-fab-menu-secondary');
    expect(afterSecondary).not.toContain('primary');

    host.color.set('tertiary');
    fixture.detectChanges();

    expect(panelClassSetter).toHaveBeenCalledTimes(3);
    const afterTertiary = panelClassSetter.mock.calls[2][0];
    expect(afterTertiary).toBe('mat-exp-fab-menu mat-exp-fab-menu-tertiary');
    expect(afterTertiary).not.toContain('primary');
    expect(afterTertiary).not.toContain('secondary');
  });

  it('preserves a consumer class set on the mat-menu host across initial render and color changes', () => {
    const fixture = TestBed.createComponent(FabMenuConsumerClassTestHost);
    const host = fixture.componentInstance;

    const menu = fixture.debugElement.query(By.directive(MatMenu)).injector.get(MatMenu);
    const panelClassSetter = vi.spyOn(menu, 'panelClass', 'set');

    fixture.detectChanges();

    expect(panelClassSetter).toHaveBeenCalledTimes(1);
    const initial = panelClassSetter.mock.calls[0][0];
    expect(initial).toContain('my-custom-panel');
    expect(initial).toBe('my-custom-panel mat-exp-fab-menu mat-exp-fab-menu-primary');

    host.color.set('secondary');
    fixture.detectChanges();

    expect(panelClassSetter).toHaveBeenCalledTimes(2);
    const afterSecondary = panelClassSetter.mock.calls[1][0];
    expect(afterSecondary).toContain('my-custom-panel');
    expect(afterSecondary).toBe('my-custom-panel mat-exp-fab-menu mat-exp-fab-menu-secondary');
    expect(afterSecondary).not.toContain('primary');

    // Exactly one mat-exp-fab-menu-{color} class present, and the consumer class isn't duplicated.
    const colorMatches = afterSecondary.match(/mat-exp-fab-menu-\w+/g) ?? [];
    expect(colorMatches).toEqual(['mat-exp-fab-menu-secondary']);
    expect(
      afterSecondary.split(' ').filter((cls: string) => cls === 'my-custom-panel'),
    ).toHaveLength(1);
  });
});
