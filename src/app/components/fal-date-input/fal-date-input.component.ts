import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgbDateNativeAdapter, NgbDateAdapter} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-fal-date-input',
  template: `
    <div class="form-group">
      <div class="input-group">
        <input class="form-control"
               placeholder="yyyy-mm-dd"
               ngbDatepicker #d="ngbDatepicker"
               [readOnly]="true"
               navigation="select"
               container="body"
               [(ngModel)]="value"
               (ngModelChange)="value"
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
    },
    {provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}
  ]
})
export class FalDateInputComponent implements OnInit, ControlValueAccessor {

  @Input() navigation = 'select';

  private val = '';

  get value(): string {
    return this.val;
  }

  set value(val: string) {
    this.val = val;
    this.onChange(this.val);
    this.onTouched();
  }

  onChange: (newValue: string) => void = _ => {
    // by default, do nothing
  }
  onTouched: () => void = () => {
    // by default do nothing
  }

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

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }


}

