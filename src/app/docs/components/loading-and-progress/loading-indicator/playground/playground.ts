import { Component, input, signal } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import {
  MatExpressiveLoadingIndicator,
  type MatExpressiveLoadingIndicatorConfig,
  type MatExpressiveLoadingIndicatorSpeed,
} from '@ngm-dev/mat-expressive';
import { MatAnchor } from '@angular/material/button';

@Component({
  selector: 'app-docs-loading-indicator-playground',
  imports: [MatDivider, MatExpressiveLoadingIndicator, MatAnchor],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class DocsLoadingIndicatorPlayground {
  readonly config = input<MatExpressiveLoadingIndicatorConfig>('default');
  readonly speed = input<MatExpressiveLoadingIndicatorSpeed>('fast');
  readonly isIndicatorVisible = signal(false);

  toggleIndicator() {
    this.isIndicatorVisible.update((visible) => !visible);
  }
}
