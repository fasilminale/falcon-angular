import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AbstractControlOptions, AsyncValidatorFn, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {buttonStyleOptions} from '@elm/elm-styleguide-ui';
import {SelectOption} from '../../models/select-option-model/select-option-model';
import {CalcDetail} from '../../models/rate-engine/rate-engine-request';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-fal-new-charge-modal',
  templateUrl: './fal-new-charge-modal.component.html',
  styleUrls: ['./fal-new-charge-modal.component.scss']
})
export class FalNewChargeModalComponent {

  public readonly form: FormGroup;
  public readonly chargeControl: FormControl = new FormControl(null, Validators.required);
  public readonly variableControls: FormGroup = new FormGroup({});
  public readonly commentControl: FormControl = new FormControl('', Validators.required);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(@Inject(MAT_DIALOG_DATA) public data: NewChargeModalInput,
              private dialogRef: MatDialogRef<FalNewChargeModalComponent>) {
    this.subscriptions.add(this.dialogRef.afterClosed().subscribe(() => this.subscriptions.unsubscribe()));
    this.subscriptions.add(this.chargeControl.valueChanges.subscribe(
      value => this.onChargeSelect(value)
    ));
    this.form = new FormGroup({
      charge: this.chargeControl,
      variables: this.variableControls,
      comment: this.commentControl
    });
    this.commentControl.disable();
  }

  getVariableControlNames(): Array<string> {
    return Object.keys(this.variableControls.controls)
      .filter(vcName => this.variableControls.contains(vcName));
  }

  clearAllVariableControls(): void {
    this.getVariableControlNames()
      .forEach(vcName => this.variableControls.removeControl(vcName));
  }

  onChargeSelect(charge: CalcDetail): void {
    this.commentControl.disable();
    this.commentControl.setValidators([]);
    if (charge.name === 'OTHER') {
      this.commentControl.setValidators([Validators.required]);
      this.commentControl.enable();
    }
    this.commentControl.setValue('');
    const variables = charge.variables ?? [];
    this.clearAllVariableControls();
    variables.forEach(variable => {
      const vfc = new VariableFormControl(
        variable.variable,
        variable.displayName ?? variable.variable,
        '',
        Validators.required
      );
      this.variableControls.addControl(vfc.displayName, vfc);
    });
  }

  confirm(): void {
    let result: NewChargeModalOutput;
    if (this.chargeControl.value) {
      const selected: CalcDetail = {
        accessorialCode: this.chargeControl.value.accessorialCode,
        attachmentRequired: this.chargeControl.value.attachmentRequired,
        autoApprove: this.chargeControl.value.autoApprove,
        carrierEligible: this.chargeControl.value.carrierEligible,
        fuel: this.chargeControl.value.fuel,
        name: this.chargeControl.value.name,
        variables: []
      };
      this.getVariableControlNames()
        .forEach(vcName => {
          const control = this.variableControls.get(vcName) as VariableFormControl;
          if (control) {
            selected.variables?.push({
              variable: control.variableName,
              displayName: control.displayName,
              quantity: control.value
            });
          }
        });
      result = {
        selected,
        comment: this.commentControl.enabled ? this.commentControl.value : undefined
      };
    }
    this.dialogRef.close(result);
  }

}

/**
 * Input type required to create the modal.
 */
export type NewChargeModalInput = {
  title?: string,
  innerHtmlMessage?: string,
  confirmButtonStyle?: buttonStyleOptions,
  confirmButtonText?: string,
  cancelButtonText?: string,
  costBreakdownOptions: Array<SelectOption<CalcDetail>>
};

/**
 * Output type returned from the modal.
 */
export type NewChargeModalOutput = undefined | {
  selected: CalcDetail,
  comment?: string
};

class VariableFormControl extends FormControl {
  constructor(public readonly variableName: string,
              public readonly displayName: string,
              formState?: any,
              validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
              asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
    super(formState, validatorOrOpts, asyncValidator);
  }
}
