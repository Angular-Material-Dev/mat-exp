import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { MatMenu } from '@angular/material/menu';

@Directive({
  selector: '[matExpressiveFabMenu]',
})
export class MatExpressiveFabMenu {
  /**
   * @internal
   */
  public readonly matExpressiveFabMenuClass = 'mat-expressive-fab-menu';

  private readonly matMenu = inject(MatMenu, { optional: true });

  constructor() {
    afterNextRender(() => {
      if (this.matMenu) {
        this.matMenu.panelClass = [this.matExpressiveFabMenuClass, this.matMenu.panelClass].join(
          ' ',
        );
      }
    });
  }
}
