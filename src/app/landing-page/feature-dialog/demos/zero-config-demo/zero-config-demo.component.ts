import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatExpButton } from '@ngm-dev/mat-exp';
import { CodeComponent } from '../../../../shared/components/code/code.component';

const SNIPPET = `<button
  matButton="filled"
  matExpButton
  size="m"
  shape="square"
>
  Click me
</button>`;

@Component({
  selector: 'app-zero-config-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatExpButton, CodeComponent],
  templateUrl: './zero-config-demo.component.html',
})
export class ZeroConfigDemoComponent {
  protected readonly snippet = SNIPPET;
}
