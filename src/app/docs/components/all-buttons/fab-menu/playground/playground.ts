import { Component, effect, input, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton, MatAnchor, MatButton, MatFabButton } from '@angular/material/button';
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
  MatExpressiveButtonGroupShape,
  MatExpressiveButtonGroupAppearance,
  MatExpressiveSelectableButtonChange,
  MatExpressiveSplitButton,
  MatExpressiveSplitButtonAppearance,
  MatExpressiveButtonSize,
  MatExpressiveFabMenu,
  MatExpressiveFabMenuTrigger,
} from '@ngm-dev/mat-expressive';
import { JsonPipe } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger, MenuPositionX } from '@angular/material/menu';

@Component({
  selector: 'app-docs-fab-menu-playground',
  imports: [
    MatExpressiveFabMenu,
    MatExpressiveFabMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatFabButton,
  ],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class DocsFabMenuPlayground {}
