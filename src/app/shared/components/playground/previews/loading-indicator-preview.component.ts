import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatExpButton,
  MatExpLoadingIndicator,
  type MatExpLoadingIndicatorConfig,
  type MatExpLoadingIndicatorSpeed,
} from '@ngm-dev/mat-exp';

/** @playgroundFor MatExpLoadingIndicator */
@Component({
  selector: 'app-loading-indicator-preview',
  imports: [MatExpLoadingIndicator, MatButton, MatExpButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-indicator-preview.component.html',
  styleUrl: './loading-indicator-preview.component.scss',
})
export class LoadingIndicatorPreviewComponent {
  readonly config = input<MatExpLoadingIndicatorConfig>('default');
  readonly speed = input<MatExpLoadingIndicatorSpeed>('default');
  readonly ariaLabel = input<string | null>(null);
  protected readonly showProgress = signal(false);

  protected toggleShowProgress() {
    this.showProgress.update((show) => !show);
  }
}
