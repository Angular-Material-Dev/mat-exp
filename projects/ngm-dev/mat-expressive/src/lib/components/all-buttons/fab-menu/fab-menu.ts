import { afterNextRender, Directive, inject, input, effect } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { MatExpressiveFabMenuColor } from '../../../types/appearance';

@Directive({
  selector: '[matExpressiveFabMenu]',
})
export class MatExpressiveFabMenu {
  readonly color = input<MatExpressiveFabMenuColor>('primary');
  /**
   * @internal
   */
  public readonly matExpressiveFabMenuClass = 'mat-expressive-fab-menu';

  private readonly matMenu = inject(MatMenu, { optional: true });

  constructor() {
    afterNextRender(() => {
      if (this.matMenu) {
        this.matMenu.panelClass = [
          this.matExpressiveFabMenuClass,
          `mat-expressive-fab-menu-${this.color()}`,
          this.matMenu.panelClass,
        ].join(' ');
      }
    });

    effect(() => {
      if (this.matMenu) {
        this.matMenu.panelClass = [
          this.matExpressiveFabMenuClass,
          `mat-expressive-fab-menu-${this.color()}`,
          this.matMenu.panelClass,
        ].join(' ');
      }
    });
  }
}
