import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { MatExpressiveButton } from '@ngm-dev/mat-expressive';

@Component({
  selector: 'app-root',
  imports: [MatButton, MatExpressiveButton],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('mat-expressive-docs');
}
