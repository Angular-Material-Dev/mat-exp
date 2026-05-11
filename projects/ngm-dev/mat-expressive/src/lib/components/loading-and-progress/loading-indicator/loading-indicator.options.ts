import { matExpressiveCreateOptions } from '../../../utils/di/create-options';
import { type MatExpressiveLoadingIndicatorConfig } from '../../../types';

export interface MatExpressiveLoadingIndicatorOptions {
  /**
   * The config of the loading indicator.
   *
   * Default: `default`
   *
   */
  readonly config?: MatExpressiveLoadingIndicatorConfig;
}

export const MAT_EXPRESSIVE_LOADING_INDICATOR_DEFAULT_OPTIONS: MatExpressiveLoadingIndicatorOptions =
  {
    config: 'default',
  };

const [_MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS, _provideMatExpressiveLoadingIndicatorOptions] =
  matExpressiveCreateOptions(MAT_EXPRESSIVE_LOADING_INDICATOR_DEFAULT_OPTIONS);

export const MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS = _MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS;
export function provideMatExpressiveLoadingIndicatorOptions(
  options:
    | Partial<MatExpressiveLoadingIndicatorOptions>
    | (() => Partial<MatExpressiveLoadingIndicatorOptions>),
) {
  return _provideMatExpressiveLoadingIndicatorOptions(options);
}
