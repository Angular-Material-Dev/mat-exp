import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatExpIconButton } from '@ngm-dev/mat-exp';

/**
 * Compact metadata table shown above every markdown-backed Doc Page's
 * rendered content. Always renders the Docs Row (Edit this page, optional
 * Design link, LLMs.md) when `editPageUrl`/`rawMarkdownUrl` are set; adds an
 * Import Row on Component Pages when `primarySymbol` is set. Docs Row and
 * Import Row are independent so this component also renders on tabs with no
 * backing markdown (e.g. Playground), where only the Import Row applies.
 */
@Component({
  selector: 'app-doc-page-meta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatIconButton, MatTooltip, MatExpIconButton],
  templateUrl: './doc-page-meta.component.html',
  styleUrl: './doc-page-meta.component.scss',
})
export class DocPageMetaComponent {
  readonly editPageUrl = input<string | undefined>();
  readonly rawMarkdownUrl = input<string | undefined>();
  readonly designUrl = input<string | undefined>();
  readonly primarySymbol = input<string[] | undefined>();

  protected readonly copiedImport = signal(false);

  protected readonly importStatement = computed<string | undefined>(() => {
    const symbols = this.primarySymbol();
    if (!symbols || symbols.length === 0) return undefined;
    return `import { ${symbols.join(', ')} } from '@ngm-dev/mat-exp';`;
  });

  protected async copyImport(): Promise<void> {
    const statement = this.importStatement();
    if (!statement) return;
    try {
      await navigator.clipboard.writeText(statement);
    } catch {
      // clipboard write unavailable in some browser/permission contexts
    }
    this.copiedImport.set(true);
    setTimeout(() => this.copiedImport.set(false), 2000);
  }
}
