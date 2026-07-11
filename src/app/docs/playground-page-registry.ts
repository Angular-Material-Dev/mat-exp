import { Type } from '@angular/core';
import { ButtonPlaygroundComponent } from './components/all-buttons/button/playground/button-playground.component';
import { ButtonGroupPlaygroundComponent } from './components/all-buttons/button-group/playground/button-group-playground.component';
import { FabMenuPlaygroundComponent } from './components/all-buttons/fab-menu/playground/fab-menu-playground.component';
import { IconButtonPlaygroundComponent } from './components/all-buttons/icon-button/playground/icon-button-playground.component';
import { SplitButtonPlaygroundComponent } from './components/all-buttons/split-button/playground/split-button-playground.component';
import { LoadingIndicatorPlaygroundComponent } from './components/loading-and-progress/loading-indicator/playground/loading-indicator-playground.component';
// <generator:insert-import>

/**
 * Maps a component page's base URL path to the Angular component that should
 * be rendered on its Playground tab. DocPageComponent uses this to replace the
 * markdown render with a direct Angular component embed when the URL ends with
 * `/playground`.
 */
export const PLAYGROUND_PAGE_REGISTRY: Record<string, Type<unknown>> = {
  '/docs/components/all-buttons/button': ButtonPlaygroundComponent,
  '/docs/components/all-buttons/icon-button': IconButtonPlaygroundComponent,
  '/docs/components/all-buttons/button-group': ButtonGroupPlaygroundComponent,
  '/docs/components/all-buttons/split-button': SplitButtonPlaygroundComponent,
  '/docs/components/all-buttons/fab-menu': FabMenuPlaygroundComponent,
  '/docs/components/loading-and-progress/loading-indicator': LoadingIndicatorPlaygroundComponent,
  // <generator:insert-entry>
};
