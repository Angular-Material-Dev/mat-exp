import { NgDocPage } from '@ng-doc/core';
import AllButtonsCategory from '../ng-doc.category';
import { DocsButtonPlayground } from './playground/playground';

const ButtonPage: NgDocPage = {
  title: `Button`,
  mdFile: ['./index.md', './api.md', './styling.md', './playground.md'],
  category: AllButtonsCategory,
  playgrounds: {
    DocsButtonPlayground: {
      target: DocsButtonPlayground,
      template: `<app-docs-button-playground />`,
    },
  },
  demos: { DocsButtonPlayground },
  order: 1,
};

export default ButtonPage;
