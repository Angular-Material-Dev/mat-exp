import { matExpressiveCreateOptions } from '../../utils/di/create-options';
import { type MatExpressinveAppearanceOptions } from '../../common/appearance.options';
import {
  type MatExpressiveButtonShape,
  type MatExpressiveButtonState,
  type MatExpressiveButtonSize,
  MatExpressiveButtonToggle,
} from '../../types';

export interface MatExpressiveButtonOptions extends MatExpressinveAppearanceOptions {
  readonly size: MatExpressiveButtonSize;
  readonly shape: MatExpressiveButtonShape;
  readonly toggle: MatExpressiveButtonToggle;
  readonly state?: MatExpressiveButtonState;
}

export const MAT_EXPRESSIVE_BUTTON_DEFAULT_OPTIONS: MatExpressiveButtonOptions = {
  size: 's',
  shape: 'round',
  toggle: 'unselected',
};

export const [MAT_EXPRESSIVE_BUTTON_OPTIONS, matExpressiveButtonOptionsProvider] =
  matExpressiveCreateOptions(MAT_EXPRESSIVE_BUTTON_DEFAULT_OPTIONS);
