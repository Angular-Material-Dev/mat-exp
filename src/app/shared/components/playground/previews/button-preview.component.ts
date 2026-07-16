import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpButton,
  type MatExpButtonShape,
  type MatExpButtonSize,
  type MatExpButtonToggle,
} from '@ngm-dev/mat-exp';

/** @playgroundFor MatExpButton */
@Component({
  selector: 'app-button-preview',

  imports: [MatButton, MatExpButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button-preview.component.html',
  styleUrl: './button-preview.component.scss',
})
export class ButtonPreviewComponent {
  readonly size = input<MatExpButtonSize>('s');
  readonly shape = input<MatExpButtonShape>('round');
  readonly toggle = input<MatExpButtonToggle | undefined>(undefined);
  readonly appearance = input<MatButtonAppearance>('text');
  /**
   * @name Icon Position
   */
  readonly iconPosition = input<'before' | 'after'>('before');
  readonly disabled = input<boolean>(false);
}
