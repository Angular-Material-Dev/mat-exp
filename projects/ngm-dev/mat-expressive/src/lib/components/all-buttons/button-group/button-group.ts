import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  Input,
  InjectionToken,
  input,
  model,
  output,
  type Provider,
} from '@angular/core';
import { MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS } from './button-group.options';
import { MatExpressiveButton } from '../button';
import { MatExpressiveIconButton } from '../icon-button';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatExpressiveSelectableButton,
  MatExpressiveSelectableButtonChange,
} from '../selectable-button/selectable-button';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Injection token that can be used to reference instances of `MatExpressiveButtonGroup`.
 * It serves as alternative token to the actual `MatExpressiveButtonGroup` class which
 * could cause unnecessary retention of the class and its component metadata.
 */
export const MAT_EXPRESSIVE_BUTTON_GROUP = new InjectionToken<MatExpressiveButtonGroup>(
  'MatExpressiveButtonGroup',
);

/**
 * Provider Expression that allows mat-expressive-button-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)] and reactive forms.
 * @docs-private
 */
export const MAT_EXPRESSIVE_BUTTON_GROUP_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatExpressiveButtonGroup),
  multi: true,
};

/**
 * Component that groups buttons and provides single/multi-select behavior
 * compatible with Angular reactive and template-driven forms.
 */
@Component({
  selector: 'mat-expressive-button-group',
  providers: [
    MAT_EXPRESSIVE_BUTTON_GROUP_VALUE_ACCESSOR,
    { provide: MAT_EXPRESSIVE_BUTTON_GROUP, useExisting: MatExpressiveButtonGroup },
  ],
  templateUrl: './button-group.html',
  // styleUrls: ['./button-group.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'matExpressiveButtonGroupClass',
    '[attr.data-variant]': 'variant()',
    '[attr.data-selection]': 'selection()',
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-disabled]': 'disabled()',
  },
})
export class MatExpressiveButtonGroup implements ControlValueAccessor {
  public readonly size = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).size);
  public readonly shape = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).shape);
  public readonly selection = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).selection);
  public readonly variant = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).variant);
  public readonly appearance = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).appearance);
  public readonly disabled = model(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).disabled);

  /** Emits when the selected value changes, either via user interaction or programmatic update. */
  public readonly selectionChange = output<MatExpressiveSelectableButtonChange>();

  private _value: unknown;

  /**
   * The currently selected value. For `single-select` this is a single value;
   * for `multi-select` this is an array of values.
   */
  @Input()
  get value(): unknown {
    return this._value;
  }
  set value(newValue: unknown) {
    this._setValueAndSync(newValue);
  }

  /**
   * @internal
   */
  // public readonly matExpressiveButtonGroupClass = inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS)
  //   .matExpressiveButtonGroupClass;

  /**
   * @internal
   */
  public readonly matExpressiveButtonGroupClass = 'mat-expressive-button-group';

  readonly _matExpressiveButtons = contentChildren<MatExpressiveButton>(MatExpressiveButton);
  readonly _matExpressiveIconButtons =
    contentChildren<MatExpressiveIconButton>(MatExpressiveIconButton);
  readonly _allExpressiveButtons = computed(() => [
    ...this._matExpressiveButtons(),
    ...this._matExpressiveIconButtons(),
  ]);

  /** Tracks which buttons are currently selected. */
  _selectionModel = new SelectionModel<MatExpressiveSelectableButton>(false, undefined, false);

  private _onChange: (value: unknown) => void = () => undefined;
  private _onTouched: () => void = () => undefined;
  private readonly _cdr = inject(ChangeDetectorRef);

  constructor() {
    // Keep selection model's `multiple` flag in sync with the `selection` input.
    effect(() => {
      const isMultiple = this.selection() === 'multi-select';
      if (this._selectionModel.isMultipleSelection() !== isMultiple) {
        this._selectionModel = new SelectionModel<MatExpressiveSelectableButton>(
          isMultiple,
          undefined,
          false,
        );
        this._syncButtonsWithValue();
      }
    });

    // Whenever projected buttons change (initial render or dynamic changes),
    // sync their toggle state with the stored value.
    effect(() => {
      const buttons = this._allExpressiveButtons();
      if (buttons.length > 0) {
        this._syncButtonsWithValue();
      }
    });

    effect(() => {
      const size = this.size();
      if (size) {
        this._allExpressiveButtons().forEach((button) => {
          button.size.set(size);
        });
      }
    });

    effect(() => {
      const shape = this.shape();
      if (shape) {
        this._allExpressiveButtons().forEach((button) => {
          button.shape.set(shape);
        });
      }
    });

    effect(() => {
      const appearance = this.appearance();
      if (appearance) {
        this._allExpressiveButtons().forEach((button) => {
          button.appearance = appearance;
        });
      }
    });

    effect(() => {
      const disabled = this.disabled();
      this._allExpressiveButtons().forEach((button) => {
        button.disabled = disabled;
      });
    });
  }

  // ---- ControlValueAccessor ----

  writeValue(value: unknown): void {
    this._setValueAndSync(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // ---- Button click handler (called by child buttons) ----

  /**
   * Handles a button click: toggles selection state, updates the value,
   * syncs toggle indicators, and notifies form infrastructure.
   * @internal
   */
  _onButtonClick(button: MatExpressiveSelectableButton): void {
    const isSelected = this._selectionModel.isSelected(button);

    if (isSelected) {
      this._selectionModel.deselect(button);
    } else {
      if (!this._selectionModel.isMultipleSelection()) {
        this._selectionModel.clear();
      }
      this._selectionModel.select(button);
    }

    this._updateValueFromModel();
    this._syncButtonToggleStates();

    this._onChange(this._value);
    this._onTouched();
    this.selectionChange.emit(new MatExpressiveSelectableButtonChange(button, this._value));
  }

  // ---- Private helpers ----

  private _setValueAndSync(value: unknown): void {
    this._value = value;
    this._syncButtonsWithValue();
  }

  /**
   * Reads `_value` and selects the matching button instances in the selection model,
   * then updates visual toggle states.
   */
  private _syncButtonsWithValue(): void {
    const buttons = this._allExpressiveButtons();
    if (!buttons.length) return;

    this._selectionModel.clear();

    const value = this._value;
    if (value !== null && value !== undefined) {
      const values: unknown[] = Array.isArray(value) ? value : [value];
      buttons.forEach((button) => {
        if (values.includes(button.value())) {
          this._selectionModel.select(button);
        }
      });
    }

    this._syncButtonToggleStates();
  }

  /** Applies `selected`/`unselected` toggle state to every projected button. */
  private _syncButtonToggleStates(): void {
    this._allExpressiveButtons().forEach((button) => {
      button.toggle.set(this._selectionModel.isSelected(button) ? 'selected' : 'unselected');
    });
    this._cdr.markForCheck();
  }

  /** Derives `_value` from the current selection model state. */
  private _updateValueFromModel(): void {
    const selected = this._selectionModel.selected;
    if (this._selectionModel.isMultipleSelection()) {
      this._value = selected.map((b) => b.value());
    } else {
      this._value = selected.length > 0 ? selected[0].value() : undefined;
    }
  }
}
