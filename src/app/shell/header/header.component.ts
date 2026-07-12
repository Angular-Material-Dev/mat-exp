import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Dialog } from '@angular/cdk/dialog';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { ThemeService } from '../theme.service';
import { DeviceService } from '../../shared/services/device.service';
import { SearchModalComponent } from '../search-modal/search-modal.component';
import { CommunityDialogComponent } from '../community-dialog/community-dialog.component';
import { MatExpressiveButton } from '@ngm-dev/mat-expressive';
import { LogoComponent } from '../../shared/components/logo/logo.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatExpressiveButton,
    LogoComponent,
  ],
  host: { class: 'header' },
  templateUrl: './header.component.html',
  styles: `
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--mat-sys-surface);
    }
  `,
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly isMobile = inject(DeviceService).isHandset;

  private readonly dialog = inject(Dialog);
  private readonly matDialog = inject(MatDialog);
  private readonly document = inject(DOCUMENT);

  menuToggled = output<void>();

  constructor() {
    fromEvent<KeyboardEvent>(this.document, 'keydown')
      .pipe(takeUntilDestroyed())
      .subscribe((e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.openSearch();
        }
      });
  }

  protected openSearch(): void {
    this.dialog.open(SearchModalComponent, {
      panelClass: ['search-modal-panel', 'dialog-outlined'],
      hasBackdrop: true,
      backdropClass: 'search-modal-backdrop',
    });
  }

  protected openCommunity(): void {
    this.matDialog.open(CommunityDialogComponent, {
      autoFocus: false,
      panelClass: 'dialog-outlined',
    });
  }
}
