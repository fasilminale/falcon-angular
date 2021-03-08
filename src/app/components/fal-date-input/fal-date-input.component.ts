import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-fal-date-input',
  template: `
    <label [id]="id + '-label'" [for]="id + '-input'" class="form-label fieldLabel1">
      {{label}}
    </label>
    <div class="form-group">
      <div class="input-group">
        <input [id]="id + '-input'"
               class="form-control"
               placeholder="yyyy-mm-dd"
               ngbDatepicker #d="ngbDatepicker"
               [readOnly]="true"
               navigation="select"
               container="body"
               [value]="value"
        />
        <button type="button"
                class="btn btn-outline-secondary material-icons align-middle"
                (click)="d.toggle()">
          today
        </button>
      </div>
    </div>
  `,
  styles: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FalDateInputComponent),
      multi: true
    }
  ]
})
export class FalDateInputComponent implements OnInit, ControlValueAccessor {
  @Input() label = '';
  @Input() id = '';
  @Input() navigation = 'select';

  value = '';
  onChange: (newValue: string) => void = _ => {
    // by default, do nothing
  };
  onTouched: (currentValue: string) => void = _ => {
    // by default do nothing
  };

  constructor() {
  }

  ngOnInit(): void {
  }

  writeValue(newValue: string): void {
    this.value = newValue;
  }

  registerOnChange(fn: (newValue: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: (currentValue: string) => void): void {
    this.onTouched = fn;
  }


}

