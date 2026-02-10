import { type FactoryProvider, InjectionToken } from '@angular/core';

import { matExpressiveProvideOptions } from './provide-options';

export function matExpressiveCreateOptions<T>(
  defaults: T,
): [
  token: InjectionToken<T>,
  provider: (item: Partial<T> | (() => Partial<T>)) => FactoryProvider,
] {
  const token = new InjectionToken(ngDevMode ? 'Options token' : '', {
    factory: () => defaults,
  });

  return [token, (options) => matExpressiveProvideOptions(token, options, defaults)];
}
