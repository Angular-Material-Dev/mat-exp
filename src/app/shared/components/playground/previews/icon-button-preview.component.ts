import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpIconButton,
  MatExpIconButtonAppearance,
  type MatExpButtonShape,
  type MatExpButtonSize,
  type MatExpButtonToggle,
  type MatExpIconButtonWidth,
} from '@ngm-dev/mat-exp';

/** @playgroundFor MatExpIconButton */
@Component({
  selector: 'app-icon-button-preview',

  imports: [MatIconButton, MatExpIconButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon-button-preview.component.html',
  styleUrl: './icon-button-preview.component.scss',
})
export class IconButtonPreviewComponent {
  readonly size = input<MatExpButtonSize>('s');
  readonly shape = input<MatExpButtonShape>('round');
  readonly width = input<MatExpIconButtonWidth>('default');
  readonly toggle = input<MatExpButtonToggle | undefined>(undefined);
  readonly appearance = input<MatExpIconButtonAppearance>('text');
  readonly disabled = input<boolean>(false);
}
