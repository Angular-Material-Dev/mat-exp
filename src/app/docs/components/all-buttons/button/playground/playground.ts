import { Component, input } from '@angular/core';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveButton,
  MatExpressiveButtonShape,
  MatExpressiveButtonSize,
  MatExpressiveButtonToggle,
} from '@ngm-dev/mat-expressive';

@Component({
  selector: 'app-docs-button-playground',
  imports: [MatButton, MatExpressiveButton, MatDivider, MatIcon],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class DocsButtonPlayground {
  readonly size = input<MatExpressiveButtonSize>('s');
  readonly shape = input<MatExpressiveButtonShape>('round');
  readonly toggle = input<MatExpressiveButtonToggle>('unselected');
  readonly appearance = input<MatButtonAppearance>('text');
  readonly iconPosition = input<'start' | 'end'>('start');
}
