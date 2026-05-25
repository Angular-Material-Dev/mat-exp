import { NgDocPage } from '@ng-doc/core';
import AllButtonsCategory from '../ng-doc.category';
import { DocsFabMenuPlayground } from './playground/playground';

const FabMenuPage: NgDocPage = {
  title: `Fab Menu`,
  mdFile: ['./index.md', './api.md', './styling.md', './playground.md'],
  category: AllButtonsCategory,
  playgrounds: {
    DocsFabMenuPlayground: {
      target: DocsFabMenuPlayground,
      template: `<app-docs-fab-menu-playground />`,
    },
  },
  demos: { DocsFabMenuPlayground },
  order: 5,
};

export default FabMenuPage;
