import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {FalControlValueAccessorComponent} from '../fal-control-value-accessor/fal-control-value-accessor.component';

@Component({
  selector: 'app-fal-currency-input',
  template: `
    <div class="form-group">
      <div class="input-group">
        <input id="currency-input"
               type="text"
               [ngClass]="isError ? 'error' : ''"
               [disabled]="isDisabled"
               class="form-control"
               currencyMask
               [options]="{ prefix: PREFIX }"
               [(ngModel)]="value"
               (keydown)="onSelectionEvent($event)"
               (keyup)="onSelectionEvent($event)"
               (focus)="focus.emit($event); onSelectionEvent($event)"
               (click)="onSelectionEvent($event)"
               (blur)="onTouched()"
        />
      </div>
    </div>
  `,
  styleUrls: ['./fal-currency-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FalCurrencyInputComponent),
      multi: true
    }
  ]
})
export class FalCurrencyInputComponent extends FalControlValueAccessorComponent<string> implements OnInit {

  readonly PREFIX = '$';

  @Input() initialValue = '0.00';
  @Input() isDisabled = false;
  @Input() isError = false;

  @Output() focus = new EventEmitter<FocusEvent>();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.value = this.initialValue;
  }

  /**
   * An event handler for events that may effect text cursor selection.
   */
  onSelectionEvent(event: { target: any }): void {
    this.forceCursorToRightOfPrefix(event.target as Selectable);
  }

  /**
   * Forces the text cursor to the right of the prefix, if it isn't already.
   * This is to alleviate issues with the currency mask, where it behaves strangely when the cursor is in that position.
   */
  forceCursorToRightOfPrefix(selectable: Selectable): void {
    if (selectable.selectionStart != null
      && selectable.selectionStart < this.PREFIX.length) {
      const newStart = this.PREFIX.length;
      const newEnd = selectable.selectionEnd != null
      && selectable.selectionEnd >= this.PREFIX.length
        ? selectable.selectionEnd
        : this.PREFIX.length;
      selectable.setSelectionRange(newStart, newEnd);
    }
  }

}

/**
 * Represents an object that can have it's selection read and written.
 * Mostly just needed for easy mocking during tests.
 */
export interface Selectable {
  selectionStart: number | null;
  selectionEnd: number | null;

  setSelectionRange(newStart: number, newEnd: number): void;
}
