import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup
} from '@angular/forms';

export class FiltersModel {
  fb = new UntypedFormBuilder();
  form: UntypedFormGroup = this.fb.group({
    initial: new UntypedFormControl(),
    originCity: new UntypedFormControl(),
    destinationCity: new UntypedFormControl(),
    invoiceStatuses: new UntypedFormArray([]),
    scac: new UntypedFormControl(),
    shippingPoints: new UntypedFormControl(),
    mode: new UntypedFormControl(),
    filterBySpotQuote: new UntypedFormControl(),
    minPickupDateTime: new UntypedFormControl({}),
    maxPickupDateTime: new UntypedFormControl({}),
    minDeliveryDateTime: new UntypedFormControl({}),
    maxDeliveryDateTime: new UntypedFormControl({}),
    minInvoiceDateTime: new UntypedFormControl({}),
    maxInvoiceDateTime: new UntypedFormControl({}),
    minPaidDateTime: new UntypedFormControl({}),
    maxPaidDateTime: new UntypedFormControl({}),
  });

  constructor() {
    this.resetForm();
  }

  resetForm(): void {
    this.form.patchValue({
      originCity: null,
      destinationCity: null,
      scac: null,
      shippingPoints: null,
      mode: null,
      filterBySpotQuote: null,
      minPickupDateTime: null,
      maxPickupDateTime: null,
      minDeliveryDateTime: null,
      maxDeliveryDateTime: null,
      minInvoiceDateTime: null,
      maxInvoiceDateTime: null,
      minPaidDateTime: null,
      maxPaidDateTime: null,
    });
    (this.form.get('invoiceStatuses') as UntypedFormArray)?.clear();
  }

  onCheckChange(arrayName: string, event: any): void {
    const formArray: UntypedFormArray = this.form.get(arrayName) as UntypedFormArray;
    /* Selected */
    if (event.target.checked) {
      // Add a new control in the arrayForm
      formArray.push(new UntypedFormControl(event.target.value));
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

    if (control instanceof UntypedFormGroup) {
      const formGroup = new UntypedFormGroup({}, control.validator, control.asyncValidator);
      const controls = control.controls;

      Object.keys(controls).forEach(key => {
        formGroup.addControl(key, this.cloneAbstractControl(controls[key]));
      });

      newControl = formGroup as any;
    } else if (control instanceof UntypedFormArray) {
      const formArray = new UntypedFormArray([], control.validator, control.asyncValidator);

      control.controls.forEach(formControl => formArray.push(this.cloneAbstractControl(formControl)));

      newControl = formArray as any;
    } else if (control instanceof UntypedFormControl) {
      newControl = new UntypedFormControl(control.value, control.validator, control.asyncValidator) as any;
    } else {
      throw new Error('Error: unexpected control value');
    }

    if (control.disabled) {
      newControl.disable({emitEvent: false});
    }

    return newControl;
  }

  formatForSearch(): object {
    const invoiceStatuses = this.form.get('invoiceStatuses')?.value;
    const originCity = this.form.get('originCity')?.value;
    const destinationCity = this.form.get('destinationCity')?.value;
    const carrierSCAC = this.form.get('scac')?.value;
    const shippingPoints = this.form.get('shippingPoints')?.value;
    const carrierMode = this.form.get('mode')?.value;
    const filterBySpotQuote = this.form.get('filterBySpotQuote')?.value;
    const minPickupDateTime = this.form.get('minPickupDateTime')?.value;
    const maxPickupDateTime = this.form.get('maxPickupDateTime')?.value;
    const minDeliveryDate = this.form.get('minDeliveryDateTime')?.value;
    const maxDeliveryDate = this.form.get('maxDeliveryDateTime')?.value;
    const minInvoiceDate = this.form.get('minInvoiceDateTime')?.value;
    const maxInvoiceDate = this.form.get('maxInvoiceDateTime')?.value;
    const minPaidDate = this.form.get('minPaidDateTime')?.value;
    const maxPaidDate = this.form.get('maxPaidDateTime')?.value;
    return {
      invoiceStatuses, originCity, destinationCity,
      carrierSCAC: carrierSCAC ? carrierSCAC : [],
      shippingPoints: shippingPoints ? [shippingPoints] : [],
      mode: carrierMode ? carrierMode : [],
      filterBySpotQuote,
      minPickupDateTime, maxPickupDateTime,
      minDeliveryDate, maxDeliveryDate,
      minInvoiceDate, maxInvoiceDate,
      minPaidDate, maxPaidDate,
    };
  }

  resetGroup(control: AbstractControl | null): void {
    if (control instanceof UntypedFormArray) {
      control.clear();
    }
    if (control instanceof UntypedFormControl) {
      control.reset();
    }
  }
}
