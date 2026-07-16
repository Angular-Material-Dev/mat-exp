import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  MatExpLoadingIndicator,
  type MatExpLoadingIndicatorConfig,
  type MatExpLoadingIndicatorSpeed,
} from '@ngm-dev/mat-exp';

/** @playgroundFor MatExpLoadingIndicator */
@Component({
  selector: 'app-loading-indicator-preview',

  imports: [MatExpLoadingIndicator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-indicator-preview.component.html',
  styleUrl: './loading-indicator-preview.component.scss',
})
export class LoadingIndicatorPreviewComponent {
  readonly config = input<MatExpLoadingIndicatorConfig>('default');
  readonly speed = input<MatExpLoadingIndicatorSpeed>('default');
  readonly ariaLabel = input<string | null>(null);
}
