import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  Input,
  InjectionToken,
  input,
  model,
  NgZone,
  output,
  type Provider,
} from '@angular/core';
import { injectMatExpButtonGroupOptions } from './button-group.options';
import { createButtonGroupBounce, type ButtonGroupBounceHandle } from './button-group.animation';
import { MatExpButton } from '../button';
import { MatExpIconButton } from '../icon-button';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatExpSelectableButton,
  MatExpSelectableButtonChange,
} from '../selectable-button/selectable-button';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  bindButtonGroupChildren,
  toButtonGroupChild,
} from '../button-group-child/button-group-child';

/**
 * Injection token that can be used to reference instances of `MatExpButtonGroup`.
 * It serves as alternative token to the actual `MatExpButtonGroup` class which
 * could cause unnecessary retention of the class and its component metadata.
 */
export const MAT_EXP_BUTTON_GROUP = new InjectionToken<MatExpButtonGroup>('MatExpButtonGroup');

/**
 * Provider Expression that allows mat-exp-button-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)] and reactive forms.
 * @docs-private
 */
export const MAT_EXP_BUTTON_GROUP_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatExpButtonGroup),
  multi: true,
};

/**
 * Component that groups buttons and provides single/multi-select behavior
 * compatible with Angular reactive and template-driven forms.
 */
@Component({
  selector: 'mat-exp-button-group',
  providers: [
    MAT_EXP_BUTTON_GROUP_VALUE_ACCESSOR,
    { provide: MAT_EXP_BUTTON_GROUP, useExisting: MatExpButtonGroup },
  ],
  templateUrl: './button-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[class]': 'matExpButtonGroupClass',
    '[attr.data-variant]': 'variant()',
    '[attr.data-selection]': 'selection()',
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled()',
  },
})
export class MatExpButtonGroup implements ControlValueAccessor {
  private readonly _options = injectMatExpButtonGroupOptions();

  /** @default 's' */
  public readonly size = input(this._options.size);
  /** @default 'round' */
  public readonly shape = input(this._options.shape);
  /** @default 'single-select' */
  public readonly selection = input(this._options.selection);
  /** @default 'standard' */
  public readonly variant = input(this._options.variant);
  public readonly appearance = input(this._options.appearance);
  public readonly disabled = model(this._options.disabled);
  /**
   * Disables the M3 Expressive press-bounce animation (see `button-group.animation.ts`).
   * Only has an effect on the `standard` variant, which is the only variant the bounce ever
   * runs on.
   *
   * @default false
   */
  public readonly disableBounce = input(this._options.disableBounce);

  /** Emits when the selected value changes, either via user interaction or programmatic update. */
  public readonly selectionChange = output<MatExpSelectableButtonChange>();

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
  public readonly matExpButtonGroupClass = 'mat-exp-button-group';

  readonly _matExpButtons = contentChildren<MatExpButton>(MatExpButton);
  readonly _matExpIconButtons = contentChildren<MatExpIconButton>(MatExpIconButton);
  readonly _allExpressiveButtons = computed(() => [
    ...this._matExpButtons(),
    ...this._matExpIconButtons(),
  ]);

  /**
   * `_allExpressiveButtons` adapted to the narrow `ButtonGroupChild` contract, used to
   * broadcast `size`/`shape`/`appearance`/`disabled` without depending on the concrete
   * button directive types.
   * @internal
   */
  readonly _allButtonGroupChildren = computed(() =>
    this._allExpressiveButtons().map(toButtonGroupChild),
  );

  /** Tracks which buttons are currently selected. */
  _selectionModel = new SelectionModel<MatExpSelectableButton>(false, undefined, false);

  private _onChange: (value: unknown) => void = () => undefined;
  private _onTouched: () => void = () => undefined;
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _hostElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly _ngZone = inject(NgZone);

  /**
   * Press-bounce driver for the M3 Expressive "standard button group"
   * interaction (see `button-group.animation.ts`). Created lazily in the
   * browser (`afterNextRender`), stays `null` on the server.
   */
  private _bounce: ButtonGroupBounceHandle | null = null;
  private readonly _interactionAbort = new AbortController();

