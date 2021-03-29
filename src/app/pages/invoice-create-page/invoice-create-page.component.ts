import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {environment} from '../../../environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {FalConfirmationModalComponent} from '../../components/fal-confirmation-modal/fal-confirmation-modal.component';
import {InvoiceAmountErrorModalComponent} from '../../components/invoice-amount-error-modal/invoice-amount-error-modal';
import {HttpClient} from '@angular/common/http';
import {FalFileInputComponent} from '../../components/fal-file-input/fal-file-input.component';
import {map, mergeMap} from 'rxjs/operators';
import { forkJoin } from 'rxjs';

interface Attachment {
  file: File;
  type: string;
  uploadError: boolean;
}

@Component({
  selector: 'app-invoice-create-page',
  templateUrl: './invoice-create-page.component.html',
  styleUrls: ['./invoice-create-page.component.scss']
})
export class InvoiceCreatePageComponent implements OnInit {

  public readonly regex = /[a-zA-Z0-9_\\-]/;
  public milestonesTabOpen = false;
  public attachments: Array<Attachment> = [];

  @ViewChild(FalFileInputComponent) fileChooserInput?: FalFileInputComponent;

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
      amountOfInvoice: new FormControl('0', [required]),
      currency: new FormControl(null, [required]),
      lineItems: new FormArray([])
    });

    this.attachmentFormGroup = new FormGroup({
      attachmentType: new FormControl(null, [required]),
      file: new FormControl(null, [required])
    });
  }

  get erpType(): AbstractControl {
    return this.invoiceFormGroup.controls.erpType;
  }

  get workType(): AbstractControl {
    return this.invoiceFormGroup.controls.workType;
  }

  get companyCode(): AbstractControl {
    return this.invoiceFormGroup.controls.companyCode;
  }

  get externalInvoiceNumber(): AbstractControl {
    return this.invoiceFormGroup.controls.externalInvoiceNumber;
  }

  get vendorNumber(): AbstractControl {
    return this.invoiceFormGroup.controls.vendorNumber;
  }

  get invoiceDate(): AbstractControl {
    return this.invoiceFormGroup.controls.invoiceDate;
  }

  get amountOfInvoice(): AbstractControl {
    return this.invoiceFormGroup.controls.amountOfInvoice;
  }

  get currency(): AbstractControl {
    return this.invoiceFormGroup.controls.currency;
  }

  public workTypeOptions = ['Indirect Non-PO Invoice'];
  public erpTypeOptions = ['Pharma Corp', 'TPM'];
  public currencyOptions = ['CAD', 'USD'];
  public lineItemRemoveButtonDisable = true;
  public invoiceFormGroup: FormGroup;
  public attachmentFormGroup: FormGroup;
  public validAmount = true;
  public file = null;
  public attachmentTypeOptions = ['EML', 'DOC', 'JPG', 'PDF', 'XLSX'];

  private static createEmptyLineItemForm(): FormGroup {
    return new FormGroup({
      glAccount: new FormControl(null, [Validators.required]),
      costCenter: new FormControl(null, [Validators.required]),
      companyCode: new FormControl(null),
      lineItemNetAmount: new FormControl('0', [Validators.required]),
      notes: new FormControl(null)
    });
  }

  public validateRegex(event: any): boolean {
    const char = String.fromCharCode(event.keyCode);

    if (this.regex.test(char)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  public validateInvoiceAmount(): void {
    let sum = 0;
    const invoiceAmount = Number(this.amountOfInvoiceFormControl.value.replace(',', '')).toFixed(2);
    for (let i = 0; i < this.lineItemsFormArray.controls.length; i++) {
      const lineItem = this.lineItemsFormArray.at(i) as FormGroup;
      const lineItemAmount = lineItem.get('lineItemNetAmount') as FormControl;
      sum += Number(lineItemAmount.value.replace(',', ''));
    }
    this.validAmount = sum.toFixed(2) === invoiceAmount;
    if (!this.validAmount) {
      this.displayInvalidAmountError();
    }
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
    this.invoiceFormGroup.controls.companyCode.setValue('');
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

  public displayInvalidAmountError(): void {
    this.dialog.open(InvoiceAmountErrorModalComponent,
      {
        autoFocus: false,
        data: {
          title: 'Invalid Amount(s)',
          html: `<p>
                    Total of Line Net Amount(s) must equal Invoice Net Amount.
                 </p>`,
          closeText: 'Close',
        }
      })
      .afterClosed();
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
    this.validateInvoiceAmount();
    if (this.validAmount) {
      const invoice = this.invoiceFormGroup.getRawValue() as any;
      invoice.createdBy = 'Falcon User';

      // TODO: Ensuring invoice amount values are valid when sent to the API. Will address the dependency around this in a different card.
      invoice.amountOfInvoice = Number(invoice.amountOfInvoice.replace(',', ''));
      invoice.lineItems.forEach((lineItem: any) => {
        if (!lineItem.companyCode) {
          lineItem.companyCode = invoice.companyCode;
        }
        lineItem.lineItemNetAmount = Number(lineItem.lineItemNetAmount.replace(',', ''));
      });

      this.webService.httpPost(
        `${environment.baseServiceUrl}/v1/invoice`,
        invoice
      ).pipe(
        map((res:any)  => {
          return res.falconInvoiceNumber;
        }),
        mergeMap((invoiceNumber:any, index:number) => {

          const attachmentCalls: Array<any> = [];
          for (const attachment of this.attachments) {
            const formData = new FormData();
            formData.append('file', attachment.file, attachment.file.name);
            formData.append('attachmentType', attachment.type);
            formData.append('fileName', attachment.file.name);

            const atttachmentCall = this.webService.httpPost(
              `${environment.baseServiceUrl}/v1/attachment/${invoiceNumber}`,
              formData
            )
            attachmentCalls.push(atttachmentCall);
          }
          return forkJoin(attachmentCalls);
        })

      ).subscribe(results => {
        for(const result of results){
          // @ts-ignore
          console.log(result[1]);
        }
        this.resetForm();
        this.openSnackBar(`Success! Falcon Invoice has been created.`);

      },
        () => this.openSnackBar('Failure, invoice was not created!')

      )


      /*this.webService.httpPost(
        `${environment.baseServiceUrl}/v1/invoice`,
        invoice
      ).subscribe((res: any) => {
          this.milestones = res.milestones;
          const falconInvoiceId = res.falconInvoiceNumber;
          this.uploadFiles(falconInvoiceId);
          this.resetForm();
          this.openSnackBar(`Success! Falcon Invoice ${res.falconInvoiceNumber} has been created.`);
          console.log('Invoice Created');
        },
        () => this.openSnackBar('Failure, invoice was not created!')
      );*/
    }
  }

  public openSnackBar(message: string): void {
    this.snackBar.open(message, 'close', {duration: 5 * 1000});
  }

  public uploadFiles(invoiceNumber: string): void {
    for (const attachment of this.attachments) {
      const formData = new FormData();
      formData.append('file', attachment.file, attachment.file.name);
      formData.append('attachmentType', attachment.type);
      formData.append('fileName', attachment.file.name);

      this.webService.httpPost(
        `${environment.baseServiceUrl}/v1/attachment/${invoiceNumber}`,
        formData
      ).subscribe((res: any) => {
          this.openSnackBar('Success, file was created!');
          console.log('File Created' + attachment.type);
        },
        () => {
          attachment.uploadError = true;
          this.openSnackBar('Failure, file was not created!');
        }
      );
    }

    // return this.http.post(this.baseApiUrl, formData);
  }

  addAttachment(): void {
    const attachmentFileValue = this.attachmentFormGroup.controls.file.value;
    const attachmentTypeValue = this.attachmentFormGroup.controls.attachmentType.value;
    if (attachmentFileValue && attachmentTypeValue) {
      this.attachments.push({
        uploadError: false,
        file: attachmentFileValue,
        type: attachmentTypeValue
      });
      this.attachmentFormGroup.reset();
      this.fileChooserInput?.reset();
    }
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }

}
