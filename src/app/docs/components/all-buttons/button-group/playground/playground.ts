import { Component, effect, input, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton, MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveButtonGroup,
  type MatExpressiveButtonGroupSize,
  MatExpressiveButtonGroupSelection,
  MatExpressiveButtonGroupVariant,
  MatExpressiveButton,
  MatExpressiveIconButton,
  MatExpressiveButtonGroupShape,
  MatExpressiveButtonGroupAppearance,
  MatExpressiveSelectableButtonChange,
} from '@ngm-dev/mat-expressive';

@Component({
  selector: 'app-docs-button-group-playground',
  imports: [
    MatExpressiveButtonGroup,
    MatExpressiveButton,
    MatExpressiveIconButton,
    MatAnchor,
    MatIcon,
    MatIconButton,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class DocsButtonGroupPlayground {
  readonly size = input<MatExpressiveButtonGroupSize>('s');
  readonly selection = input<MatExpressiveButtonGroupSelection>('single-select');
  readonly variant = input<MatExpressiveButtonGroupVariant>('standard');
  readonly shape = input<MatExpressiveButtonGroupShape>('round');
  readonly appearance = input<MatExpressiveButtonGroupAppearance>('tonal');
  readonly disabled = input<boolean>(false);

  readonly myControl = new FormControl<string | string[] | undefined>(undefined);
  readonly myModel = model<string | string[] | undefined>(undefined);

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.myControl.disable({ emitEvent: false });
      } else {
        this.myControl.enable({ emitEvent: false });
      }
    });
  }

  onChange(event: MatExpressiveSelectableButtonChange) {
    console.log(event);
  }
}
