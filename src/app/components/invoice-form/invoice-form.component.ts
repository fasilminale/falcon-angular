import {Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {FalFileInputComponent} from '../fal-file-input/fal-file-input.component';
import {environment} from '../../../environments/environment';
import {filter} from 'rxjs/operators';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {LoadingService} from '../../services/loading-service';
import {ApiService} from '../../services/api-service';
import {UtilService} from '../../services/util-service';

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
export class InvoiceFormComponent implements OnInit, OnChanges {

  /* STATIC FIELDS*/


  /* FIELDS */

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

  /* CONSTRUCTORS */

  public constructor(private webService: WebServices,
                     private route: ActivatedRoute,
                     private loadingService: LoadingService,
                     private api: ApiService,
                     private util: UtilService) {
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

  /* PROPERTY FUNCTIONS */

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

  get isOnEditPage(): boolean {
    return !!this.falconInvoiceNumber;
  }

  /* STATIC FUNCTIONS */

  private static createEmptyLineItemForm(): FormGroup {
    return new FormGroup({
      glAccount: new FormControl(null, [Validators.required]),
      costCenter: new FormControl(null, [Validators.required]),
      companyCode: new FormControl(null),
      lineItemNetAmount: new FormControl('0', [Validators.required]),
      notes: new FormControl(null)
    });
  }

  /* METHODS */

  public ngOnInit(): void {
    this.getInvoiceId();
    if (this.falconInvoiceNumber) {
      this.loadData();
    } else {
      this.resetForm();
    }
  }

  public ngOnChanges(change: SimpleChanges): void {
    const readOnlyChange: SimpleChange = change.readOnly;
    if (readOnlyChange.currentValue === false) {
      this.enableFormFields();
    }
  }

  public getInvoiceId(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
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
    // set default currency to USD
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
    if (this.freeTextRegex.test(char)) {
      return true;
    } else {
      event.preventDefault();
      return false;
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

  public onCancel(): void {
    this.util.openConfirmationModal({
      title: 'Cancel',
      innerHtmlMessage: `You will lose all entered information if you cancel creation of this invoice now.
                 <br/><br/><strong>Are you sure you want to cancel creation of this invoice?</strong>`,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No, go back'
    })
      .pipe(filter(result => result === 'confirm'))
      .subscribe(() => this.resetForm());
  }

  public async onSubmit(): Promise<void> {
    this.loadingService.showLoading();
    try {
      if (this.validateInvoiceAmount()) {
        // IS VALID
        const invoice = this.invoiceFormGroup.getRawValue();
        const isDuplicate = await this.api.checkInvoiceIsDuplicate(invoice).toPromise();
        if (isDuplicate) {
          // IS DUPLICATE
          this.onInvoiceIsDuplicate();
        } else {
          // IS NOT DUPLICATE
          this.processInvoice(invoice);
          let shouldReset = false;
          const savedInvoice = await this.api.saveInvoice(invoice).toPromise();
          if (savedInvoice.falconInvoiceNumber) {
            // INVOICE SAVED
            shouldReset = true;
            this.onSaveSuccess(savedInvoice.falconInvoiceNumber);
            if (!this.isOnEditPage) {
              // NOT ON EDIT PAGE
              const attachedDocuments = await this.api.saveAllAttachments(
                savedInvoice.falconInvoiceNumber,
                this.attachments
              ).toPromise();
              if (attachedDocuments.length === this.attachments.length) {
                // ATTACH SUCCESS
                this.onAttachSuccess(savedInvoice.falconInvoiceNumber);
              } else {
                // ATTACH FAILURE
                shouldReset = false;
                this.onAttachFailure();
              }
            }
          } else {
            // INVOICE NOT SAVED
            this.onSaveFailure();
          }
          if (shouldReset) {
            // RESET FORM
            this.resetForm();
          }
        }
      } else {
        this.onInvoiceInvalidated();
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  public validateInvoiceAmount(): boolean {
    let sum = 0;
    const invoiceAmount = this.util
      .toNumber(this.amountOfInvoiceFormControl.value)
      .toFixed(2);
    for (let i = 0; i < this.lineItemsFormArray.controls.length; i++) {
      const lineItem = this.lineItemsFormArray.at(i) as FormGroup;
      const lineItemAmount = lineItem.get('lineItemNetAmount') as FormControl;
      sum += this.util.toNumber(lineItemAmount.value);
    }
    this.validAmount = sum.toFixed(2) === invoiceAmount;
    return this.validAmount;
  }

  public onInvoiceInvalidated(): void {
    this.util.openErrorModal({
      title: 'Invalid Amount(s)',
      innerHtmlMessage: `Total of Line Net Amount(s) must equal Invoice Net Amount.`
    });
  }

  private onInvoiceIsDuplicate(): void {
    this.util.openErrorModal({
      title: 'Duplicate Invoice',
      innerHtmlMessage: `An invoice with the same vendor number, external invoice number, invoice date, and company code already exists.
            <br/><br/><strong>Please update these fields and try again.</strong>`
    });
  }

  private processInvoice(invoice: any): void {
    if (this.isOnEditPage) {
      invoice.falconInvoiceNumber = this.falconInvoiceNumber;
    }
    invoice.createdBy = 'Falcon User';
    /* TODO: Ensuring invoice amount values are valid when sent to the API.
     *  Will address the dependency around this in a different card.
     */
    invoice.amountOfInvoice = this.util.toNumber(invoice.amountOfInvoice);
    invoice.lineItems.forEach((lineItem: any) => {
      if (!lineItem.companyCode) {
        lineItem.companyCode = invoice.companyCode;
      }
      lineItem.lineItemNetAmount = this.util.toNumber(lineItem.lineItemNetAmount);
    });
  }

  private onSaveSuccess(invoiceNumber: string): void {
    this.util.openSnackBar(`Success! Falcon Invoice ${invoiceNumber} has been ${this.isOnEditPage ? 'updated' : 'created'}.`);
  }

  private onSaveFailure(): void {
    this.util.openSnackBar(`Failure, invoice was not ${this.isOnEditPage ? 'updated' : 'created'}!`);
  }

  private onAttachSuccess(invoiceNumber: string): void {
    this.util.openSnackBar(`All documents were successfully attached to Falcon Invoice ${invoiceNumber}.`);
  }

  private onAttachFailure(): void {
    this.util.openSnackBar(`One or more documents failed to attach!`);
  }

  public addAttachment(): void {
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

  public removeAttachment(index: number): void {
    this.util.openConfirmationModal({
      title: 'Remove Attachment',
      innerHtmlMessage: `Are you sure you want to remove this attachment?
            <br/><br/><strong>This action cannot be undone.</strong>`,
      confirmButtonText: 'Remove Attachment',
      cancelButtonText: 'Cancel'
    })
      .pipe(filter(result => result === 'confirm'))
      .subscribe(() => this.attachments.splice(index, 1));
  }

  public toggleSidenav(): void {
    this.toggleMilestones.emit();
  }

  private enableFormFields(): void {
    this.invoiceFormGroup.controls.workType.enable();
    this.invoiceFormGroup.controls.companyCode.enable();
    this.invoiceFormGroup.controls.erpType.enable();
    this.invoiceFormGroup.controls.vendorNumber.enable();
    this.invoiceFormGroup.controls.externalInvoiceNumber.enable();
    this.invoiceFormGroup.controls.invoiceDate.disable();
    this.invoiceFormGroup.controls.amountOfInvoice.enable();
    this.invoiceFormGroup.controls.currency.enable();
    this.invoiceFormGroup.controls.lineItems.enable();
    this.attachmentFormGroup.controls.attachmentType.enable();
  }

}
