import { Directive, inject, input, model } from '@angular/core';
import { MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS } from './icon-button.options';
/**
 * Directive to style the Angular Material Icon Button component with latest Material 3 Design System Expressive styles.
 */
@Directive({
  selector: '[matExpressiveIconButton]',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-state]': 'state()',
    '[attr.data-toggle]': 'toggle()',
    '[attr.data-width]': 'width()',
    '[class]': 'matExpressiveIconButtonClass',
  },
})
export class MatExpressiveIconButton {
  public readonly size = model(inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).size);
  public readonly shape = input(inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).shape);
  public readonly toggle = input(inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).toggle);
  public readonly width = input(inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).width);
  public readonly appearance = input(inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).appearance);
  /**
   * @internal
   */
  public readonly matExpressiveIconButtonClass = inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS)
    .matExpressiveIconButtonClass;

  /**
   * @internal
   */
  public readonly state = input(inject(MAT_EXPRESSIVE_ICON_BUTTON_OPTIONS).state);
}
