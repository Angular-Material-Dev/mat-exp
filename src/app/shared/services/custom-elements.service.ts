import { isPlatformBrowser } from '@angular/common';
import { Injectable, Injector, PLATFORM_ID, Type, inject } from '@angular/core';
import { createCustomElement } from '@angular/elements';

interface CustomElementDefinition {
  tag: string;
  loadComponent: () => Promise<Type<unknown>>;
}

/**
 * Every custom element markdown can embed, keyed by tag name. Add an entry
 * here to make a new component embeddable via markdown — `CustomElementsService`
 * takes care of lazy, once-only registration.
 */
const CUSTOM_ELEMENTS: readonly CustomElementDefinition[] = [
  {
    tag: 'playground-preview',
    loadComponent: () =>
      import('../../docs/playground-preview-element/playground-preview-element.component').then(
        (m) => m.PlaygroundPreviewElementComponent,
      ),
  },
  {
    tag: 'router-link',
    loadComponent: () =>
      import('../../shared/components/router-link/router-link').then((m) => m.RouterLinkComponent),
  },
];

/**
 * Registers Angular components as browser custom elements so markdown
 * authors can embed live, interactive content (see ADR 0001's "reinstated"
 * update). Called once from `provideAppInitializer` (see app.config.ts) —
 * each element's component still ships in its own chunk via a dynamic
 * `import()`, so registering all of them up front doesn't inline their code
 * into the main bundle, it just fetches those chunks unconditionally
 * instead of only on pages that use them.
 */
@Injectable({ providedIn: 'root' })
export class CustomElementsService {
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly pending = new Map<string, Promise<void>>();

  /** Registers every known custom element tag that isn't already defined. */
  registerAll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    for (const definition of CUSTOM_ELEMENTS) {
      void this.register(definition);
    }
  }

  private register(definition: CustomElementDefinition): Promise<void> {
    if (customElements.get(definition.tag)) return Promise.resolve();
    const existing = this.pending.get(definition.tag);
    if (existing) return existing;

    const registration = definition.loadComponent().then((component) => {
      if (!customElements.get(definition.tag)) {
        customElements.define(
          definition.tag,
          createCustomElement(component, { injector: this.injector }),
        );
      }
    });
    this.pending.set(definition.tag, registration);
    return registration;
  }
}
