import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatExpFabMenu, MatExpFabMenuTrigger, type MatExpFabMenuColor } from '@ngm-dev/mat-exp';

/** @playgroundFor MatExpFabMenu */
@Component({
  selector: 'app-fab-menu-preview',

  imports: [
    MatFabButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatExpFabMenu,
    MatExpFabMenuTrigger,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fab-menu-preview.component.html',
  styleUrl: './fab-menu-preview.component.scss',
})
export class FabMenuPreviewComponent {
  readonly color = input<MatExpFabMenuColor>('primary');
}
