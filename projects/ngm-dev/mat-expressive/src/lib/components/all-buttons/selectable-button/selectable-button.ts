import { type ModelSignal } from '@angular/core';
import { MatExpressiveButtonToggle } from '../../../types';

export interface MatExpressiveSelectableButton {
  toggle: ModelSignal<MatExpressiveButtonToggle | undefined>;
  value: ModelSignal<unknown>;

  _onButtonClick(): void;
}

/** Change event object emitted by button toggle. */
export class MatExpressiveSelectableButtonChange {
  constructor(
    /** The button that emits the event. */
    public source: MatExpressiveSelectableButton,

    /** The value assigned to the button. */
    public value: unknown,
  ) {}
}
