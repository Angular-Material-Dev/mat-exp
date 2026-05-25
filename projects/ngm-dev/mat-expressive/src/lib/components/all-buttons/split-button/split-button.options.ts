import { matExpressiveCreateOptions } from '../../../utils/di/create-options';
import {
  type MatExpressiveButtonSize,
  type MatExpressiveSplitButtonAppearance,
} from '../../../types';

// export interface MatExpressiveButtonOptions extends MatExpressinveAppearanceOptions {
export interface MatExpressiveSplitButtonOptions {
  /**
   * The size of the button.
   *
   * Default: `s`
   *
   */
  readonly size?: MatExpressiveButtonSize;
  /**
   * The label of the split button.
   *
   * Default: `tonal`
   *
   */
  readonly appearance?: MatExpressiveSplitButtonAppearance;
}

export const MAT_EXPRESSIVE_SPLIT_BUTTON_DEFAULT_OPTIONS: MatExpressiveSplitButtonOptions = {
  size: 's',
  appearance: 'tonal',
};

const [_MAT_EXPRESSIVE_SPLIT_BUTTON_OPTIONS, _provideMatExpressiveSplitButtonOptions] =
  matExpressiveCreateOptions(MAT_EXPRESSIVE_SPLIT_BUTTON_DEFAULT_OPTIONS);

export const MAT_EXPRESSIVE_SPLIT_BUTTON_OPTIONS = _MAT_EXPRESSIVE_SPLIT_BUTTON_OPTIONS;
export function provideMatExpressiveSplitButtonOptions(
  options:
    | Partial<MatExpressiveSplitButtonOptions>
    | (() => Partial<MatExpressiveSplitButtonOptions>),
) {
  return _provideMatExpressiveSplitButtonOptions(options);
}
