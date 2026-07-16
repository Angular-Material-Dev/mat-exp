import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  signal,
  Type,
  untracked,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatExpIconButton } from '@ngm-dev/mat-exp';

import { MarkdownService } from '../../services/markdown.service';
import { ControlDef, PlaygroundSchemas, SourceFile } from './playground.types';
import { PLAYGROUND_REGISTRY } from './playground-registry';

@Component({
  selector: 'app-playground',

  imports: [
    MatFormField,
    MatLabel,
    MatSuffix,
    MatSelect,
    MatOption,
    MatSlideToggle,
    MatInput,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatTabGroup,
    MatTab,
    MatExpIconButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss',
})
export class PlaygroundComponent implements OnDestroy {
  readonly component = input<string>('');

  private readonly previewHost = viewChild<unknown, ViewContainerRef>('previewHost', {
    read: ViewContainerRef,
  });

  private readonly schemas = toSignal(
    inject(HttpClient)
      .get<PlaygroundSchemas>('/playground-schemas.json')
      .pipe(catchError(() => of(null))),
    { initialValue: null as PlaygroundSchemas | null },
  );

  protected readonly schema = computed(() => {
    const schemas = this.schemas();
    const name = this.component();
    if (!schemas || !name) return null;
    return schemas[name] ?? null;
  });

  protected readonly controls = computed((): ControlDef[] => this.schema()?.inputs ?? []);

  /** Control values – auto-resets to schema defaults when the target component changes. */
  protected readonly controlValues = linkedSignal<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    for (const ctrl of this.controls()) {
      defaults[ctrl.name] = this.resolveDefault(ctrl);
    }
    return defaults;
  });

  protected readonly isLoading = computed(() => this.schemas() === null);
  protected readonly hasError = computed(
    () => this.schemas() !== null && !this.schema() && !!this.component(),
  );

  private readonly markdownService = inject(MarkdownService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly viewSourceOpen = signal(false);
  protected readonly activeSourceTabIndex = signal(0);
  protected readonly copiedFilename = signal<string | null>(null);
  private readonly highlightedSourceHtml = signal<Record<string, string>>({});

  private previewRef: ComponentRef<unknown> | null = null;

  constructor() {
    afterRenderEffect((onCleanup) => {
      const schema = this.schema();
      const host = this.previewHost();

      onCleanup(() => {
        this.previewRef?.destroy();
        this.previewRef = null;
        host?.clear();
      });

      if (!schema || !host) return;
      const entry = PLAYGROUND_REGISTRY[schema.className];
      if (!entry) return;

      host.clear();
      this.previewRef = host.createComponent(entry.previewComponent as Type<unknown>);
      this.syncValuesToPreview();
    });

    effect(() => {
      // Reset "View source" state whenever the target component changes.
      this.schema();
      this.viewSourceOpen.set(false);
      this.activeSourceTabIndex.set(0);
      this.highlightedSourceHtml.set({});
    });
  }

  protected getHighlightedSource(filename: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.highlightedSourceHtml()[filename] ?? '');
  }

  protected async copySource(file: SourceFile): Promise<void> {
    try {
      await navigator.clipboard.writeText(file.content);
    } catch {
      // clipboard write unavailable in some browser/permission contexts
    }
    this.copiedFilename.set(file.filename);
    setTimeout(() => {
      if (this.copiedFilename() === file.filename) this.copiedFilename.set(null);
    }, 2000);
  }

  protected ensureSourceHighlighted(): void {
    const files = this.schema()?.sourceFiles ?? [];
    const cache = this.highlightedSourceHtml();
    const missing = files.filter((f) => !(f.filename in cache));
    if (missing.length === 0) return;

    Promise.all(
      missing.map(
        async (f) =>
          [f.filename, await this.markdownService.highlightCode(f.content, f.lang)] as const,
      ),
    ).then((entries) => {
      this.highlightedSourceHtml.update((current) => ({
        ...current,
        ...Object.fromEntries(entries),
      }));
    });
  }

  protected getControlValue(name: string): unknown {
    return this.controlValues()[name];
  }

  protected updateControlValue(name: string, value: unknown): void {
    this.controlValues.update((current) => ({ ...current, [name]: value }));
    this.syncValuesToPreview();
  }

  protected resetControlValue(ctrl: ControlDef): void {
    this.controlValues.update((current) => ({
      ...current,
      [ctrl.name]: this.resolveDefault(ctrl),
    }));
    this.syncValuesToPreview();
  }

  protected resetAllControls(): void {
    const defaults: Record<string, unknown> = {};
    for (const ctrl of this.controls()) {
      defaults[ctrl.name] = this.resolveDefault(ctrl);
    }
    this.controlValues.set(defaults);
    this.syncValuesToPreview();
  }

  /** Extracts the string value from an input event. Used in templates to avoid `$any()` casts. */
  protected getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  /** Extracts and parses the numeric value from an input event. */
  protected getNumberInputValue(event: Event): number {
    return Number((event.target as HTMLInputElement).value);
  }

  private syncValuesToPreview(): void {
    if (!this.previewRef) return;
    const vals = untracked(() => this.controlValues());
    for (const [name, value] of Object.entries(vals)) {
      this.previewRef.setInput(name, value);
    }
    this.previewRef.changeDetectorRef.detectChanges();
  }

  private resolveDefault(ctrl: ControlDef): unknown {
    if (ctrl.default !== undefined) return ctrl.default;
    switch (ctrl.type) {
      case 'select':
        return ctrl.nullable ? null : (ctrl.options?.[0] ?? null);
      case 'slide-toggle':
        return false;
      case 'text':
        return '';
      case 'number':
        return 0;
    }
  }

  ngOnDestroy(): void {
    this.previewRef?.destroy();
    this.previewRef = null;
  }
}
