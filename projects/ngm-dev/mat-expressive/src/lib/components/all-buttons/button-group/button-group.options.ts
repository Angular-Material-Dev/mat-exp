import { matExpressiveCreateOptions } from '../../../utils/di/create-options';
import {
  MatExpressiveButtonGroupSelection,
  MatExpressiveButtonGroupShape,
  MatExpressiveButtonGroupVariant,
  type MatExpressiveButtonGroupSize,
  type MatExpressiveButtonGroupAppearance,
} from '../../../types';

// export interface MatExpressiveButtonOptions extends MatExpressinveAppearanceOptions {
export interface MatExpressiveButtonGroupOptions {
  /**
   * The appearance of the buttons.
   *
   */
  readonly appearance?: MatExpressiveButtonGroupAppearance;
  /**
   * The size of the button.
   *
   * Default: `s`
   *
   */
  readonly size?: MatExpressiveButtonGroupSize;
  /**
   * The shape of the buttons.
   *
   * Default: `round`
   *
   */
  readonly shape?: MatExpressiveButtonGroupShape;
  /**
   * The selection of the button group.
   */
  readonly selection?: MatExpressiveButtonGroupSelection;
  /**
   * The variant of the button group.
   *
   * Default: `standard`
   *
   */
  readonly variant?: MatExpressiveButtonGroupVariant;
  /**
   * The disabled state of the button group.
   *
   * Default: `false`
   *
   */
  readonly disabled?: boolean;
  /**
   * The class to be applied to the button group. Should be same as [`mat-expressive-button-group-class` style option](/components/all-buttons/button-group/styling#mat-expressive-button-group-class)
   *
   * Default: `mat-expressive-button-group`
   *
   */
  // readonly matExpressiveButtonGroupClass?: string;
}

export const MAT_EXPRESSIVE_BUTTON_GROUP_DEFAULT_OPTIONS: MatExpressiveButtonGroupOptions = {
  size: 's',
  shape: 'round',
  variant: 'standard',
  selection: 'single-select',
  // matExpressiveButtonGroupClass: 'mat-expressive-button-group',
};

const [_MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS, _provideMatExpressiveButtonGroupOptions] =
  matExpressiveCreateOptions(MAT_EXPRESSIVE_BUTTON_GROUP_DEFAULT_OPTIONS);

export const MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS = _MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS;
export function provideMatExpressiveButtonGroupOptions(
  options:
    | Partial<MatExpressiveButtonGroupOptions>
    | (() => Partial<MatExpressiveButtonGroupOptions>),
) {
  return _provideMatExpressiveButtonGroupOptions(options);
}
