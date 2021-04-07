import {Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {FalFileInputComponent} from '../fal-file-input/fal-file-input.component';
import {InvoiceErrorModalComponent} from '../invoice-error-modal/invoice-error-modal';
import {FalConfirmationModalComponent} from '../fal-confirmation-modal/fal-confirmation-modal.component';
import {environment} from '../../../environments/environment';
import {mergeMap} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingService} from '../../services/loading-service';

interface Attachment {
  file: File;
  type: string;
  uploadError: boolean;
}

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InvoiceFormComponent),
      multi: true
    },
  ]
})
export class InvoiceFormComponent implements OnInit {

  public constructor(private webService: WebServices,
                     private snackBar: MatSnackBar,
                     private route: ActivatedRoute,
                     private dialog: MatDialog,
                     private router: Router,
                     private loadingService: LoadingService) {
    const {required} = Validators;
    this.invoiceFormGroup = new FormGroup({
      workType: new FormControl({value: null, disabled: this.readOnly}, [required]),
      companyCode: new FormControl({value: null, disabled: this.readOnly}, [required]),
      erpType: new FormControl({value: null, disabled: this.readOnly}, [required]),
      vendorNumber: new FormControl({value: null, disabled: this.readOnly}, [required]),
      externalInvoiceNumber: new FormControl({value: null, disabled: this.readOnly}, [required]),
      invoiceDate: new FormControl({value: null, disabled: this.readOnly}, [required]),
      amountOfInvoice: new FormControl({value: '0', disabled: this.readOnly}, [required]),
      currency: new FormControl({value: null, disabled: this.readOnly}, [required]),
      lineItems: new FormArray([])
    });

    this.attachmentFormGroup = new FormGroup({
      attachmentType: new FormControl({value: null, disabled: this.readOnly}, [required]),
      file: new FormControl({value: null, disabled: this.readOnly}, [required])
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

  get currency(): AbstractControl {
    return this.invoiceFormGroup.controls.currency;
  }

  get lineItemsFormArray(): FormArray {
    return this.invoiceFormGroup.get('lineItems') as FormArray;
  }

  get amountOfInvoiceFormControl(): FormControl {
    return this.invoiceFormGroup.get('amountOfInvoice') as FormControl;
  }

  public readonly regex = /[a-zA-Z0-9_\\-]/;
  public readonly freeTextRegex = /[\w\-\s]/;
  public workTypeOptions = ['Indirect Non-PO Invoice'];
  public erpTypeOptions = ['Pharma Corp', 'TPM'];
  public currencyOptions = ['USD', 'CAD'];
  public lineItemRemoveButtonDisable = true;
  public invoiceFormGroup: FormGroup;
  public attachmentFormGroup: FormGroup;
  public validAmount = true;
  public file = null;
  public attachmentTypeOptions = ['External Invoice', 'Supporting Documentation', 'Operational Approval'];
  public attachments: Array<Attachment> = [];
  private invoice = new InvoiceDataModel();
  @ViewChild(FalFileInputComponent) fileChooserInput?: FalFileInputComponent;
  @Input() enableMilestones = false;
  @Input() readOnly = false;
  @Input() falconInvoiceNumber = '';
  @Output() updateMilestones: EventEmitter<any> = new EventEmitter<any>();
  @Output() toggleMilestones: EventEmitter<any> = new EventEmitter<any>();

  private static createEmptyLineItemForm(): FormGroup {
    return new FormGroup({
      glAccount: new FormControl(null, [Validators.required]),
      costCenter: new FormControl(null, [Validators.required]),
      companyCode: new FormControl(null),
      lineItemNetAmount: new FormControl('0', [Validators.required]),
      notes: new FormControl(null)
    });
  }

  public ngOnInit(): void {
    this.getInvoiceId();
    if (this.falconInvoiceNumber) {
      this.loadData();
    } else {
      this.resetForm();
    }
  }

  public getInvoiceId(): void {
    this.route.paramMap.subscribe(params => {
      const falconInvoiceNumber = params.get('falconInvoiceNumber');
      falconInvoiceNumber ? this.falconInvoiceNumber = falconInvoiceNumber : this.falconInvoiceNumber = '';
    });
  }

  public loadData(): void {
    this.loadingService.showLoading();
    this.webService.httpGet(`${environment.baseServiceUrl}/v1/invoice/${this.falconInvoiceNumber}`)
      .subscribe((invoice: any) => {
        this.invoice = new InvoiceDataModel(invoice);
        this.invoiceFormGroup.controls.workType.setValue(invoice.workType);
        this.invoiceFormGroup.controls.companyCode.setValue(invoice.companyCode);
        this.invoiceFormGroup.controls.erpType.setValue(invoice.erpType);
        this.invoiceFormGroup.controls.vendorNumber.setValue(invoice.vendorNumber);
        this.invoiceFormGroup.controls.externalInvoiceNumber.setValue(invoice.externalInvoiceNumber);
        this.invoiceFormGroup.controls.invoiceDate.setValue(new Date(invoice.invoiceDate));
        this.invoiceFormGroup.controls.amountOfInvoice.setValue(invoice.amountOfInvoice);
        this.invoiceFormGroup.controls.currency.setValue(invoice.currency);

        this.invoiceFormGroup.disable();

        // Line Items
        for (const lineItem of invoice.lineItems) {
          this.lineItemsFormArray.push(new FormGroup({
            glAccount: new FormControl({value: lineItem.glAccount, disabled: this.readOnly}, [Validators.required]),
            costCenter: new FormControl({value: lineItem.costCenter, disabled: this.readOnly}, [Validators.required]),
            companyCode: new FormControl({value: lineItem.companyCode, disabled: this.readOnly}),
            lineItemNetAmount: new FormControl({value: lineItem.lineItemNetAmount, disabled: this.readOnly}, [Validators.required]),
            notes: new FormControl({value: lineItem.notes, disabled: this.readOnly})
          }));
        }

        // Attachments
        for (const attachment of invoice.attachments) {
          console.log(attachment.fileName);
          this.attachments.push({
            file: new File([], attachment.fileName),
            type: attachment.type,
            uploadError: false
          });
        }
        this.attachmentFormGroup.disable();

        this.updateMilestones.emit(invoice.milestones);
        this.loadingService.hideLoading();
      });
  }

  public resetForm(): void {
    this.invoiceFormGroup.reset();
    this.lineItemsFormArray.clear();
    this.attachments = [];
    this.addNewEmptyLineItem();
    this.lineItemRemoveButtonDisable = true;
    //set default currency to USD
    this.invoiceFormGroup.controls.currency.setValue(this.currencyOptions[0]);
    // default work type as long as there is only one value
    if (this.workTypeOptions.length === 1) {
      this.invoiceFormGroup.controls.workType.setValue(this.workTypeOptions[0]);
    }
    this.invoiceFormGroup.controls.companyCode.setValue('');
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

  public validateFreeTextRegex(event: any): boolean {
    const char = String.fromCharCode(event.keyCode);
    console.log(char);
    console.log(event.keyCode);

    if (this.freeTextRegex.test(char)) {
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

  public lineItemCostCenter(index: number): AbstractControl {
    const lineItemFormGroup = this.lineItemsFormArray.at(index) as FormGroup;
    return lineItemFormGroup.controls.costCenter;
  }

  public lineItemGlAccount(index: number): AbstractControl {
    const lineItemFormGroup = this.lineItemsFormArray.at(index) as FormGroup;
    return lineItemFormGroup.controls.glAccount;
  }

  public addNewEmptyLineItem(): void {
    this.lineItemsFormArray.push(InvoiceFormComponent.createEmptyLineItemForm());
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
    this.dialog.open(InvoiceErrorModalComponent,
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

  public displayDuplicateInvoiceError(): void {
    this.dialog.open(InvoiceErrorModalComponent,
      {
        autoFocus: false,
        data: {
          title: 'Duplicate Invoice',
          html: `<p>
                    An invoice with the same vendor number, external invoice number, invoice date, and company code already exists.
                 </p>
                 <br/>
                 <b>
                    Please update these fields and try again.
                 </b>`,
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

  public onSubmit(): void {
    this.validateInvoiceAmount();
    if (this.validAmount) {
      const invoice = this.invoiceFormGroup.getRawValue() as any;

      this.webService.httpPost(
        `${environment.baseServiceUrl}/v1/invoice/is-valid`,
        {
          companyCode: invoice.companyCode,
          vendorNumber: invoice.vendorNumber,
          externalInvoiceNumber: invoice.externalInvoiceNumber,
          invoiceDate: invoice.invoiceDate
        }
      ).subscribe(() => {
          this.displayDuplicateInvoiceError();
        },
        () => {
          invoice.createdBy = 'Falcon User';

          // TODO: Ensuring invoice amount values are valid when sent to the API. Will address the dependency around this in a different card.
          invoice.amountOfInvoice = Number(invoice.amountOfInvoice.replace(',', ''));
          invoice.lineItems.forEach((lineItem: any) => {
            if (!lineItem.companyCode) {
              lineItem.companyCode = invoice.companyCode;
            }
            lineItem.lineItemNetAmount = Number(lineItem.lineItemNetAmount.replace(',', ''));
          });

          let invoiceNumber: any;
          this.webService.httpPost(
            `${environment.baseServiceUrl}/v1/invoice`,
            invoice
          ).pipe(
            mergeMap((result: any, index: number) => {
              invoiceNumber = result.falconInvoiceNumber;
              if (this.attachments.length > 0) {

                const attachmentCalls: Array<any> = [];
                for (const attachment of this.attachments) {
                  const formData = new FormData();
                  formData.append('file', attachment.file, attachment.file.name);
                  formData.append('attachmentType', attachment.type);
                  formData.append('fileName', attachment.file.name);

                  const attachmentCall = this.webService.httpPost(
                    `${environment.baseServiceUrl}/v1/attachment/${invoiceNumber}`,
                    formData
                  );
                  attachmentCalls.push(attachmentCall);
                }
                return forkJoin(attachmentCalls);
              }

              return of({});
            })
          ).subscribe(res => {
              this.resetForm();
              // @ts-ignore
              this.openSnackBar(`Success! Falcon Invoice ${invoiceNumber} has been created.`);
            },
            () => this.openSnackBar('Failure, invoice was not created!')
          );
        });
    }
  }

  public openSnackBar(message: string): void {
    this.snackBar.open(message, 'close', {duration: 5 * 1000});
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
      const fileChooserInput = this.fileChooserInput;
      if (fileChooserInput) {
        fileChooserInput.reset();
      }
    }
  }

  removeAttachment(index: number): void {
    this.dialog.open(FalConfirmationModalComponent,
      {
        autoFocus: false,
        data: {
          title: 'Remove Attachment',
          html: `<p>
                    Are you sure you want to remove this attachment?
                 </p>
                 <p>
                    <strong>This action cannot be undone</strong>
                 </p>`,
          denyText: 'Cancel',
          confirmText: 'Remove Attachment'
        }
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.attachments.splice(index, 1);
        }
      });
  }

  public toggleSidenav(): void {
    this.toggleMilestones.emit();
  }
}
