import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {StatusModel} from '../invoice/status-model';

export class FiltersModel {
  fb = new FormBuilder();
  form: FormGroup = new FormGroup({
    initial: new FormControl()
  });

  public invoiceStatusOptions: Array<StatusModel> = [
    {statusLabel: 'Approved', milestoneLabel: 'Approved', key: 'APPROVED'},
    {statusLabel: 'Created', milestoneLabel: 'Invoice Created', key: 'CREATED'},
    {statusLabel: 'Deleted', milestoneLabel: 'Invoice Deleted', key: 'DELETED'},
    {statusLabel: 'Paid', milestoneLabel: 'Paid Invoice', key: 'PAID'},
    {statusLabel: 'Pending Pay', milestoneLabel: 'Pending Payment by ERP', key: 'PENDING_PAY'},
    {statusLabel: 'Rejected', milestoneLabel: 'Rejected', key: 'REJECTED'},
    {statusLabel: 'Resubmitted', milestoneLabel: 'Re-Submitted for Approval', key: 'RESUBMITTED'},
    {statusLabel: 'Submitted', milestoneLabel: 'Submitted for Approval', key: 'SUBMITTED'},

  ];

  constructor() {
    this.resetForm();
  }

  resetForm(): void {
    this.form = this.fb.group({
      invoiceStatuses: new FormArray([])
    });
  }

  onCheckChange(arrayName: string, event: any): void {
    const formArray: FormArray = this.form.get(arrayName) as FormArray;
    /* Selected */
    if (event.target.checked) {
      // Add a new control in the arrayForm
      formArray.push(new FormControl(event.target.value));
    }
    /* unselected */
    else {
      // find the unselected element
      let i = 0;

      formArray.controls.forEach((ctrl: AbstractControl) => {
        if (ctrl.value === event.target.value) {
          // Remove the unselected element from the arrayForm
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  isChecked(fieldName: string, fieldValue: string): boolean {
    const formArray = this.form.get(fieldName);
    if (formArray) {
      return formArray.value.indexOf(fieldValue) >= 0;
    }
    return false;
  }

  cloneAbstractControl<T extends AbstractControl>(control: T): T {
    let newControl: T;

    if (control instanceof FormGroup) {
      const formGroup = new FormGroup({}, control.validator, control.asyncValidator);
      const controls = control.controls;

      Object.keys(controls).forEach(key => {
        formGroup.addControl(key, this.cloneAbstractControl(controls[key]));
      });

      newControl = formGroup as any;
    } else if (control instanceof FormArray) {
      const formArray = new FormArray([], control.validator, control.asyncValidator);

      control.controls.forEach(formControl => formArray.push(this.cloneAbstractControl(formControl)));

      newControl = formArray as any;
    } else if (control instanceof FormControl) {
      newControl = new FormControl(control.value, control.validator, control.asyncValidator) as any;
    } else {
      throw new Error('Error: unexpected control value');
    }

    if (control.disabled) {
      newControl.disable({emitEvent: false});
    }

    return newControl;
  }

  formatForSearch(): object {
    return {
      invoiceStatuses: this.form.get('invoiceStatuses')?.value
    };
  }
}
