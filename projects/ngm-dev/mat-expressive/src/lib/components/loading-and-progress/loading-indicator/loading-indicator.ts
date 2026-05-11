import { Component, inject, input } from '@angular/core';
import { MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS } from './loading-indicator.options';

@Component({
  selector: 'mat-expressive-loading-indicator',
  styleUrls: ['./loading-indicator.scss'],
  template: `
    <div
      class="mat-expressive-loading-indicator"
      [class.mat-expressive-loading-indicator-contained]="config() === 'contained'"
    >
      <!-- Render SVGs with smooth morph animations, accessibility friendly -->
      <div class="mat-expressive-loading-indicator-content"></div>
    </div>
  `,
})
export class MatExpressiveLoadingIndicator {
  // protected readonly nothing = matExpressiveWithStyles(Styles);

  /**
   * @internal
   */
  public readonly config = input(inject(MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS).config);

  /**
   * @internal
   */
  public readonly matExpressiveLoadingIndicatorClass = 'mat-expressive-loading-indicator';

  /**
   * @internal
   */
  public readonly shapes = [
    '/shapes/soft-burst.svg',
    '/shapes/12-sided-cookie.svg',
    '/shapes/pentagon.svg',
    '/shapes/pill.svg',
    '/shapes/sunny.svg',
    '/shapes/4-sided-cookie.svg',
    '/shapes/oval.svg',
  ];
}
