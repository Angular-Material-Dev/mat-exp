import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS } from './button-group.options';
import { MatExpressiveButton } from '../button';
import { MatExpressiveIconButton } from '../icon-button';

/**
 * Directive to style the Angular Material Button component with latest Material 3 Design System Expressive styles.
 */
@Component({
  selector: 'mat-expressive-button-group',
  templateUrl: './button-group.html',
  styleUrls: ['./button-group.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'matExpressiveButtonGroupClass',
    '[attr.data-variant]': 'variant()',
    '[attr.data-selection]': 'selection()',
    '[attr.data-size]': 'size()',
  }
})
export class MatExpressiveButtonGroup {
  public readonly size = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).size);
  public readonly selection = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).selection);
  public readonly variant = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).variant);
  /**
   * @internal
   */
  public readonly matExpressiveButtonGroupClass = inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS)
    .matExpressiveButtonGroupClass;

    matExpressiveButtons = contentChildren<MatExpressiveButton>(MatExpressiveButton);
    matExpressiveIconButtons = contentChildren<MatExpressiveIconButton>(MatExpressiveIconButton);

    constructor() {
      effect(() => {
        const size = this.size();

        if (size) {
          this.matExpressiveButtons().forEach(button => {
            button.size.set(size)
          });
          this.matExpressiveIconButtons().forEach(iconButton => {
            iconButton.size.set(size)
          });
        }
      })
    }
}
