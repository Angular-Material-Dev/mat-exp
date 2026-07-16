import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaygroundComponent } from '../../../../../shared/components/playground/playground.component';

@Component({
  selector: 'app-loading-indicator-playground',

  imports: [PlaygroundComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-indicator-playground.component.html',
})
export class LoadingIndicatorPlaygroundComponent {}
