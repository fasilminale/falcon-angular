import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {buttonStyleOptions} from '@elm/elm-styleguide-ui';
import {SelectOption} from '../../models/select-option-model/select-option-model';
import {CalcDetail} from '../../models/rate-engine/rate-engine-request';
import {Subscription} from 'rxjs';
import {CostLineItem} from '../../models/line-item/line-item-model';
import {parse} from 'jasmine-spec-reporter/built/configuration-parser';

@Component({
  selector: 'app-fal-new-charge-modal',
  templateUrl: './fal-edit-charge-modal.component.html',
  styleUrls: ['./fal-edit-charge-modal.component.scss']
})
export class FalEditChargeModalComponent {

  public readonly form: FormGroup;
  public readonly chargeControl: FormControl = new FormControl({value: '', disabled: true});
  public readonly variableControls: FormGroup = new FormGroup({});
  private readonly subscriptions: Subscription = new Subscription();

  constructor(@Inject(MAT_DIALOG_DATA) public data: EditChargeModalInput,
              private dialogRef: MatDialogRef<FalEditChargeModalComponent>) {
    this.subscriptions.add(this.dialogRef.afterClosed().subscribe(() => this.subscriptions.unsubscribe()));
    data.costLineItem?.value?.variables.forEach((variable: any) => {
      this.variableControls.addControl(variable.variable,
        new FormControl(variable.quantity));
    });

    this.chargeControl.patchValue(data.costLineItem.value?.charge);
    this.form = new FormGroup({
      charge: this.chargeControl,
      variables: this.variableControls
    });
  }

  getVariableControlNames(): Array<string> {
    return Object.keys(this.variableControls.controls)
      .filter(vcName => this.variableControls.contains(vcName));
  }

  confirm(): void {
    let result: EditChargeModalOutput;
    if (this.chargeControl.value) {
      const variables: any = [];
      this.getVariableControlNames()
        .forEach(vcName => {
          const control = this.form.get('variables');
          if (control && control.get(vcName)?.value) {
            variables.push({
              variable: vcName,
              quantity: control.get(vcName)?.value
            });
          }
        });
      result = {
        charge: this.chargeControl.value,
        variables
      };
    }
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
  costLineItem: AbstractControl
};

/**
 * Output type returned from the modal.
 */
export type EditChargeModalOutput = undefined | {
  charge: string,
  variables: any
};
