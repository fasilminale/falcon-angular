import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
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
    const variables = charge?.variables ?? [];
    this.clearAllVariableControls();
    variables.forEach(variable => {
      this.variableControls.addControl(variable.variable,
        new FormControl('', Validators.required));
    });
  }

  confirm(): void {
    if (!this.chargeControl.value) {
      return;
    }
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
        const control = this.variableControls.get(vcName);
        if (control) {
          selected.variables?.push({
            variable: vcName,
            quantity: control.value
          });
        }
      });
    const result: NewChargeModalOutput = {
      selected,
      comment: this.commentControl.value
    };
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
  comment: string
};
