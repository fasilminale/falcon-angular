import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnChanges {
  @Input() label = 'Enter all or partial Falcon Invoice or Invoice Reference or BOL #';
  @Input() invalidIdMessage = 'No invoices found';
  @Input() requiredMessage = 'Falcon Invoice Number is required';
  @Input() patternMessage = 'Falcon Invoice Number is invalid';
  @Input() totalResults = 0;
  @Input() controlGroup!: FormGroup;

  @Output() submitEvent: EventEmitter<string> = new EventEmitter<string>();

  submitted = false;

  constructor() {
  }

  ngOnChanges(): void {
    if (this.submitted && this.totalResults === 0) {
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
      this.submitEvent.emit(this.controlGroup.controls.control.value);
    }
  }

  clear(): void {
    this.controlGroup.controls.control.setValue('');
    this.submitted = false;
  }
}
