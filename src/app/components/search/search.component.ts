import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { isExpressionWithTypeArguments } from 'typescript';
import {PaginationModel} from '../../models/PaginationModel';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  paginationModel: PaginationModel = new PaginationModel();
  @Input() label = 'Enter the Falcon Invoice Number - 10 characters required';
  @Input() minLengthMessage = 'Invoice Number must be 10 characters';
  @Input() invalidIdMessage = 'Invoice Number is not found';
  @Input() requiredMessage = 'Invoice Number is required';
  @Input() patternMessage = 'Invoice Number is invalid';
  @Input() totalResults = 0;

  @Output() submitEvent: EventEmitter<string> = new EventEmitter<string>();

  controlGroup = new FormGroup({
    control: new FormControl()
  });

  submitted: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.controlGroup = this.fb.group({
        control: [null, [Validators.pattern('^[A-Za-z0-9]*$'), Validators.required, Validators.minLength(10)]]
      }, {updateOn: 'submit'}
    );
  }

  ngOnChanges(): void {
    if(this.submitted && this.totalResults === 0) {
      this.controlGroup.controls.control.setErrors({badID: true});
    }
  }

  showHelperText(): boolean {
    return (!this.controlGroup.controls.control.errors ||
      (this.controlGroup.controls.control.hasError('required') && !this.submitted));
  }

  getErrorMessage(): string | null {
    if (this.controlGroup.controls.control.hasError('badID')) {
      return this.invalidIdMessage;
    }
    if (this.controlGroup.controls.control.hasError('minlength')) {
      return this.minLengthMessage;
    }
    if (this.controlGroup.controls.control.hasError('required') && this.submitted) {
      return this.requiredMessage;
    }
    if (this.controlGroup.controls.control.hasError('pattern')) {
      return this.patternMessage;
    }
    return null;
  }

  submit(): void {
    this.submitted = true;
    if (this.controlGroup.valid && this.controlGroup.dirty) {
      //this.totalResults = -1; // this is for redetect ngonchanges
      this.submitEvent.emit(this.controlGroup.controls.control.value);
    }
  }
}
