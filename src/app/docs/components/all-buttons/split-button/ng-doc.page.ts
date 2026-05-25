import { NgDocPage } from '@ng-doc/core';
import AllButtonsCategory from '../ng-doc.category';
import { DocsSplitButtonPlayground } from './playground/playground';

const SplitButtonPage: NgDocPage = {
  title: `Split Button`,
  mdFile: ['./index.md', './api.md', './styling.md', './playground.md'],
  category: AllButtonsCategory,
  playgrounds: {
    DocsSplitButtonPlayground: {
      target: DocsSplitButtonPlayground,
      template: `<app-docs-split-button-playground />`,
    },
  },
  demos: { DocsSplitButtonPlayground },
  order: 4,
};

export default SplitButtonPage;
