import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { HeaderComponent } from './header/header.component';
import { SidebarNavComponent } from './sidebar-nav/sidebar-nav.component';
import { TocComponent } from './toc/toc.component';
import { DocPrevNextComponent } from './doc-prev-next/doc-prev-next.component';
import { DeviceService } from '../shared/services/device.service';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    HeaderComponent,
    SidebarNavComponent,
    TocComponent,
    DocPrevNextComponent,
  ],
  host: { class: 'shell' },
  templateUrl: './shell.component.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export class ShellComponent {
  protected readonly drawerOpen = signal(false);
  protected readonly isMobile = inject(DeviceService).isHandset;
}
