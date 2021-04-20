import {Component, forwardRef, Input, OnInit} from '@angular/core';
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
           [options]="{ prefix: '$' }"
           [(ngModel)]="value"
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

  @Input() initialValue = '0.00';
  @Input() isDisabled = false;
  @Input() isError = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.value = this.initialValue;
  }

}
