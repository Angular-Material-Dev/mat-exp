import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarNavComponent } from '../sidebar-nav/sidebar-nav.component';
import { DocPrevNextComponent } from '../doc-prev-next/doc-prev-next.component';
import { DeviceService } from '../../shared/services/device.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-docs-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    HeaderComponent,
    SidebarNavComponent,
    DocPrevNextComponent,
    FooterComponent,
  ],
  host: { class: 'shell' },
  templateUrl: './docs-shell.component.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export class DocsShellComponent {
  protected readonly isMobile = inject(DeviceService).isHandset;
  protected readonly drawerOpen = linkedSignal(() => (this.isMobile() ? false : true));
}
