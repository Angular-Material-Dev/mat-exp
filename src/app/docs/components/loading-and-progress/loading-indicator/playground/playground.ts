import { Component, input } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import {
  MatExpressiveLoadingIndicator,
  type MatExpressiveLoadingIndicatorConfig,
} from '@ngm-dev/mat-expressive';

@Component({
  selector: 'app-docs-loading-indicator-playground',
  imports: [MatDivider, MatExpressiveLoadingIndicator],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class DocsLoadingIndicatorPlayground {
  readonly config = input<MatExpressiveLoadingIndicatorConfig>('default');
}
