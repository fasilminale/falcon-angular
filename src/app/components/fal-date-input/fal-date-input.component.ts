import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgbDateNativeAdapter, NgbDateAdapter} from '@ng-bootstrap/ng-bootstrap';
import {FalControlValueAccessorComponent} from '../fal-control-value-accessor/fal-control-value-accessor.component';

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
export class FalDateInputComponent extends FalControlValueAccessorComponent<string>
  implements OnInit {

  @Input() navigation = 'select';

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.value = '';
  }

}

