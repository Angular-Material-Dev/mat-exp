import { matExpressiveCreateOptions } from '../../utils/di/create-options';
import {
  type MatExpressiveButtonShape,
  type MatExpressiveButtonState,
  type MatExpressiveButtonSize,
  MatExpressiveButtonToggle,
} from '../../types';

// export interface MatExpressiveButtonOptions extends MatExpressinveAppearanceOptions {
export interface MatExpressiveButtonOptions {
  /**
   * The size of the button.
   *
   * Default: `s`
   *
   */
  readonly size?: MatExpressiveButtonSize;
  /**
   * The shape of the button.
   *
   * Default: `round`
   *
   */
  readonly shape?: MatExpressiveButtonShape;
  /**
   * The toggle state of the button.
   */
  readonly toggle?: MatExpressiveButtonToggle;
  /**
   * @internal
   */
  readonly state?: MatExpressiveButtonState;
  /**
   * The class to be applied to the button. Should be same as [`mat-expressive-button-class` style option](/components/all-buttons/button/styling#mat-expressive-button-class)
   *
   * Default: `mat-expressive-button`
   *
   */
  readonly matExpressiveButtonClass?: string;
}

export const MAT_EXPRESSIVE_BUTTON_DEFAULT_OPTIONS: MatExpressiveButtonOptions = {
  size: 's',
  shape: 'round',
  matExpressiveButtonClass: 'mat-expressive-button',
};

const [_MAT_EXPRESSIVE_BUTTON_OPTIONS, _provideExpressiveButtonOptions] =
  matExpressiveCreateOptions(MAT_EXPRESSIVE_BUTTON_DEFAULT_OPTIONS);

export const MAT_EXPRESSIVE_BUTTON_OPTIONS = _MAT_EXPRESSIVE_BUTTON_OPTIONS;
export function provideExpressiveButtonOptions(
  options: Partial<MatExpressiveButtonOptions> | (() => Partial<MatExpressiveButtonOptions>),
) {
  return _provideExpressiveButtonOptions(options);
}
