import { matExpressiveCreateOptions } from '../../../utils/di/create-options';
import {
  type MatExpressiveButtonShape,
  type MatExpressiveButtonState,
  type MatExpressiveButtonSize,
  MatExpressiveButtonToggle,
  type MatExpressiveIconButtonWidth,
  MatExpressiveIconButtonAppearance,
} from '../../../types';

export interface MatExpressiveIconButtonOptions {
  /**
   * The appearance of the icon button.
   *
   * Default: `text`
   *
   */
  readonly appearance?: MatExpressiveIconButtonAppearance;
  /**
   * The size of the icon button.
   *
   * Default: `s`
   *
   */
  readonly size?: MatExpressiveButtonSize;
  /**
   * The shape of the icon button.
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
   * The width of the icon button.
   */
  readonly width?: MatExpressiveIconButtonWidth;
  /**
   * @internal
   */
  readonly state?: MatExpressiveButtonState;
  /**
   * The class to be applied to the icon button. Should be same as [`mat-expressive-icon-button-class` style option](/components/all-buttons/icon-button/styling#mat-expressive-icon-button-class)
   *
   * Default: `mat-expressive-icon-button`
   *
   */
  // readonly matExpressiveIconButtonClass?: string;
}

export const MAT_EXPRESSIVE_ICON_BUTTON_DEFAULT_OPTIONS: MatExpressiveIconButtonOptions = {
  size: 's',
  shape: 'round',
  width: 'default',
  appearance: 'text',
  // matExpressiveIconButtonClass: 'mat-expressive-icon-button',
};

const [_MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS, _provideMatExpressiveIconButtonOptions] =
  matExpressiveCreateOptions(MAT_EXPRESSIVE_ICON_BUTTON_DEFAULT_OPTIONS);

export const MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS = _MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS;
export function provideMatExpressiveIconButtonOptions(
  options:
    | Partial<MatExpressiveIconButtonOptions>
    | (() => Partial<MatExpressiveIconButtonOptions>),
) {
  return _provideMatExpressiveIconButtonOptions(options);
}
