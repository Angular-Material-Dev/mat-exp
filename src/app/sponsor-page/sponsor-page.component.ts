import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatExpButton } from '@ngm-dev/mat-exp';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { environment } from '../../environments/environment';
import { breadcrumbListJsonLd, webPageJsonLd, withBaseJsonLd } from '../shared/utils/json-ld';

interface SponsorReason {
  icon: string;
  title: string;
  description: string;
}

const SPONSOR_REASONS: SponsorReason[] = [
  {
    icon: 'auto_awesome',
    title: 'Components Material doesn’t ship',
    description:
      'Funds building the M3 Expressive surfaces Angular Material lacks — the split button, FAB menu, and expressive loading indicator are already here, and sponsorship pays for the next ones.',
  },
  {
    icon: 'construction',
    title: 'Keeping pace with Angular',
    description:
      'Every Angular and Angular Material major means migration work, re-testing, and re-checking against the Expressive spec. Sponsorship covers that unglamorous, recurring effort.',
  },
  {
    icon: 'bug_report',
    title: 'Issues answered, PRs reviewed',
    description:
      'Sponsored time goes directly into triaging issues, reviewing contributions, and shipping bug fixes in days instead of months.',
  },
];

@Component({
  selector: 'app-sponsor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatExpButton, MatIcon],
  template: `
    <section class="px-6 py-24 sm:py-32 text-center">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-4xl sm:text-5xl tracking-tight text-on-surface mb-6 font-bold">
          Support Mat Expressive
        </h1>
        <p class="text-lg text-on-surface-variant mb-4 max-w-xl mx-auto">
          Mat Expressive is free, MIT-licensed, and stays that way. It is built and maintained by
          one person &mdash; if it saves you or your team time shipping Material 3 Expressive UI,
          sponsorship is the most direct way to keep it moving.
        </p>
        <p class="text-sm text-on-surface-variant mb-10 max-w-xl mx-auto">
          Sponsoring doesn&rsquo;t unlock anything &mdash; everything is already open. It simply
          funds the time that makes the next release happen.
        </p>
        <a
          [href]="sponsorUrl"
          target="_blank"
          rel="noopener noreferrer"
          mat-flat-button
          matExpButton
          class="text-base px-6 py-3"
        >
          Sponsor on GitHub
        </a>
      </div>
    </section>

    <section class="px-6 pb-16 sm:pb-20">
      <div class="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        @for (reason of reasons; track reason.title) {
          <div class="rounded-2xl border border-outline-variant p-6 flex flex-col gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <mat-icon class="text-on-primary-container">{{ reason.icon }}</mat-icon>
            </div>
            <h3 class="font-semibold text-on-surface">{{ reason.title }}</h3>
            <p class="text-sm text-on-surface-variant leading-relaxed flex-1">
              {{ reason.description }}
            </p>
          </div>
        }
      </div>
    </section>

    <section class="px-6 pb-16 sm:pb-20 text-center">
      <p class="max-w-xl mx-auto text-on-surface-variant">
        <span class="font-semibold text-on-surface">Using Mat Expressive at work?</span>
        A monthly company sponsorship is a small line item that keeps a production dependency
        healthy. GitHub Sponsors supports organization accounts, so your company can sponsor
        directly.
      </p>
    </section>

    <section class="px-6 pb-24 sm:pb-32">
      <div
        class="max-w-2xl mx-auto text-center rounded-2xl border border-outline-variant p-8 sm:p-10"
      >
        <h2 class="text-xl font-semibold text-on-surface mb-3">Not in a position to sponsor?</h2>
        <p class="text-on-surface-variant mb-6">
          That&rsquo;s completely fine &mdash; starring the repo, reporting bugs, and telling other
          Angular developers about the library help more than you&rsquo;d think.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <a
            [href]="repoUrl"
            target="_blank"
            rel="noopener noreferrer"
            mat-stroked-button
            matExpButton
          >
            <mat-icon>star</mat-icon>
            Star on GitHub
          </a>
          <a
            [href]="repoUrl + '/issues'"
            target="_blank"
            rel="noopener noreferrer"
            mat-stroked-button
            matExpButton
          >
            <mat-icon>bug_report</mat-icon>
            Report a bug
          </a>
        </div>
      </div>
    </section>
  `,
})
export class SponsorPageComponent {
  protected readonly sponsorUrl = environment.sponsorUrl;
  protected readonly repoUrl = environment.githubRepoUrl;
  protected readonly reasons = SPONSOR_REASONS;

  constructor() {
    inject(NgxMetaService).set({
      title: 'Sponsor Mat Expressive',
      description:
        'Mat Expressive is free and MIT-licensed, built by a solo maintainer. Sponsor its development to fund new Material 3 Expressive components for Angular.',
      jsonLd: withBaseJsonLd(
        breadcrumbListJsonLd([
          { name: 'Mat Expressive', path: '/' },
          { name: 'Sponsor', path: '/sponsor' },
        ]),
        webPageJsonLd({
          name: 'Sponsor Mat Expressive',
          description:
            'Mat Expressive is free and MIT-licensed, built by a solo maintainer. Sponsor its development to fund new Material 3 Expressive components for Angular.',
          path: '/sponsor',
        }),
      ),
    } satisfies GlobalMetadata & JsonLdMetadata);
  }
}
