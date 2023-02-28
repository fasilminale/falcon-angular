import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
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

  public readonly newStatusControl = new FormControl('', Validators.required);
  public readonly reasonControl: FormControl = new FormControl('');
  public readonly form = new FormGroup({
    newStatus: this.newStatusControl,
    reason: this.reasonControl
  });

  public readonly subscriptions = new Subscription();
  public falconInvoiceNumber = '';
  public newStatus: string =  '';
  public currentStatus: string = '';

  public allowStatuses: Array<any> = [];

  constructor(@Inject(MAT_DIALOG_DATA) private data: EditStatusModalInput,
              private dialogRef: MatDialogRef<FalEditStatusModalComponent>,
              private invoiceService: InvoiceService) {

    // make sure all subscriptions are closed after the modal closes
    this.subscriptions.add(this.dialogRef.afterClosed()
      .subscribe(() => this.subscriptions.unsubscribe())
    );

    this.subscriptions.add(this.newStatusControl.valueChanges.subscribe(
      value => (this.newStatus = value)
    ));

    this.invoiceService.getAllowedStatuses(this.data.falconInvoiceNumber).subscribe(
      i => {this.allowStatuses = i}
    );

    this.invoiceService.getInvoice(this.data.falconInvoiceNumber).subscribe(
      i => {this.currentStatus = i.status.label}
    );

    this.form.addControl('reason', this.reasonControl);
    this.reasonControl.setValidators([Validators.required]);
  }

  /**
   * Convenience accessor for cost breakdown option data.
   * Defaults to an empty array if not provided.
   */
  get allowedStatusesOptions(): Array<any> {
    return this.allowStatuses ?? [];
  }

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
    return 'Update Status'
  }

  /**
   * Text for the cancel button.
   * Defaults to 'Cancel'.
   */
  get cancelButtonText(): string {
    return 'Cancel';
  }

  onConfirmButtonClick(): void {
    let output: EditStatusModalOutput;
    this.updateInvoice().subscribe(
      data=> {
        this.close(output);
      }
    );
  }

  /**
   * Wrapper around the dialogRef.close() method to enforce type.
   */
  close(result: EditStatusModalOutput): void {
    this.dialogRef.close(result);
  }

  updateInvoice(): Observable<InvoiceDataModel> {
    const returnedInvoice = this.invoiceService.updateInvoiceStatus( this.data.falconInvoiceNumber,
      {status: this.newStatus, reason: this.reasonControl?.value});

    return returnedInvoice;
  }
}

/**
 * Input type required to create the modal.
 */
export type EditStatusModalInput = {
  falconInvoiceNumber: string,
  allowedStatusesOptions?: Array<SelectOption<CalcDetail>>
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
};
