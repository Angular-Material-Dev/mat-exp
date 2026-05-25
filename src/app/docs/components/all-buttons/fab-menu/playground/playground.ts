import { Component, input } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatExpressiveFabMenu,
  MatExpressiveFabMenuTrigger,
  MatExpressiveFabMenuTriggerColor,
} from '@ngm-dev/mat-expressive';
import {
  MatMenu,
  MatMenuItem,
  MatMenuTrigger,
  MenuPositionX,
  MenuPositionY,
} from '@angular/material/menu';

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
export class DocsFabMenuPlayground {
  readonly xPosition = input<MenuPositionX>('before');
  readonly yPosition = input<MenuPositionY>('below');
  readonly color = input<MatExpressiveFabMenuTriggerColor>('primary');
}
