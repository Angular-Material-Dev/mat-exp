import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/**
 * Compact metadata table shown above every markdown-backed Doc Page's
 * rendered content. Currently renders only the Docs Row (Edit this page,
 * optional Design link, LLMs.md); Component Pages add further rows
 * (Import, GitHub) on top of this component in a later wave.
 */
@Component({
  selector: 'app-doc-page-meta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  templateUrl: './doc-page-meta.component.html',
  styleUrl: './doc-page-meta.component.scss',
})
export class DocPageMetaComponent {
  readonly editPageUrl = input.required<string>();
  readonly rawMarkdownUrl = input.required<string>();
  readonly designUrl = input<string | undefined>();
}