  constructor() {
    // Keep selection model's `multiple` flag in sync with the `selection` input.
    effect(() => {
      const isMultiple = this.selection() === 'multi-select';
      if (this._selectionModel.isMultipleSelection() !== isMultiple) {
        this._selectionModel = new SelectionModel<MatExpSelectableButton>(
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

    // Broadcast `size`/`shape`/`appearance`/`disabled` down to the projected buttons via the
    // narrow `ButtonGroupChild` contract (shared with `MatExpSplitButton`).
    bindButtonGroupChildren({
      children: this._allButtonGroupChildren,
      size: this.size,
      shape: this.shape,
      appearance: this.appearance,
      disabled: this.disabled,
    });

    // M3 Expressive press bounce (standard variant only): pressing a child
    // springs its width up by 15% while the neighbors compress to keep the
    // group's total width constant (see `button-group.animation.ts` for the
    // measurements ported from Compose's ButtonGroup.kt). Listeners run
    // outside Angular — the animation is DOM-only and must not trigger
    // change detection on every pointer/tick.
    afterNextRender(() => {
      this._bounce = createButtonGroupBounce(() => this._childButtonElements());
      this._ngZone.runOutsideAngular(() => this._setupBounceInteractions());
    });

    // Snap any in-flight bounce back to rest immediately when a consumer flips
    // `disableBounce` mid-press, rather than leaving it stuck expanded until
    // `_canBounceOn` merely blocks the *next* press.
    effect(() => {
      if (this.disableBounce()) {
        this._bounce?.destroy();
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this._interactionAbort.abort();
      this._bounce?.destroy();
      this._bounce = null;
    });
  }

  /**
   * Projected button host elements in DOM order. The two `contentChildren`
   * queries are each in DOM order but are concatenated per type, so a mixed
   * group needs an explicit document-position sort.
   */
  private _childButtonElements(): HTMLElement[] {
    return this._allExpressiveButtons()
      .map((button) => button._hostElement)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  }

  /** Whether a press on `button` should run the bounce animation right now. */
  private _canBounceOn(button: HTMLElement | null): button is HTMLElement {
    return (
      button !== null &&
      this.variant() === 'standard' &&
      !this.disableBounce() &&
      !this.disabled() &&
      !(button as HTMLButtonElement).disabled &&
      button.getAttribute('aria-disabled') !== 'true'
    );
  }

  /**
   * Mirrors Compose's `EnlargeOnPressNode` interaction handling: pointer and
   * keyboard presses expand the pressed child; the release (or a cancel)
   * lets it spring back. `Enter` activates on keydown, so it is treated as a
   * press with an immediate release — the 0.75 release gate in the animation
   * still plays the full bounce.
   */
  private _setupBounceInteractions(): void {
    const host = this._hostElement;
    const signal = this._interactionAbort.signal;

    const findButton = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      const button = target.closest<HTMLElement>('.mat-exp-button, .mat-exp-icon-button');
      return button !== null && host.contains(button) ? button : null;
    };

    host.addEventListener(
      'pointerdown',
      (event) => {
        const button = findButton(event.target);
        if (!this._canBounceOn(button)) return;
        this._bounce?.press(button);

        const onRelease = (): void => {
          window.removeEventListener('pointerup', onRelease);
          window.removeEventListener('pointercancel', onRelease);
          this._bounce?.release();
        };
        window.addEventListener('pointerup', onRelease, { signal });
        window.addEventListener('pointercancel', onRelease, { signal });
      },
      { signal },
    );

    host.addEventListener(
      'keydown',
      (event) => {
        if (event.repeat) return;
        const button = findButton(event.target);
        if (!this._canBounceOn(button)) return;
        if (event.key === ' ') {
          this._bounce?.press(button);
        } else if (event.key === 'Enter') {
          this._bounce?.press(button);
          this._bounce?.release();
        }
      },
      { signal },
    );

    host.addEventListener(
      'keyup',
      (event) => {
        if (event.key === ' ') {
          this._bounce?.release();
        }
      },
      { signal },
    );
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
  _onButtonClick(button: MatExpSelectableButton): void {
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
    this.selectionChange.emit(new MatExpSelectableButtonChange(button, this._value));
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
