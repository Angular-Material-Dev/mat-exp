import { Directive, ElementRef, computed, inject, Input, input, model } from '@angular/core';
import { injectMatExpIconButtonOptions } from './icon-button.options';
import { MatIconButton } from '@angular/material/button';
import { MatExpSelectableButton } from '../selectable-button/selectable-button';
import { MatExpButtonGroup } from '../button-group';
import { MatExpButtonToggle, MatExpIconButtonAppearance } from '../../../types';
import { MatMenuTrigger } from '@angular/material/menu';
/**
 * Directive to style the Angular Material Icon Button component with latest Material 3 Design System Expressive styles.
 */
@Directive({
  selector: '[matExpIconButton]',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-appearance]': 'appearance',
    '[attr.data-state]': 'state()',
    '[attr.data-toggle]': 'toggle()',
    '[attr.data-width]': 'width()',
    '[attr.data-menu-open]': 'isMenuOpen',
    '[attr.aria-pressed]': 'ariaPressed()',
    '[class]': 'matExpIconButtonClass',
    '(click)': '_onButtonClick()',
  },
  exportAs: 'matExpIconButton',
})
export class MatExpIconButton implements MatExpSelectableButton {
  private readonly _options = injectMatExpIconButtonOptions();

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
  public readonly width = input(this._options.width);
  /**
   * The toggle state of the icon button (`'selected' | 'unselected'`).
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

  private _appearance = this._options.appearance;
  @Input()
  get appearance(): MatExpIconButtonAppearance | undefined {
    return this._appearance;
  }
  set appearance(appearance: MatExpIconButtonAppearance | undefined) {
    this._appearance = appearance;
  }
  /**
   * @internal
   */
  public readonly matExpIconButtonClass = 'mat-exp-icon-button';

  /**
   * @internal
   */
  public readonly state = input(this._options.state);

  get disabled(): boolean {
    return this.matIconButton.disabled;
  }
  set disabled(disabled: boolean | undefined) {
    this.matIconButton.disabled = disabled;
  }

  private readonly matIconButton = inject(MatIconButton);
  private readonly buttonGroup = inject(MatExpButtonGroup, { optional: true });

  _onButtonClick(): void {
    this.buttonGroup?._onButtonClick(this);
  }

  private readonly matMenu = inject(MatMenuTrigger, { optional: true });

  get isMenuOpen(): boolean {
    return this.matMenu?.menuOpen ?? false;
  }
}
