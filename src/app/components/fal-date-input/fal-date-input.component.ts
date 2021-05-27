import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgbDateNativeAdapter, NgbDateParserFormatter, NgbDateAdapter} from '@ng-bootstrap/ng-bootstrap';
import { DateParserFormatter } from 'src/app/utils/date-parser-formatter';
import {FalControlValueAccessorComponent} from '../fal-control-value-accessor/fal-control-value-accessor.component';

@Component({
  selector: 'app-fal-date-input',
  template: `
    <div class="form-group">
      <div class="input-group">
        <input class="form-control"
               [ngClass]="isError ? 'error' : ''"
               [disabled]="isDisabled"
               placeholder="mm-dd-yyyy"
               ngbDatepicker #d="ngbDatepicker"
               [readOnly]="false"
               navigation="select"
               container="body"
               [(ngModel)]="value"
               (input)="formatText($event.target)"
               (ngModelChange)="value"
        />
        <button [ngClass]="isError ? 'error' : ''"
                [disabled]="isDisabled"
                type="button"
                class="btn btn-outline-secondary material-icons align-middle"
                (click)="d.toggle()">
          today
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./fal-date-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FalDateInputComponent),
      multi: true
    },
    {provide: NgbDateAdapter, useClass: NgbDateNativeAdapter},
    {provide: NgbDateParserFormatter, useClass: DateParserFormatter}
  ]
})
export class FalDateInputComponent extends FalControlValueAccessorComponent<string>
  implements OnInit {

  @Input() isDisabled = false;
  @Input() navigation = 'select';
  @Input() isError = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.value = '';
  }

  formatText(target: any) {
    if(target) {
      const date = target.value;
      if(date && (date.length===2 || date.length===5)) {
        target.value = date +'-';
      }
    }
  }
}
