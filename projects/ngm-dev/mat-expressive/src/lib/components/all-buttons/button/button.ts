import { Directive, inject, input, model } from '@angular/core';
import { MAT_EXPRESSIVE_BUTTON_OPTIONS } from './button.options';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { MatExpressiveButtonGroup } from '../button-group';
import { MatExpressiveSelectableButton } from '../selectable-button/selectable-button';
import { MatExpressiveButtonToggle } from '../../../types';
import { MatMenuTrigger } from '@angular/material/menu';

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
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-state]': 'state()',
    '[attr.data-toggle]': 'toggle()',
    '[attr.data-menu-open]': 'isMenuOpen',
    '[class]': 'matExpressiveButtonClass',
    '(click)': '_onButtonClick()',
  },
  exportAs: 'matExpressiveButton',
})
export class MatExpressiveButton implements MatExpressiveSelectableButton {
  // protected readonly nothing = matExpressiveWithStyles(Styles);

  public readonly size = model(inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).size);
  public readonly shape = model(inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).shape);
  public readonly toggle = model<MatExpressiveButtonToggle | undefined>(
    inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).toggle,
  );
  public readonly value = model<unknown>();
  /**
   * @internal
   */
  // public readonly matExpressiveButtonClass = inject(MAT_EXPRESSIVE_BUTTON_OPTIONS)
  //   .matExpressiveButtonClass;

  /**
   * @internal
   */
  public readonly matExpressiveButtonClass = 'mat-expressive-button';

  /**
   * @internal
   */
  public readonly state = input(inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).state);

  get appearance(): MatButtonAppearance | null {
    return this.matButton.appearance;
  }
  set appearance(appearance: MatButtonAppearance) {
    this.matButton.appearance = appearance;
  }

  get disabled(): boolean {
    return this.matButton.disabled;
  }
  set disabled(disabled: boolean | undefined) {
    this.matButton.disabled = disabled;
  }

  private readonly matButton = inject(MatButton);
  private readonly buttonGroup = inject(MatExpressiveButtonGroup, { optional: true });

  _onButtonClick(): void {
    this.buttonGroup?._onButtonClick(this);
  }
  private readonly matMenu = inject(MatMenuTrigger, { optional: true });

  get isMenuOpen(): boolean {
    return this.matMenu?.menuOpen ?? false;
  }
}
