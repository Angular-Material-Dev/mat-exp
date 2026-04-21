import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { matExpressiveWithStyles } from '../../utils/misc/with-styles';
import { MatExpressiveFabMenuTriggerColor } from '../../types/appearance';

@Component({
  template: '',
  styleUrls: ['./fab-menu-trigger.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MatExpressiveFabMenuTriggerStyles {}

@Directive({
  selector: '[matExpressiveFabMenuTrigger]',
  host: {
    '[attr.data-menu-open]': 'isMenuOpen',
    '[class]': 'matExpressiveFabMenuTriggerClass',
    '[attr.data-color]': 'color()',
  },
})
export class MatExpressiveFabMenuTrigger {
  protected readonly nothing = matExpressiveWithStyles(MatExpressiveFabMenuTriggerStyles);
  /**
   * @internal
   */
  public readonly matExpressiveFabMenuTriggerClass = 'mat-expressive-fab-menu-trigger';

  public readonly color = input<MatExpressiveFabMenuTriggerColor>('primary');

  private readonly matMenuTrigger = inject(MatMenuTrigger);

  get isMenuOpen(): boolean {
    return this.matMenuTrigger?.menuOpen ?? false;
  }
}
