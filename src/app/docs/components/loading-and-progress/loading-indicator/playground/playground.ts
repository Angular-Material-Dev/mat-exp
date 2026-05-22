import { Component, input, signal } from '@angular/core';
import {
  MatExpressiveLoadingIndicator,
  type MatExpressiveLoadingIndicatorConfig,
  type MatExpressiveLoadingIndicatorSpeed,
} from '@ngm-dev/mat-expressive';
import { MatAnchor } from '@angular/material/button';

@Component({
  selector: 'app-docs-loading-indicator-playground',
  imports: [MatExpressiveLoadingIndicator, MatAnchor],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class DocsLoadingIndicatorPlayground {
  readonly config = input<MatExpressiveLoadingIndicatorConfig>('default');
  readonly speed = input<MatExpressiveLoadingIndicatorSpeed>('default');
  readonly isIndicatorVisible = signal(true);

  toggleIndicator() {
    this.isIndicatorVisible.update((visible) => !visible);
  }
}
