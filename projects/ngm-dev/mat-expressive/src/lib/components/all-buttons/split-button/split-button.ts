import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  model,
} from '@angular/core';
import { MAT_EXPRESSIVE_SPLIT_BUTTON_OPTIONS } from './split-button.options';
import { MatExpressiveIconButton } from '../icon-button';
import { MatExpressiveButton } from '../button';

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
@Component({
  selector: 'mat-expressive-split-button',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-appearance]': 'appearance()',
    '[class]': 'matExpressiveSplitButtonClass',
  },
  template: '<ng-content></ng-content>',
  // styleUrls: ['./split-button.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // encapsulation: ViewEncapsulation.None,
})
export class MatExpressiveSplitButton {
  // protected readonly nothing = matExpressiveWithStyles(Styles);

  public readonly size = model(inject(MAT_EXPRESSIVE_SPLIT_BUTTON_OPTIONS).size);
  public readonly appearance = model(inject(MAT_EXPRESSIVE_SPLIT_BUTTON_OPTIONS).appearance);
  /**
   * @internal
   */
  // public readonly matExpressiveButtonClass = inject(MAT_EXPRESSIVE_BUTTON_OPTIONS)
  //   .matExpressiveButtonClass;

  /**
   * @internal
   */
  public readonly matExpressiveSplitButtonClass = 'mat-expressive-split-button';

  readonly _matExpressiveButtons = contentChildren<MatExpressiveButton>(MatExpressiveButton);
  readonly _matExpressiveIconButtons =
    contentChildren<MatExpressiveIconButton>(MatExpressiveIconButton);
  readonly _allExpressiveButtons = computed(() => [
    ...this._matExpressiveButtons(),
    ...this._matExpressiveIconButtons(),
  ]);

  constructor() {
    effect(() => {
      const size = this.size();
      if (size) {
        this._allExpressiveButtons().forEach((button) => {
          button.size.set(size);
        });
      }
    });

    effect(() => {
      const appearance = this.appearance();
      if (appearance) {
        this._allExpressiveButtons().forEach((button) => {
          button.appearance = appearance;
        });
      }
    });
  }
}
