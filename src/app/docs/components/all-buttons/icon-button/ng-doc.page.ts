import { NgDocPage } from '@ng-doc/core';
import AllButtonsCategory from '../ng-doc.category';
import { DocsIconButtonPlayground } from './playground/playground';

const IconButtonPage: NgDocPage = {
  title: `Icon Button`,
  mdFile: ['./index.md', './api.md', './styling.md', './playground.md'],
  category: AllButtonsCategory,
  playgrounds: {
    DocsIconButtonPlayground: {
      target: DocsIconButtonPlayground,
      template: `<app-docs-icon-button-playground />`,
    },
  },
  demos: { DocsIconButtonPlayground },
};

export default IconButtonPage;
