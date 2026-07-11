import { Type } from '@angular/core';
import { ButtonGroupPreviewComponent } from './previews/button-group-preview.component';
import { ButtonPreviewComponent } from './previews/button-preview.component';
import { FabMenuPreviewComponent } from './previews/fab-menu-preview.component';
import { IconButtonPreviewComponent } from './previews/icon-button-preview.component';
import { LoadingIndicatorPreviewComponent } from './previews/loading-indicator-preview.component';
import { SplitButtonPreviewComponent } from './previews/split-button-preview.component';
// <generator:insert-import>

export interface PlaygroundRegistryEntry {
  /** The component to render as the live preview. */
  previewComponent: Type<unknown>;
  /**
   * Names of controls to add beyond what the schema provides.
   * Used by override configs that need extra controls not in the schema.
   */
  extraControlNames?: string[];
}

/**
 * Static registry mapping component class names from playground-schemas.json
 * to their preview wrapper components. Each wrapper accepts matching `input()`
 * signals that the PlaygroundComponent sets via `ComponentRef.setInput()`.
 *
 * ButtonGroup uses a dedicated preview wrapper (its `playground.config.ts`
 * override) because it requires projected button children.
 */
export const PLAYGROUND_REGISTRY: Record<string, PlaygroundRegistryEntry> = {
  MatExpressiveButton: { previewComponent: ButtonPreviewComponent },
  MatExpressiveIconButton: { previewComponent: IconButtonPreviewComponent },
  MatExpressiveButtonGroup: { previewComponent: ButtonGroupPreviewComponent },
  MatExpressiveSplitButton: { previewComponent: SplitButtonPreviewComponent },
  MatExpressiveFabMenu: { previewComponent: FabMenuPreviewComponent },
  MatExpressiveFabMenuTrigger: { previewComponent: FabMenuPreviewComponent },
  MatExpressiveLoadingIndicator: { previewComponent: LoadingIndicatorPreviewComponent },
  // <generator:insert-entry>
};
