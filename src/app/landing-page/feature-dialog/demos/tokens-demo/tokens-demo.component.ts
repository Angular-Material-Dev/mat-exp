import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeComponent } from '../../../../shared/components/code/code.component';

const SNIPPET = `$button-common-tokens: (
  filled-disabled-container-color: color-mix(in srgb, var(--mat-sys-on-surface) 10%, transparent),
  protected-container-color: var(--mat-sys-surface-container-low),
  outlined-state-layer-color: var(--mat-sys-on-surface-variant),
  outlined-label-text-color: var(--mat-sys-on-surface-variant),
  outlined-outline-color: var(--mat-sys-outline-variant),
);`;

@Component({
  selector: 'app-tokens-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeComponent],
  templateUrl: './tokens-demo.component.html',
})
export class TokensDemoComponent {
  protected readonly snippet = SNIPPET;
}
