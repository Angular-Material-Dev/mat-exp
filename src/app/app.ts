import {
  NgDocRootComponent,
  NgDocNavbarComponent,
  NgDocSidebarComponent,
  NgDocThemeToggleComponent,
} from '@ng-doc/app';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  NgDocIconComponent,
  NgDocButtonIconComponent,
  NgDocTooltipDirective,
} from '@ng-doc/ui-kit';

@Component({
  selector: 'app-root',
  imports: [
    NgDocRootComponent,
    NgDocNavbarComponent,
    NgDocSidebarComponent,
    RouterOutlet,
    NgDocThemeToggleComponent,
    NgDocIconComponent,
    NgDocButtonIconComponent,
    NgDocTooltipDirective,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('mat-expressive-docs');
}
