import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpButton,
  MatExpIconButton,
  MatExpSplitButton,
  type MatExpButtonSize,
  type MatExpSplitButtonAppearance,
} from '@ngm-dev/mat-exp';
import { MatMenu, MatMenuTrigger, MatMenuItem } from '@angular/material/menu';

/** @playgroundFor MatExpSplitButton */
@Component({
  selector: 'app-split-button-preview',

  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatExpButton,
    MatExpIconButton,
    MatExpSplitButton,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './split-button-preview.component.html',
  styleUrl: './split-button-preview.component.scss',
})
export class SplitButtonPreviewComponent {
  readonly size = input<MatExpButtonSize>('s');
  readonly appearance = input<MatExpSplitButtonAppearance>('tonal');
}
