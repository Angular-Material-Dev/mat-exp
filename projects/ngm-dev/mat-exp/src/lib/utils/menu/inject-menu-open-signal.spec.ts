import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type MatMenuTrigger } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { injectIsMenuOpenSignal } from './inject-menu-open-signal';

/** Minimal `MatMenuTrigger` fake exposing just the surface `injectIsMenuOpenSignal` reads. */
class FakeMatMenuTrigger {
  menuOpen = false;
  readonly menuOpened = new Subject<void>();
  readonly menuClosed = new Subject<void>();

  open(): void {
    this.menuOpen = true;
    this.menuOpened.next();
  }

  close(): void {
    this.menuOpen = false;
    this.menuClosed.next();
  }
}

describe('injectIsMenuOpenSignal', () => {
  it('returns a constant `false` signal when no trigger is provided', () => {
    @Component({ template: '' })
    class NoTriggerHost {
      readonly isMenuOpen = injectIsMenuOpenSignal(null);
    }

    const fixture = TestBed.createComponent(NoTriggerHost);
    fixture.detectChanges();

    expect(fixture.componentInstance.isMenuOpen()).toBe(false);
  });

  it('seeds the initial value from `matMenuTrigger.menuOpen`', () => {
    const trigger = new FakeMatMenuTrigger();
    trigger.menuOpen = true;

    @Component({ template: '' })
    class PreOpenedHost {
      readonly isMenuOpen = injectIsMenuOpenSignal(trigger as unknown as MatMenuTrigger);
    }

    const fixture = TestBed.createComponent(PreOpenedHost);
    fixture.detectChanges();

    expect(fixture.componentInstance.isMenuOpen()).toBe(true);
  });

  it('flips to `true` on `menuOpened` and back to `false` on `menuClosed`', () => {
    const trigger = new FakeMatMenuTrigger();

    @Component({ template: '' })
    class TriggerHost {
      readonly isMenuOpen = injectIsMenuOpenSignal(trigger as unknown as MatMenuTrigger);
    }

    const fixture = TestBed.createComponent(TriggerHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    expect(host.isMenuOpen()).toBe(false);

    trigger.open();
    expect(host.isMenuOpen()).toBe(true);

    trigger.close();
    expect(host.isMenuOpen()).toBe(false);

    trigger.open();
    expect(host.isMenuOpen()).toBe(true);
  });
});
