import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { matExpressiveWithStyles } from '../../utils/misc/with-styles';

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
  },
})
export class MatExpressiveFabMenuTrigger {
  protected readonly nothing = matExpressiveWithStyles(MatExpressiveFabMenuTriggerStyles);
  /**
   * @internal
   */
  public readonly matExpressiveFabMenuTriggerClass = 'mat-expressive-fab-menu-trigger';

  private readonly matMenuTrigger = inject(MatMenuTrigger);

  get isMenuOpen(): boolean {
    return this.matMenuTrigger?.menuOpen ?? false;
  }
}
