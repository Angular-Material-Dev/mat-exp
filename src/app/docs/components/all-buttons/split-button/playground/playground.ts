import { Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveButton,
  MatExpressiveSplitButton,
  MatExpressiveSplitButtonAppearance,
  MatExpressiveButtonSize,
} from '@ngm-dev/mat-expressive';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-docs-split-button-playground',
  imports: [
    MatExpressiveSplitButton,
    MatExpressiveButton,
    MatIcon,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class DocsSplitButtonPlayground {
  readonly size = input<MatExpressiveButtonSize>('s');
  readonly appearance = input<MatExpressiveSplitButtonAppearance>('tonal');
}
