import { NgDocPage } from '@ng-doc/core';
import LoadingAndProgressCategory from '../ng-doc.category';
import { DocsLoadingIndicatorPlayground } from './playground/playground';

const LoadingIndicatorPage: NgDocPage = {
  title: `Loading Indicator`,
  mdFile: ['./index.md', './api.md', './styling.md', './playground.md'],
  category: LoadingAndProgressCategory,
  playgrounds: {
    DocsLoadingIndicatorPlayground: {
      target: DocsLoadingIndicatorPlayground,
      template: `<app-docs-loading-indicator-playground />`,
    },
  },
  demos: { DocsLoadingIndicatorPlayground },
  order: 1,
};

export default LoadingIndicatorPage;
