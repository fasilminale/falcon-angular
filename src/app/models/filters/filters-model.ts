import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {ElmValidators} from '@elm/elm-styleguide-ui';
import {validateDate} from '../../pages/invoice-edit-page/trip-information/trip-information.component';

export class FiltersModel {
  fb = new FormBuilder();
  form: FormGroup = this.fb.group({
    initial: new FormControl(),
    originCity: new FormControl(),
    destinationCity: new FormControl(),
    invoiceStatuses: new FormArray([]),
    scac: new FormControl(),
    shippingPoints: new FormControl(),
    mode: new FormControl(),
    filterBySpotQuote: new FormControl(),
    minPickupDateTime: new FormControl({}, [ElmValidators.required()]),
    maxPickupDateTime: new FormControl({}, [ElmValidators.required()]),
    minDeliveryDateTime: new FormControl({}, [ElmValidators.required()]),
    maxDeliveryDateTime: new FormControl({}, [ElmValidators.required()])
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
      maxDeliveryDateTime: null
    });
    (this.form.get('invoiceStatuses') as FormArray)?.clear();
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
    return {
      invoiceStatuses, originCity, destinationCity,
      carrierSCAC: carrierSCAC ? carrierSCAC : [],
      shippingPoints: shippingPoints ? [shippingPoints] : [],
      mode: carrierMode ? carrierMode : [],
      filterBySpotQuote,
      minPickupDateTime,
      maxPickupDateTime,
      minDeliveryDate,
      maxDeliveryDate
    };
  }

  resetGroup<T extends AbstractControl>(control: AbstractControl | null): void {
    if (control instanceof FormArray) {
      control.clear();
    }
    if (control instanceof FormControl) {
      control.reset();
    }
  }
}
