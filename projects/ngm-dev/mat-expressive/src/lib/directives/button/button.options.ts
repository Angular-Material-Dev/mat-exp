import { matExpressiveCreateOptions } from '../../utils/di/create-options';
import { type MatExpressinveAppearanceOptions } from '../../common/appearance.options';
import {
  type MatExpressiveButtonShape,
  MatExpressiveButtonState,
  MatExpressiveSizeM,
  MatExpressiveSizeS,
  type MatExpressiveSizeXL,
  type MatExpressiveSizeXS,
} from '../../types';

export interface MatExpressiveButtonOptions extends MatExpressinveAppearanceOptions {
  readonly size:
    | MatExpressiveSizeXL
    | MatExpressiveSizeXS
    | MatExpressiveSizeS
    | MatExpressiveSizeM;
  readonly shape: MatExpressiveButtonShape;
  readonly state?: MatExpressiveButtonState;
}

export const MAT_EXPRESSIVE_BUTTON_DEFAULT_OPTIONS: MatExpressiveButtonOptions = {
  size: 's',
  shape: 'round',
};

export const [MAT_EXPRESSIVE_BUTTON_OPTIONS, matExpressiveButtonOptionsProvider] =
  matExpressiveCreateOptions(MAT_EXPRESSIVE_BUTTON_DEFAULT_OPTIONS);
