import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {FalControlValueAccessorComponent} from '../fal-control-value-accessor/fal-control-value-accessor.component';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

/**
 * Represents different ways of laying out radio buttons
 */
export enum FalRadioOrientation {
  HORIZONTAL,
  VERTICAL
}

/**
 * Represents the different values that can be understood as a radio option by the component.
 *
 * Example of an ugly, but still valid, array of options:
 * [
 *  'option1',
 *  {value: 'option2'},
 *  {value: 'option3', display: 'Option 3 (but pretty)'}
 * ]
 */
export type FalRadioOption = string | FalRadioDisplayOption;

/**
 * Represents a single option in a list of radio buttons.
 * If the display value is not provided, the value is displayed to the user.
 */
export interface FalRadioDisplayOption {
  display?: string;
  value: string;
}

@Component({
  selector: 'app-fal-radio-input',
  template: `
    <div ngbRadioGroup
         [disabled]="disabled"
         [ngClass]="{'form-control': outline, 'error': isError}"
         [(ngModel)]="value">
      <div [ngClass]="{'row': isHorizontal()}">
        <div *ngIf="options.length <= 0"
             class="fieldLabel1">
          {{noOptionMessage}}
        </div>
        <div *ngFor="let option of options; index as i"
             [ngClass]="{'col-12 col-sm-10 col-md-6 col-lg-4 col-xl-3': isHorizontal()}">
          <label ngbButtonLabel [ngClass]="{'disabled': disabled}">
            <input ngbButton
                   type="radio"
                   [value]="getValue(option)"
                   [tabIndex]="0"
            />
            {{getDisplay(option)}}
          </label>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./fal-radio-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FalRadioInputComponent),
      multi: true
    }
  ]
})
export class FalRadioInputComponent extends FalControlValueAccessorComponent<string>
  implements OnInit {

  @Input() outline = true;
  @Input() isError = false;
  @Input() disabled = false;
  @Input() orientation = FalRadioOrientation.VERTICAL;
  @Input() options: Array<FalRadioOption> = [];
  @Input() noOptionMessage = '(Missing Radio Options)';
  @Input() initialValue: string | undefined;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.value = this.initialValue;
  }

  getValue(option: FalRadioOption): string {
    if (typeof option === 'string') {
      return option;
    }
    return option.value;
  }

  getDisplay(option: FalRadioOption): string {
    if (typeof option === 'string') {
      return option;
    }
    if (option.display) {
      return option.display;
    }
    return option.value;
  }

  isHorizontal(): boolean {
    return this.orientation === FalRadioOrientation.HORIZONTAL;
  }

}

