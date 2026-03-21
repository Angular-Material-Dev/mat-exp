import { NgDocPage } from '@ng-doc/core';
import AllButtonsCategory from '../ng-doc.category';
import { DocsButtonGroupPlayground } from './playground/playground';

const ButtonGroupPage: NgDocPage = {
  title: `Button Group`,
  mdFile: ['./index.md', './api.md', './styling.md', './playground.md'],
  category: AllButtonsCategory,
  playgrounds: {
    DocsButtonGroupPlayground: {
      target: DocsButtonGroupPlayground,
      template: `<app-docs-button-group-playground />`,
    },
  },
  demos: { DocsButtonGroupPlayground },
  order: 3,
};

export default ButtonGroupPage;
