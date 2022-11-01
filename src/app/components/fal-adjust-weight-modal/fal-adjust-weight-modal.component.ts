import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';

@Component({
  selector: 'app-fal-adjust-weight-modal',
  templateUrl: './fal-adjust-weight-modal.component.html',
  styleUrls: ['./fal-adjust-weight-modal.component.scss']
})
export class FalAdjustWeightModalComponent implements OnInit {

  form: FormGroup;

  @Output() confirmAction: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: WeightAdjustmentModalInput, private dialogRef: MatDialogRef<FalAdjustWeightModalComponent>) {
    this.form = new FormGroup({
      currentWeight: new FormControl(data.currentWeight),
      adjustedWeight: new FormControl(0.0)
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
