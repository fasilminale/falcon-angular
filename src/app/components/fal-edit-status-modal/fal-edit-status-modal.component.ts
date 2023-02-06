import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {buttonStyle} from '@elm/elm-styleguide-ui';
import {Observable, Subscription} from 'rxjs';
import {CalcDetail, CalcDetailVariable} from '../../models/rate-engine/rate-engine-request';
import {SelectOption} from '../../models/select-option-model/select-option-model';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {InvoiceService} from '../../services/invoice-service';

@Component({
  selector: 'app-fal-edit-status-modal',
  templateUrl: './fal-edit-status-modal.component.html',
  styleUrls: ['./fal-edit-status-modal.component.scss']
})
export class FalEditStatusModalComponent {

  public readonly statusControl = new FormControl('', Validators.required);
  public readonly reasonControl: FormControl = new FormControl('');
  public readonly subscriptions = new Subscription();
  public falconInvoiceNumber = '';

  constructor(@Inject(MAT_DIALOG_DATA) private data: EditStatusModalInput,
              private dialogRef: MatDialogRef<FalEditStatusModalComponent>,
              private invoiceService: InvoiceService) {

    // make sure all subscriptions are closed after the modal closes
    this.subscriptions.add(this.dialogRef.afterClosed()
      .subscribe(() => this.subscriptions.unsubscribe())
    );

    this.form.addControl('reason', this.reasonControl);
  }

  public readonly form = new FormGroup({
    status: this.statusControl
  });
  /**
   * The title text for the modal.
   * Has sensible defaults.
   */
  get title(): string {
    return 'Edit Status'
  }

  /**
   * A subtitle message for the modal.
   * Defaults to display nothing.
   */
  get innerHtmlMessage(): string {
    return  '';
  }

  /**
   * Style setting for the confirmation button.
   * Defaults to primary style.
   */
  get confirmButtonStyle(): buttonStyle {
    return 'primary';
  }

  /**
   * Text for the confirmation button.
   * Has sensible defaults.
   */
  get confirmButtonText(): string {
    return 'Update Status.'
  }

  /**
   * Text for the cancel button.
   * Defaults to 'Close'.
   */
  get cancelButtonText(): string {
    return 'Close';
  }

  onConfirmButtonClick(): void {
    let output: EditStatusModalOutput;

    this.updateInvoice();

    this.close(output);
  }

  /**
   * Wrapper around the dialogRef.close() method to enforce type.
   */
  close(result: EditStatusModalOutput): void {
    this.dialogRef.close(result);
  }

  updateInvoice(): Observable<InvoiceDataModel> {

    const returnedInvoice = this.invoiceService.updateInvoiceStatus('ERROR', this.data.falconInvoiceNumber);

    return returnedInvoice;
  }
}

/**
 * Input type required to create the modal.
 */
export type EditStatusModalInput = {
 falconInvoiceNumber: string
};

/**
 * Output type returned from the modal.
 */
export type EditStatusModalOutput = undefined | {
  charge?: string,
  uid: string,
  variables: Array<CalcDetailVariable>,
  selected?: CalcDetail,
  comment?: string,
  file?: File
};

/**
 * Output type used for helper services working with the Add New Charge scenario.
 */
export type NewStatusModalOutput = undefined | {
  selected: CalcDetail,
  uid: string,
  comment?: string,
  file?: File
};
