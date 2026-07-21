import { Directive, ElementRef, computed, inject, input, model } from '@angular/core';
import { injectMatExpButtonOptions } from './button.options';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { MatExpButtonGroup } from '../button-group';
import { MatExpSelectableButton } from '../selectable-button/selectable-button';
import { MatExpButtonToggle } from '../../../types';
import { MatMenuTrigger } from '@angular/material/menu';

/**
 * Directive to style the Angular Material Button component with latest Material 3 Design System Expressive styles.
 */
@Directive({
  selector: '[matExpButton]',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-state]': 'state()',
    '[attr.data-toggle]': 'toggle()',
    '[attr.data-menu-open]': 'isMenuOpen',
    '[attr.aria-pressed]': 'ariaPressed()',
    '[class]': 'matExpButtonClass',
    '(click)': '_onButtonClick()',
  },
  exportAs: 'matExpButton',
})
export class MatExpButton implements MatExpSelectableButton {
  private readonly _options = injectMatExpButtonOptions();

  /**
   * Host element of the button, used by `MatExpButtonGroup` to drive the
   * press-bounce width animation on its projected children.
   * @internal
   */
  public readonly _hostElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** @default 's' */
  public readonly size = model(this._options.size);
  /** @default 'round' */
  public readonly shape = model(this._options.shape);
  /**
   * The toggle state of the button (`'selected' | 'unselected'`).
   *
   * Inside a `MatExpButtonGroup`, the group is the source of truth: it manages this model for
   * every projected button in response to clicks, keeping it in sync with the group's
   * single-/multi-select state.
   *
   * Standalone (outside a group), a click does **not** flip this value automatically — the
   * directive's click handler only delegates to a parent group when one is present. Toggling a
   * standalone button is consumer-driven: two-way bind `toggle` and flip it yourself in your own
   * `(click)` handler, e.g.
   * `[(toggle)]="state" (click)="state.set(state() === 'selected' ? 'unselected' : 'selected')"`.
   * This is an intentional, documented contract (see issue #188) — not a bug.
   */
  public readonly toggle = model<MatExpButtonToggle | undefined>(this._options.toggle);
  public readonly value = model<unknown>();

  /**
   * `aria-pressed`, derived from `toggle()`. `null` when the button does not
   * participate in toggle behavior, so the attribute is omitted entirely
   * rather than rendered as `aria-pressed="false"` (its mere presence changes
   * how assistive technology announces the control).
   * @internal
   */
  public readonly ariaPressed = computed(() => {
    const toggle = this.toggle();
    return toggle === undefined ? null : toggle === 'selected' ? 'true' : 'false';
  });

  /**
   * @internal
   */
  public readonly matExpButtonClass = 'mat-exp-button';

  /**
   * @internal
   */
  public readonly state = input(this._options.state);

  get appearance(): MatButtonAppearance | null {
    return this.matButton.appearance;
  }
  set appearance(appearance: MatButtonAppearance) {
    this.matButton.appearance = appearance;
  }

  get disabled(): boolean {
    return this.matButton.disabled;
  }
  set disabled(disabled: boolean | undefined) {
    this.matButton.disabled = disabled;
  }

  private readonly matButton = inject(MatButton);
  private readonly buttonGroup = inject(MatExpButtonGroup, { optional: true });

  _onButtonClick(): void {
    this.buttonGroup?._onButtonClick(this);
  }
  private readonly matMenu = inject(MatMenuTrigger, { optional: true });

  get isMenuOpen(): boolean {
    return this.matMenu?.menuOpen ?? false;
  }
}
