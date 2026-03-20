import { Component, input } from '@angular/core';
import { MatIconButton, MatAnchor } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveButtonGroup,
  MatExpressiveIconButtonAppearance,
  MatExpressiveIconButtonWidth,
  type MatExpressiveButtonShape,
  type MatExpressiveButtonGroupSize,
  type MatExpressiveButtonToggle,
  MatExpressiveButtonGroupSelection,
  MatExpressiveButtonGroupVariant,
  MatExpressiveButton,
  MatExpressiveIconButton,
} from '@ngm-dev/mat-expressive';

@Component({
  selector: 'app-docs-button-group-playground',
  imports: [MatExpressiveButtonGroup, MatExpressiveButton, MatExpressiveIconButton, MatAnchor, MatIcon, MatIconButton],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class DocsButtonGroupPlayground {
  readonly size = input<MatExpressiveButtonGroupSize>('s');
  readonly selection = input<MatExpressiveButtonGroupSelection>();
  readonly variant = input<MatExpressiveButtonGroupVariant>('standard');
}
