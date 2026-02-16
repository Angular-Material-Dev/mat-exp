import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { matExpressiveAppearanceOptionsProvider } from '../../common/appearance.options';
import { MAT_EXPRESSIVE_BUTTON_OPTIONS } from './button.options';
import { matExpressiveWithStyles } from '../../utils/misc/with-styles';

// @Component({
//   template: '',
//   styleUrls: ['./button.scss'],
//   encapsulation: ViewEncapsulation.None,
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// class Styles {}
/**
 * Directive to style the Angular Material Button component with latest Material 3 Design System Expressive styles.
 */
@Directive({
  selector: '[matExpressiveButton]',
  providers: [matExpressiveAppearanceOptionsProvider(MAT_EXPRESSIVE_BUTTON_OPTIONS)],
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-state]': 'state()',
    '[attr.data-toggle]': 'toggle()',
    '[class]': 'matExpressiveButtonClass',
  },
})
export class MatExpressiveButton {
  // protected readonly nothing = matExpressiveWithStyles(Styles);

  public readonly size = input(inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).size);
  public readonly shape = input(inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).shape);
  public readonly toggle = input(inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).toggle);
  /**
   * @internal
   */
  public readonly matExpressiveButtonClass = inject(MAT_EXPRESSIVE_BUTTON_OPTIONS)
    .matExpressiveButtonClass;

  /**
   * @internal
   */
  public readonly state = input(inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).state);
}
