import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';

@Component({
  selector: 'app-fal-adjust-weight-modal',
  templateUrl: './fal-adjust-weight-modal.component.html',
  styleUrls: ['./fal-adjust-weight-modal.component.scss']
})
export class FalAdjustWeightModalComponent implements OnInit {

  form: UntypedFormGroup;

  @Output() confirmAction: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: WeightAdjustmentModalInput, private dialogRef: MatDialogRef<FalAdjustWeightModalComponent>) {
    this.form = new UntypedFormGroup({
      currentWeight: new UntypedFormControl(data.currentWeight),
      adjustedWeight: new UntypedFormControl(0.0)
    });
  }

  ngOnInit(): void {
  }

  async confirm(): Promise<void>  {
    this.dialogRef.close({
      adjustedWeight: this.form.get('adjustedWeight')?.value
    });
  }

}

export type WeightAdjustmentModalInput = {
  currentWeight: number
};


/**
 * Output type returned from the modal.
 */
export type WeightAdjustmentModalOutput = {
  adjustedWeight: number
};
