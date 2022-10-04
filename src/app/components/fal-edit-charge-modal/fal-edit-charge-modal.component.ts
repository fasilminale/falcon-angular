import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {buttonStyleOptions} from '@elm/elm-styleguide-ui';
import {Subscription} from 'rxjs';
import {CalcDetail, CalcDetailVariable} from '../../models/rate-engine/rate-engine-request';
import {SelectOption} from '../../models/select-option-model/select-option-model';

@Component({
  selector: 'app-fal-edit-charge-modal',
  templateUrl: './fal-edit-charge-modal.component.html',
  styleUrls: ['./fal-edit-charge-modal.component.scss']
})
export class FalEditChargeModalComponent {

  public readonly chargeControl = new FormControl('', Validators.required);
  public readonly variableControls = new FormGroup({});
  public readonly commentControl: FormControl = new FormControl('');
  public readonly form = new FormGroup({
    charge: this.chargeControl,
    variables: this.variableControls
  });
  public readonly subscriptions = new Subscription();

  /**
   * Constructor initializes data
   */
  constructor(@Inject(MAT_DIALOG_DATA) private data: EditChargeModalInput,
              private dialogRef: MatDialogRef<FalEditChargeModalComponent>) {
    // make sure all subscriptions are closed after the modal closes
    this.subscriptions.add(this.dialogRef.afterClosed()
      .subscribe(() => this.subscriptions.unsubscribe())
    );
    if (this.isEditModal) {
      // EDIT MODE INIT
      this.chargeControl.disable();
      this.setVariables(this.data.costLineItem?.value?.variables);
      this.chargeControl.patchValue(this.data.costLineItem?.value?.charge);
    } else {
      // ADD MODE INIT
      this.subscriptions.add(this.chargeControl.valueChanges.subscribe(
        value => this.onChargeSelect(value)
      ));
      this.form.addControl('comment', this.commentControl);
      this.commentControl.disable();
    }
  }

  /**
   * Returns true if this modal was meant for editing an existing CostLineItem.
   * Returns false if this modal was meant for adding a new CostLineItem.
   */
  get isEditModal(): boolean {
    // If the modal was given a specific costLineItem, assume we were meant to edit it.
    return !!this.data.costLineItem;
  }

  /**
   * The title text for the modal.
   * Has sensible defaults.
   */
  get title(): string {
    return this.data.title ?? (
      this.isEditModal
        ? 'Update Charge Details'
        : 'Add New Charge'
    );
  }

  /**
   * A subtitle message for the modal.
   * Defaults to display nothing.
   */
  get innerHtmlMessage(): string {
    return this.data.innerHtmlMessage ?? '';
  }

  /**
   * Style setting for the confirmation button.
   * Defaults to primary style.
   */
  get confirmButtonStyle(): buttonStyleOptions {
    return this.data.confirmButtonStyle ?? 'primary';
  }

  /**
   * Text for the confirmation button.
   * Has sensible defaults.
   */
  get confirmButtonText(): string {
    return this.data.confirmButtonText ?? (
      this.isEditModal
        ? 'Accept Charge Update'
        : 'Add New Charge'
    );
  }

  /**
   * Text for the cancel button.
   * Defaults to 'Close'.
   */
  get cancelButtonText(): string {
    return this.data.cancelButtonText ?? 'Close';
  }

  /**
   * Convenience accessor for cost breakdown option data.
   * Defaults to an empty array if not provided.
   */
  get costBreakdownOptions(): Array<SelectOption<CalcDetail>> {
    return this.data.costBreakdownOptions ?? [];
  }

  /**
   * An event that is triggered when a new Charge type is selected
   * from the dropdown within the modal.
   */
  onChargeSelect(charge: CalcDetail): void {
    if (!charge) {
      return;
    }
    this.commentControl.disable();
    this.commentControl.setValidators([]);
    if (charge.name === 'OTHER') {
      this.commentControl.setValidators([Validators.required]);
      this.commentControl.enable();
    }
    this.commentControl.setValue('');
    this.setVariables(charge.variables);
  }

