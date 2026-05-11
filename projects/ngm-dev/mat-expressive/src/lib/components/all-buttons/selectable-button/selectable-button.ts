import { Directive, EventEmitter, ModelSignal, inject, model } from '@angular/core';
import { MatExpressiveButtonToggle } from '../../../types';

export interface MatExpressiveSelectableButton {
  toggle: ModelSignal<MatExpressiveButtonToggle | undefined>;
  value: ModelSignal<any>;

  _onButtonClick(): void;
}

/** Change event object emitted by button toggle. */
export class MatExpressiveSelectableButtonChange {
  constructor(
    /** The button that emits the event. */
    public source: MatExpressiveSelectableButton,

    /** The value assigned to the button. */
    public value: any,
  ) {}
}
