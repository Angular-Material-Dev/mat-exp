import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatExpLoadingIndicator } from '@ngm-dev/mat-exp';

@Component({
  selector: 'app-motion-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatExpLoadingIndicator],
  templateUrl: './motion-demo.component.html',
})
export class MotionDemoComponent {}
