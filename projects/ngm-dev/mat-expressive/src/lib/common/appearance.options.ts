import { type ExistingProvider, InjectionToken, type ProviderToken } from '@angular/core';
import { matExpressiveProvide } from '../utils/di/provide';

/**
 * Bundled appearances for autocomplete purposes, not exported on purpose
 */
type Appearance = string;

export interface MatExpressinveAppearanceOptions {
  readonly appearance?: Appearance | '';
}

export const MAT_EXPRESSINVE_APPEARANCE_DEFAULT_OPTIONS: MatExpressinveAppearanceOptions = {
  appearance: '',
};

export const MAT_EXPRESSIVE_APPEARANCE_OPTIONS = new InjectionToken(
  ngDevMode ? 'MAT_EXPRESSIVE_APPEARANCE_OPTIONS' : '',
  { factory: () => MAT_EXPRESSINVE_APPEARANCE_DEFAULT_OPTIONS },
);

export function matExpressiveAppearanceOptionsProvider(
  token: ProviderToken<MatExpressinveAppearanceOptions>,
): ExistingProvider {
  return matExpressiveProvide(MAT_EXPRESSIVE_APPEARANCE_OPTIONS, token);
}
