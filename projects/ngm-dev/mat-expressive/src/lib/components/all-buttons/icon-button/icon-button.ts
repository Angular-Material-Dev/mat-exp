import { afterNextRender, Directive, inject, Input, input, model } from '@angular/core';
import { MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS } from './icon-button.options';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatExpressiveSelectableButton } from '../selectable-button/selectable-button';
import { MatExpressiveButtonGroup } from '../button-group';
import { MatExpressiveButtonToggle, MatExpressiveIconButtonAppearance } from '../../../types';
import { MatExpressiveSplitButton } from '../split-button';
/**
 * Directive to style the Angular Material Icon Button component with latest Material 3 Design System Expressive styles.
 */
@Directive({
  selector: '[matExpressiveIconButton]',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-appearance]': 'appearance',
    '[attr.data-state]': 'state()',
    '[attr.data-toggle]': 'toggle()',
    '[attr.data-width]': 'width()',
    '[class]': 'matExpressiveIconButtonClass',
    '(click)': '_onButtonClick()',
  },
  exportAs: 'matExpressiveIconButton',
})
export class MatExpressiveIconButton implements MatExpressiveSelectableButton {
  public readonly size = model(inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).size);
  public readonly shape = model(inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).shape);
  public readonly width = input(inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).width);
  public readonly toggle = model<MatExpressiveButtonToggle | undefined>(
    inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).toggle,
  );
  public readonly value = model<any>();

  private _appearance = inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).appearance;
  @Input()
  get appearance(): MatExpressiveIconButtonAppearance | undefined {
    return this._appearance;
  }
  set appearance(appearance: MatExpressiveIconButtonAppearance | undefined) {
    this._appearance = appearance;
  }
  /**
   * @internal
   */
  // public readonly matExpressiveIconButtonClass = inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS)
  //   .matExpressiveIconButtonClass;

  /**
   * @internal
   */
  public readonly matExpressiveIconButtonClass = 'mat-expressive-icon-button';

  /**
   * @internal
   */
  public readonly state = input(inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).state);

  get disabled(): boolean {
    return this.matIconButton.disabled;
  }
  set disabled(disabled: boolean | undefined) {
    this.matIconButton.disabled = disabled;
  }

  private readonly matIconButton = inject(MatIconButton);
  private readonly buttonGroup = inject(MatExpressiveButtonGroup, { optional: true });

  _onButtonClick(): void {
    this.buttonGroup?._onButtonClick(this);
  }
}
