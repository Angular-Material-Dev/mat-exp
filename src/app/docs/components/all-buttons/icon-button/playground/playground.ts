import { Component, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveIconButton,
  MatExpressiveIconButtonAppearance,
  type MatExpressiveButtonShape,
  type MatExpressiveButtonSize,
  type MatExpressiveButtonToggle,
} from '@ngm-dev/mat-expressive';

@Component({
  selector: 'app-docs-icon-button-playground',
  imports: [MatExpressiveIconButton, MatDivider, MatIcon, MatIconButton],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class DocsIconButtonPlayground {
  readonly size = input<MatExpressiveButtonSize>('s');
  readonly shape = input<MatExpressiveButtonShape>('round');
  readonly toggle = input<MatExpressiveButtonToggle | undefined>(undefined);
  readonly appearance = input<MatExpressiveIconButtonAppearance>('text');
}