  /**
   * Clears the variable controls and the populates them based on the
   * given variable data.
   */
  setVariables(variables: Array<CalcDetailVariable> = []): void {
    this.clearVariableControls();
    variables.forEach(variable => {
      const vfc = this.createFormControlForVariable(variable);
      this.variableControls.addControl(vfc.displayName, vfc);
    });
  }

  /**
   * Converts a CalcDetailVariable object into a VariableFormControl object.
   */
  createFormControlForVariable(variable: CalcDetailVariable): VariableFormControl {
    return new VariableFormControl(
      variable.variable,
      variable.displayName ?? variable.variable,
      this.isEditModal ? variable.quantity : '',
      Validators.required
    );
  }

  /**
   * Returns an array of strings that can be used to access the
   * controls on the {@link variableControls} FormGroup.
   */
  get variableControlNames(): Array<string> {
    // Object.keys returns the names of all fields on the controls object,
    // therefore we need to use filter() to ensure that we only return field
    // names that match FormControls contained in the FormGroup.
    return Object.keys(this.variableControls.controls)
      .filter(vcName => this.variableControls.contains(vcName));
  }

  /**
   * Removes all FormControls within the {@link variableControls} FormGroup.
   */
  clearVariableControls(): void {
    this.variableControlNames
      .forEach(vcName => this.variableControls.removeControl(vcName));
  }

  /**
   * Uses the name to get the VariableFormControl.
   */
  getVariableControl(vcName: string): VariableFormControl | null {
    return this.variableControls.get(vcName) as VariableFormControl;
  }

  /**
   * Called when the confirm button in the modal is clicked.
   */
  onConfirmButtonClick(): void {
    let output: EditChargeModalOutput;
    if (this.chargeControl.value) {
      if (this.isEditModal) {
        // CONFIRM EDIT
        output = {
          charge: this.chargeControl.value,
          variables: this.selectedVariables
        };
      } else {
        // CONFIRM ADD
        output = {
          selected: this.selectedCalcDetail,
          variables: [],
          comment: this.commentValue
        };
      }
    }
    this.close(output);
  }

  /**
   * Builds a CalcDetail object based on the form data.
   */
  get selectedCalcDetail(): CalcDetail {
    return {
      accessorialCode: this.chargeControl.value.accessorialCode,
      attachmentRequired: this.chargeControl.value.attachmentRequired,
      autoApprove: this.chargeControl.value.autoApprove,
      carrierEligible: this.chargeControl.value.carrierEligible,
      fuel: this.chargeControl.value.fuel,
      name: this.chargeControl.value.name,
      variables: this.selectedVariables
    };
  }

  /**
   * Builds an array of CalcDetailVariable based on the form data.
   */
  get selectedVariables(): Array<CalcDetailVariable> {
    const variables: Array<CalcDetailVariable> = [];
    this.variableControlNames.forEach(vcName => {
      const control = this.getVariableControl(vcName);
      if (control) {
        variables.push({
          variable: control.variableName,
          quantity: control.value,
          displayName: control.displayName
        });
      }
    });
    return variables;
  }

  /**
   * Get the comment value from the form.
   * Forces undefined to be returned if comment control is disabled.
   */
  get commentValue(): string | undefined {
    return this.commentControl.enabled
      ? this.commentControl.value
      : undefined;
  }

  /**
   * Wrapper around the dialogRef.close() method to enforce type.
   */
  close(result: EditChargeModalOutput): void {
    this.dialogRef.close(result);
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
  costLineItem?: AbstractControl,
  costBreakdownOptions?: Array<SelectOption<CalcDetail>>,
};

/**
 * Output type returned from the modal.
 */
export type EditChargeModalOutput = undefined | {
  charge?: string,
  variables: Array<CalcDetailVariable>,
  selected?: CalcDetail,
  comment?: string
};

/**
 * Output type used for helper services working with the Add New Charge scenario.
 */
export type NewChargeModalOutput = undefined | {
  selected: CalcDetail,
  comment?: string
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
