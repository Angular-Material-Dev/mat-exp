import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpButton,
  MatExpButtonGroup,
  MatExpIconButton,
  type MatExpButtonGroupAppearance,
  type MatExpButtonGroupSelection,
  type MatExpButtonGroupShape,
  type MatExpButtonGroupSize,
  type MatExpButtonGroupVariant,
} from '@ngm-dev/mat-exp';

/**
 * Preview wrapper for MatExpButtonGroup.
 * Used by the playground as the override component — ButtonGroup needs projected
 * button content that cannot be auto-generated from the schema alone.
 * @playgroundFor MatExpButtonGroup
 */
@Component({
  selector: 'app-button-group-preview',

  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatExpButton,
    MatExpButtonGroup,
    MatExpIconButton,
    ReactiveFormsModule,
    JsonPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button-group-preview.component.html',
  styleUrl: './button-group-preview.component.scss',
})
export class ButtonGroupPreviewComponent {
  readonly size = input<MatExpButtonGroupSize>('s');
  readonly shape = input<MatExpButtonGroupShape>('round');
  readonly variant = input<MatExpButtonGroupVariant>('standard');
  readonly appearance = input<MatExpButtonGroupAppearance>('tonal');
  readonly selection = input<MatExpButtonGroupSelection>('single-select');
  readonly disabled = input<boolean>(false);

  readonly control = new FormControl<string | string[] | null>(null);
}
