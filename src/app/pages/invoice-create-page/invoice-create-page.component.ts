import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {environment} from '../../../environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {FalConfirmationModalComponent} from '../../components/fal-confirmation-modal/fal-confirmation-modal.component';

@Component({
  selector: 'app-invoice-create-page',
  templateUrl: './invoice-create-page.component.html',
  styleUrls: ['./invoice-create-page.component.scss']
})
export class InvoiceCreatePageComponent implements OnInit {

  public milestonesTabOpen = false;

  // TODO: Placeholder milestones is temporary for FAL-104 until individual invoices can be viewed
  public milestones: Array<any> = [
    {
      status: {
        label: 'Invoice Created',
        key: 'CREATED'
      },
      timestamp: Date.now(),
      user: 'Falcon System'
    },
    {
      status: {
        label: 'Invoice Created',
        key: 'CREATED'
      },
      timestamp: Date.now(),
      user: 'Falcon System'
    }
  ];

  get lineItemsFormArray(): FormArray {
    return this.invoiceFormGroup.get('lineItems') as FormArray;
  }

  get amountOfInvoiceFormControl(): FormControl {
    return this.invoiceFormGroup.get('amountOfInvoice') as FormControl;
  }

  public constructor(private webService: WebServices,
                     private snackBar: MatSnackBar,
                     private dialog: MatDialog) {
    const {required} = Validators;
    this.invoiceFormGroup = new FormGroup({
      workType: new FormControl(null, [required]),
      companyCode: new FormControl(null, [required]),
      erpType: new FormControl(null, [required]),
      vendorNumber: new FormControl(null, [required]),
      externalInvoiceNumber: new FormControl(null, [required]),
      invoiceDate: new FormControl(null, [required]),
      amountOfInvoice: new FormControl(null, [required]),
      currency: new FormControl(null, [required]),
      lineItems: new FormArray([])
    });
  }

  public workTypeOptions = ['Indirect Non-PO Invoice'];
  public erpTypeOptions = ['Pharma Corp', 'TPM'];
  public currencyOptions = ['CAD', 'USD'];
  public lineItemRemoveButtonDisable = true;
  public invoiceFormGroup: FormGroup;

  private static createEmptyLineItemForm(): FormGroup {
    return new FormGroup({
      glAccount: new FormControl(null, [Validators.required]),
      costCenter: new FormControl(null, [Validators.required]),
      companyCode: new FormControl(null, [Validators.required]),
      lineItemNetAmount: new FormControl(null, [Validators.required]),
      notes: new FormControl(null)
    });
  }

  public lineItemNetAmountFormControl(index: number): FormControl {
    const lineItemFormGroup = this.lineItemsFormArray.at(index) as FormGroup;
    return lineItemFormGroup.get('lineItemNetAmount') as FormControl;
  }

  public ngOnInit(): void {
    this.resetForm();
  }

  public resetForm(): void {
    this.invoiceFormGroup.reset();
    this.lineItemsFormArray.clear();
    this.addNewEmptyLineItem();
    // default work type as long as there is only one value
    if (this.workTypeOptions.length === 1) {
      this.invoiceFormGroup.controls.workType.setValue(this.workTypeOptions[0]);
    }
  }

  public addNewEmptyLineItem(): void {
    this.lineItemsFormArray.push(InvoiceCreatePageComponent.createEmptyLineItemForm());
    if (this.lineItemsFormArray.length > 1) {
      this.lineItemRemoveButtonDisable = false;
    }
  }

  public removeLineItem(index: number): void {
    this.lineItemsFormArray.removeAt(index);
    if (this.lineItemsFormArray.length <= 1) {
      this.lineItemRemoveButtonDisable = true;
    }
  }

  public onCancel(): void {
    this.dialog.open(FalConfirmationModalComponent,
      {
        autoFocus: false,
        data: {
          title: 'Cancel',
          html: `<p>
                    You will lose all entered information if you cancel creation of this invoice now.
                 </p>
                 <p>
                    <strong>Are you sure you want to cancel creation of this invoice?</strong>
                 </p>`,
          denyText: 'No, go back',
          confirmText: 'Yes, cancel'
        }
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.resetForm();
        }
      });
  }

  public toggleMilestones(): void {
    this.milestonesTabOpen = !this.milestonesTabOpen;
  }

  public onSubmit(): void {
    const invoice = this.invoiceFormGroup.getRawValue() as InvoiceDataModel;
    invoice.createdBy = 'Falcon User';
    this.webService.httpPost(
      `${environment.baseServiceUrl}/v1/invoice`,
      invoice
    ).subscribe((res: any) => {
        this.milestones = res.milestones;
        this.openSnackBar('Success, invoice created!');
      },
      () => this.openSnackBar('Failure, invoice was not created!')
    );
  }

  public openSnackBar(message: string): void {
    this.snackBar.open(message, 'close', {duration: 5 * 1000});
  }

}
