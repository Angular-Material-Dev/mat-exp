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

@Directive({
  selector: '[matButton][matExpressiveButton]',
  providers: [matExpressiveAppearanceOptionsProvider(MAT_EXPRESSIVE_BUTTON_OPTIONS)],
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-state]': 'state()',
    class: 'mat-expressive-button',
  },
})
export class MatExpressiveButton {
  // protected readonly nothing = matExpressiveWithStyles(Styles);

  public readonly size = input(inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).size);
  public readonly shape = input(inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).shape);
  public readonly state = input(inject(MAT_EXPRESSIVE_BUTTON_OPTIONS).state);
}
