import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardAvatar,
} from '@angular/material/card';
import { MatExpButton } from '@ngm-dev/mat-exp';
import { CodeComponent } from '../../shared/components/code/code.component';

/**
 * Compact metadata table shown above every markdown-backed Doc Page's
 * rendered content. Always renders the Docs Row (Edit this page, optional
 * Design link, LLMs.md) when `editPageUrl`/`rawMarkdownUrl` are set; adds an
 * Import Row on Component Pages when `primarySymbol` is set, and a GitHub
 * Row when `sourceFolderUrl` is set. All rows are independent so this
 * component also renders on tabs with no backing markdown (e.g.
 * Playground), where only the Import/GitHub rows apply.
 */
@Component({
  selector: 'app-doc-page-meta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatCard,
    MatCardContent,
    CodeComponent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardAvatar,
    MatAnchor,
    MatExpButton,
  ],
  templateUrl: './doc-page-meta.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class DocPageMetaComponent {
  readonly editPageUrl = input<string | undefined>();
  readonly rawMarkdownUrl = input<string | undefined>();
  readonly designUrl = input<string | undefined>();
  readonly primarySymbol = input<string[] | undefined>();
  readonly sourceFolderUrl = input<string | undefined>();
  readonly reportIssueUrl = input<string | undefined>();

  protected readonly copiedImport = signal(false);

  protected readonly importStatement = computed<string | undefined>(() => {
    const symbols = this.primarySymbol();
    if (!symbols || symbols.length === 0) return undefined;
    return `import { ${symbols.join(', ')} } from '@ngm-dev/mat-exp';`;
  });
}
