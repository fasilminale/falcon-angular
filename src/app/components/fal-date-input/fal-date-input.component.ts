import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgbDateNativeAdapter, NgbDateParserFormatter, NgbDateAdapter} from '@ng-bootstrap/ng-bootstrap';
import {DateParserFormatter} from 'src/app/utils/date-parser-formatter';
import {FalControlValueAccessorComponent} from '../fal-control-value-accessor/fal-control-value-accessor.component';

@Component({
  selector: 'app-fal-date-input',
  template: `
    <div class="form-group">
      <div class="input-group">
        <input class="form-control"
               [ngClass]="isError ? 'error' : ''"
               [disabled]="isDisabled"
               [placeholder]="placeholder"
               ngbDatepicker #d="ngbDatepicker"
               [readOnly]="false"
               navigation="select"
               container="body"
               [(ngModel)]="value"
               (ngModelChange)="value"
               rInputMask="99-99-9999"
               (focus)="focus.emit($event)"
               (blur)="onTouched()"
        />
        <button [ngClass]="{ 'error': isError, 'btn-secondary': isDisabled, 'btn-primary': !isDisabled }"
                [disabled]="isDisabled"
                type="button"
                class="btn material-icons align-middle"
                (focusout)="focus.emit($event)"
                (click)="d.toggle()">
          event
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
  @Input() placeholder = 'mm-dd-yyyy';

  @Output() focus = new EventEmitter<FocusEvent>();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.value = '';
  }

}
