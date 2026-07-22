import { ChangeDetectionStrategy, Component, inject, input, resource } from '@angular/core';
import { MarkdownService } from '../../services/markdown.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatExpIconButton } from '@ngm-dev/mat-exp';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatIconButton } from '@angular/material/button';

/** Shiki-highlighted code block. Use as `<app-code [content]="src" [language]="'typescript'" />`. */
@Component({
  selector: 'app-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SafeHtmlPipe, MatIcon, MatExpIconButton, CdkCopyToClipboard, MatIconButton],
  templateUrl: './code.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class CodeComponent {
  private readonly markdownService = inject(MarkdownService);

  content = input.required<string>();
  language = input.required<string>();
  hideCopy = input<boolean>();
  /** Shiki meta line range to highlight, e.g. `'2,4-6'`. */
  highlightLines = input<string>();

  protected readonly highlighted = resource({
    params: () => ({
      content: this.content(),
      language: this.language(),
      highlightLines: this.highlightLines(),
    }),
    loader: ({ params }) =>
      this.markdownService.highlightCode(params.content, params.language, params.highlightLines),
  });
}
