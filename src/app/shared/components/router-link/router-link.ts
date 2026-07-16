import { Component, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-router-link',
  template: `<a [routerLink]="url.split('#')[0]" [fragment]="fragment ?? urlFragment">
    <ng-content></ng-content>
  </a>`,
  imports: [RouterLink],
})
export class RouterLinkComponent {
  @Input({ required: true })
  fragment: string | undefined;
  @Input()
  url = inject(Router).url.split('#')[0];

  get urlFragment() {
    return this.url.split('#')[1];
  }
}
