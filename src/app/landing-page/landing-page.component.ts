import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatExpButton } from '@ngm-dev/mat-exp';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { MarkdownComponent } from '../docs/markdown/markdown.component';
import { MarkdownService } from '../shared/services/markdown.service';
import { softwareSourceCodeJsonLd, withBaseJsonLd } from '../shared/utils/json-ld';
import {
  FeatureDialogComponent,
  FeatureDialogData,
} from './feature-dialog/feature-dialog.component';

const QUICKSTART_MARKDOWN = `
\`\`\`bash
ng add @ngm-dev/mat-exp
\`\`\`

\`\`\`scss name="styles.scss"
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles(
    (
        sizes: ('s'),
    )
  );
}
\`\`\`

\`\`\`angular-ts name="app.ts"
import { MatExpButton } from '@ngm-dev/mat-exp';
import { MatButton } from '@angular/material/button';

@Component({
  imports: [MatButton, MatExpButton],
  template: \`<button matButton matExpButton>Click me</button>\`,
})
export class AppComponent {}
\`\`\`
`;

interface GalleryItem {
  label: string;
  path: string;
  image: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  { label: 'Button', path: '/docs/components/all-buttons/button' },
  { label: 'Icon Button', path: '/docs/components/all-buttons/icon-button' },
  { label: 'FAB', path: '/docs/components/all-buttons/fab-menu' },
  { label: 'Button Group', path: '/docs/components/all-buttons/button-group' },
  { label: 'Split Button', path: '/docs/components/all-buttons/split-button' },
  { label: 'Loading Indicator', path: '/docs/components/loading-and-progress/loading-indicator' },
].map((item) => ({
  ...item,
  image: `https://placehold.co/320x200?text=${encodeURIComponent(item.label)}`,
}));

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  dialog: FeatureDialogData;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: 'animation',
    title: 'Expressive Spring Animations',
    description:
      'GSAP-powered spring physics bring the loading indicator to life with fluid, natural motion.',
    dialog: {
      headline: [
        { text: 'Motion your users will ' },
        { text: 'feel', italic: true },
        { text: '.' },
      ],
      imageUrl: 'https://placehold.co/480x270?text=Animation+Preview',
      imageAlt: 'Preview of a component spring animation',
      subFeatures: [
        {
          title: 'Spring physics',
          description:
            'GSAP-driven spring easing curves replace linear transitions for natural, lively motion.',
        },
        {
          title: 'Three speed presets',
          description:
            'Fast, default, and slow presets tune the feel of every animation to your product.',
        },
        {
          title: 'Reduced-motion safe',
          description: 'Animations are automatically disabled when a user prefers reduced motion.',
        },
        {
          title: 'GPU-accelerated',
          description: 'Transforms run on the compositor thread for smooth motion at 60fps.',
        },
      ],
    },
  },
  {
    icon: 'rocket_launch',
    title: 'Zero Config',
    description: 'Drop-in directive on any Angular Material button. No new component API to learn.',
    dialog: {
      headline: [{ text: 'One directive. ' }, { text: "That's it.", italic: true }],
      imageUrl: 'https://placehold.co/480x270?text=matExpButton',
      imageAlt: 'Button with the matExpButton directive applied',
      subFeatures: [
        {
          title: 'Single attribute',
          description: 'Add matExpButton to any existing Angular Material button to opt in.',
        },
        {
          title: 'Works on all Material button variants',
          description: 'Filled, tonal, outlined, text, icon, and FAB buttons are all supported.',
        },
        {
          title: 'No wrapper components',
          description: 'Keep using mat-button and friends directly — nothing to migrate or wrap.',
        },
        {
          title: 'Tree-shakeable',
          description: 'Only the directives you import end up in your production bundle.',
        },
      ],
    },
  },
  {
    icon: 'palette',
    title: 'Material 3 Tokens',
    description:
      'Built on Angular Material 3 design tokens — themes, colors, and typography all just work.',
    dialog: {
      headline: [{ text: 'Themed ' }, { text: 'automatically', italic: true }, { text: '.' }],
      imageUrl: 'https://placehold.co/480x270?text=Themed+Palette',
      imageAlt: 'Themed button palette',
      subFeatures: [
        {
          title: 'Color tokens',
          description:
            'Reads directly from your Material 3 theme — no duplicate color configuration.',
        },
        {
          title: 'Shape tokens',
          description: "Corner radii follow your theme's shape scale automatically.",
        },
        {
          title: 'Typography tokens',
          description: 'Label styles inherit your Material typography scale.',
        },
        {
          title: 'Dark mode ready',
          description: 'Animations and colors adapt automatically to light and dark themes.',
        },
      ],
    },
  },
];

@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [RouterLink, MatButton, MatExpButton, MatIcon, MarkdownComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  private readonly markdownService = inject(MarkdownService);
  private readonly dialog = inject(MatDialog);

  protected readonly galleryItems = GALLERY_ITEMS;
  protected readonly features = FEATURE_CARDS;
  protected readonly quickstartHtml = signal<string>('');

  constructor() {
    inject(NgxMetaService).set({
      title: 'Expressive Motion for Angular Material',
      description:
        'Material 3 Expressive components for Angular Material — GSAP-powered spring motion, zero-config directives, SSR-safe.',
      jsonLd: withBaseJsonLd(softwareSourceCodeJsonLd()),
    } satisfies GlobalMetadata & JsonLdMetadata);

    void this.markdownService.renderMarkdown(QUICKSTART_MARKDOWN).then((html) => {
      this.quickstartHtml.set(html);
    });
  }

  protected openFeatureDialog(feature: FeatureCard): void {
    this.dialog.open(FeatureDialogComponent, {
      data: feature.dialog,
      maxWidth: '32rem',
      autoFocus: 'dialog',
      panelClass: 'dialog-outlined',
    });
  }
}
