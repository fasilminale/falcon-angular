import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {buttonStyleOptions} from '@elm/elm-styleguide-ui';
import {Subscription} from 'rxjs';
import {CalcDetailVariable} from '../../models/rate-engine/rate-engine-request';

@Component({
  selector: 'app-fal-edit-charge-modal',
  templateUrl: './fal-edit-charge-modal.component.html',
  styleUrls: ['./fal-edit-charge-modal.component.scss']
})
export class FalEditChargeModalComponent {

  public readonly chargeControl = new FormControl({value: '', disabled: true});
  public readonly variableControls = new FormGroup({});
  public readonly form = new FormGroup({
    charge: this.chargeControl,
    variables: this.variableControls
  });
  private readonly subscriptions: Subscription = new Subscription();

  constructor(@Inject(MAT_DIALOG_DATA) public data: EditChargeModalInput,
              private dialogRef: MatDialogRef<FalEditChargeModalComponent>) {
    // make sure that subscriptions are closed after the modal closes
    this.subscriptions.add(this.dialogRef.afterClosed()
      .subscribe(() => this.subscriptions.unsubscribe())
    );
    this.loadData(data);
  }

  /**
   * Load the data given to the modal at creation.
   * Separate from the constructor for easy testing!
   */
  loadData(data: EditChargeModalInput): void {
    data.costLineItem?.value?.variables.forEach((variable: any) => {
      const vfc = new VariableFormControl(
        variable.variable,
        variable.displayName,
        variable.quantity,
        Validators.required
      );
      this.variableControls.addControl(vfc.displayName, vfc);
    });
    this.chargeControl.patchValue(data.costLineItem?.value?.charge);
  }

  /**
   * Returns an array of strings that can be used to access the
   * controls on the {@link variableControls} FormGroup.
   */
  getVariableControlNames(): Array<string> {
    // Object.keys returns the names of all fields on the controls object,
    // therefore we need to use filter() to ensure that we only return field
    // names that match FormControls contained in the FormGroup.
    return Object.keys(this.variableControls.controls)
      .filter(vcName => this.variableControls.contains(vcName));
  }

  /**
   * Called when the confirm button in the modal is clicked.
   */
  onConfirmButtonClick(): void {
    let modalOutput: EditChargeModalOutput;
    if (this.chargeControl?.value) {
      const variables: Array<CalcDetailVariable> = [];
      this.getVariableControlNames()
        .forEach(vcName => {
          const control = this.variableControls.get(vcName) as VariableFormControl;
          if (control) {
            variables.push({
              variable: control.variableName,
              quantity: control.value,
              displayName: control.displayName
            });
          }
        });
      modalOutput = {
        charge: this.chargeControl?.value,
        variables
      };
    }
    // return the result to the subscribers of the modal
    this.dialogRef.close(modalOutput);
  }

}

/**
 * Input type required to create the modal.
 */
export type EditChargeModalInput = {
  title?: string,
  innerHtmlMessage?: string,
  confirmButtonStyle?: buttonStyleOptions,
  confirmButtonText?: string,
  cancelButtonText?: string,
  costLineItem: AbstractControl
};

/**
 * Output type returned from the modal.
 */
export type EditChargeModalOutput = undefined | {
  charge: string,
  variables: Array<CalcDetailVariable>
};

/**
 * An extension to FormControl that allows useful metadata
 * related to variables to be passed along inside the control.
 */
export class VariableFormControl extends FormControl {
  constructor(
    /**
     * The name of the variable represented by this FormControl
     */
    public readonly variableName: string,
    /**
     * The display name of the variable represented by this FormControl
     */
    public readonly displayName: string,
    // everything below just preserves the existing functionality of the FormControl...
    formState?: any,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
    super(formState, validatorOrOpts, asyncValidator);
  }
}
