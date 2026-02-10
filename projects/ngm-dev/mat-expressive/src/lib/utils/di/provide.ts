import { type ExistingProvider, type ProviderToken } from '@angular/core';

export function matExpressiveProvide<T>(
  provide: ProviderToken<T>,
  useExisting: ProviderToken<T>,
): ExistingProvider;
export function matExpressiveProvide<T>(
  provide: ProviderToken<T | T[]>,
  useExisting: ProviderToken<T>,
  multi: boolean,
): ExistingProvider;
export function matExpressiveProvide<T>(
  provide: ProviderToken<T>,
  useExisting: ProviderToken<T>,
  multi = false,
): ExistingProvider {
  return { provide, useExisting, multi };
}
