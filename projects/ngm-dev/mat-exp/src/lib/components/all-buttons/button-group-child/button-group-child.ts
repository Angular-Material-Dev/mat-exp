import { effect, type Signal } from '@angular/core';
import { type MatButtonAppearance } from '@angular/material/button';
import { MatExpButton } from '../button';
import { MatExpIconButton } from '../icon-button';
import type {
  MatExpButtonShape,
  MatExpButtonSize,
  MatExpIconButtonAppearance,
} from '../../../types';

/**
 * Narrow contract that `MatExpButtonGroup` and `MatExpSplitButton` depend on
 * instead of reaching into the full public surface of `MatExpButton` /
 * `MatExpIconButton`.
 *
 * Keeping this interface narrow means a change to either button directive's public setters
 * no longer ripples silently into both group/split-button implementations - only the adapter
 * for the affected directive needs to change.
 *
 * @metaDescription Narrow contract that MatExpButtonGroup and MatExpSplitButton depend on for their projected children.
 */
export interface ButtonGroupChild {
  setSize(size: MatExpButtonSize): void;
  setShape(shape: MatExpButtonShape): void;
  setAppearance(appearance: MatButtonAppearance): void;
  setDisabled(disabled: boolean): void;
}

/** Adapts a `MatExpButton` directive instance to the `ButtonGroupChild` contract. */
export class ButtonAdapter implements ButtonGroupChild {
  constructor(private readonly button: MatExpButton) {}

  setSize(size: MatExpButtonSize): void {
    this.button.size.set(size);
  }

  setShape(shape: MatExpButtonShape): void {
    this.button.shape.set(shape);
  }

  setAppearance(appearance: MatButtonAppearance): void {
    this.button.appearance = appearance;
  }

  setDisabled(disabled: boolean): void {
    this.button.disabled = disabled;
  }
}

/** Adapts a `MatExpIconButton` directive instance to the `ButtonGroupChild` contract. */
export class IconButtonAdapter implements ButtonGroupChild {
  constructor(private readonly button: MatExpIconButton) {}

  setSize(size: MatExpButtonSize): void {
    this.button.size.set(size);
  }

  setShape(shape: MatExpButtonShape): void {
    this.button.shape.set(shape);
  }

  setAppearance(appearance: MatButtonAppearance): void {
    // `MatExpIconButton` supports a narrower appearance union than `MatButtonAppearance`
    // (no `elevated`); callers are expected to only pass values relevant to icon buttons.
    this.button.appearance = appearance as MatExpIconButtonAppearance;
  }

  setDisabled(disabled: boolean): void {
    this.button.disabled = disabled;
  }
}

/** Wraps a projected button/icon-button directive instance in its `ButtonGroupChild` adapter. */
export function toButtonGroupChild(button: MatExpButton | MatExpIconButton): ButtonGroupChild {
  return button instanceof MatExpIconButton
    ? new IconButtonAdapter(button)
    : new ButtonAdapter(button);
}

/** Reactive sources that can drive a broadcast to a set of `ButtonGroupChild` instances. */
export interface ButtonGroupChildBroadcastConfig {
  /** The current set of children to broadcast style/state changes to. */
  children: Signal<readonly ButtonGroupChild[]>;
  size?: Signal<MatExpButtonSize | undefined>;
  shape?: Signal<MatExpButtonShape | undefined>;
  appearance?: Signal<MatButtonAppearance | undefined>;
  disabled?: Signal<boolean | undefined>;
}

/**
 * Registers the effects that broadcast `size`/`shape`/`appearance`/`disabled` from a
 * group-like host (`MatExpButtonGroup`, `MatExpSplitButton`) down to its
 * projected `ButtonGroupChild` instances.
 *
 * This is the single implementation of the broadcast-effect logic that was previously
 * duplicated between `button-group.ts` and `split-button.ts`. Must be called from within
 * an injection context (e.g. a component/directive constructor).
 *
 * @metaDescription Registers effects that broadcast size/shape/appearance/disabled from a group-like host to its projected children.
 */
export function bindButtonGroupChildren(config: ButtonGroupChildBroadcastConfig): void {
  const { children, size, shape, appearance, disabled } = config;

  if (size) {
    effect(() => {
      const value = size();
      if (value) {
        children().forEach((child) => child.setSize(value));
      }
    });
  }

  if (shape) {
    effect(() => {
      const value = shape();
      if (value) {
        children().forEach((child) => child.setShape(value));
      }
    });
  }

  if (appearance) {
    effect(() => {
      const value = appearance();
      if (value) {
        children().forEach((child) => child.setAppearance(value));
      }
    });
  }

  if (disabled) {
    effect(() => {
      const value = disabled();
      children().forEach((child) => child.setDisabled(value ?? false));
    });
  }
}
