import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {FalFileInputComponent} from '../fal-file-input/fal-file-input.component';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingService} from '../../services/loading-service';
import {TemplateService} from '../../services/template-service';
import {UtilService} from '../../services/util-service';
import {FalRadioOption} from '../fal-radio-input/fal-radio-input.component';
import {Subscription} from 'rxjs';
import {UploadFormComponent} from '../upload-form/upload-form.component';
import {Template, TemplateToSave} from '../../models/template/template-model';
import {InvoiceService} from '../../services/invoice-service';
import {AttachmentService} from '../../services/attachment-service';
import {Milestone} from '../../models/milestone/milestone-model';

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
export class InvoiceFormComponent implements OnInit, OnDestroy, OnChanges {

  /* PUBLIC FIELDS */
  public readonly regex = /[a-zA-Z0-9_\\-]/;
  public readonly freeTextRegex = /[\w\-\s]/;
  public workTypeOptions = ['Indirect Non-PO Invoice'];
  public erpTypeOptions = ['Pharma Corp', 'TPM'];
  public currencyOptions = ['USD', 'CAD'];
  public myTemplateOptions = ['TEST_1', 'TEST_2'];
  public paymentTermOptions: Array<FalRadioOption> = [
    {value: 'Z000', display: 'Pay Immediately'},
    {value: 'ZN14', display: 'Pay in 14 days'}
  ];
  public lineItemRemoveButtonDisable = true;
  public invoiceFormGroup: FormGroup;
  public osptFormGroup: FormGroup;
  public selectedTemplateFormControl: FormControl;
  public validAmount = true;
  public externalAttachment = false;
  public file = null;
  public totalLineItemNetAmount = 0;

  /* PRIVATE FIELDS */
  private invoice = new InvoiceDataModel();
  private subscriptions: Array<Subscription> = [];

  /* INPUTS */
  @Input() enableMilestones = false;
  @Input() readOnly = false;
  @Input() falconInvoiceNumber = '';

  /* OUTPUTS */
  @Output() updateMilestones: EventEmitter<Array<Milestone>> = new EventEmitter<Array<Milestone>>();
  @Output() toggleMilestones: EventEmitter<void> = new EventEmitter<void>();
  @Output() isDeletedInvoice: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isSubmittedInvoice: EventEmitter<boolean> = new EventEmitter<boolean>();

  /* CHILDREN */
  @ViewChild(FalFileInputComponent) fileChooserInput?: FalFileInputComponent;
  @ViewChild(UploadFormComponent) uploadFormComponent?: UploadFormComponent;

  /* CONSTRUCTORS */
  public constructor(private webService: WebServices,
                     private route: ActivatedRoute,
                     private loadingService: LoadingService,
                     private invoiceService: InvoiceService,
                     private attachmentService: AttachmentService,
                     private templateService: TemplateService,
                     private util: UtilService,
                     private router: Router) {
    const {required} = Validators;
    this.invoiceFormGroup = new FormGroup({
      workType: new FormControl({value: null, disabled: this.readOnly}, [required]),
      companyCode: new FormControl({value: null, disabled: this.readOnly}, [required]),
      erpType: new FormControl({value: null, disabled: this.readOnly}, [required]),
      vendorNumber: new FormControl({value: null, disabled: this.readOnly}, [required]),
      externalInvoiceNumber: new FormControl({value: null, disabled: this.readOnly}, [required]),
      invoiceDate: new FormControl({value: null, disabled: this.readOnly}, [required, this.validateDate]),
      amountOfInvoice: new FormControl({value: '0', disabled: this.readOnly}, [required]),
      currency: new FormControl({value: null, disabled: this.readOnly}, [required]),
      comments: new FormControl({value: null, disabled: this.readOnly}),
      lineItems: new FormArray([])
    });

    this.osptFormGroup = new FormGroup({
      isPaymentOverrideSelected: new FormControl({value: false, disabled: this.readOnly}),
      paymentTerms: new FormControl({value: null, disabled: this.readOnly})
    });

    this.selectedTemplateFormControl = new FormControl({
      value: null,
      disabled: (this.myTemplateOptions.length === 0)
    });

    this.subscriptions.push(
      this.osptFormGroup.controls.isPaymentOverrideSelected.valueChanges
        .subscribe(value => {
          if (!value) {
            this.osptFormGroup.controls.paymentTerms.reset();
          }
        })
    );
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

  get amountOfInvoiceFormControl(): AbstractControl {
    return this.invoiceFormGroup.controls.amountOfInvoice;
  }

  get lineItemsFormArray(): FormArray {
    return this.invoiceFormGroup.get('lineItems') as FormArray;
  }

  get isOnEditPage(): boolean {
    return !!this.falconInvoiceNumber;
  }

  get isFormPristine(): boolean {
    return this.invoiceFormGroup.pristine
      && this.osptFormGroup.pristine
      && (this.uploadFormComponent?.formGroup.pristine ?? true)
      && this.lineItemsFormArray.pristine;
  }

  get hasLatestMilestone(): boolean {
    return this.invoice?.milestones.length > 0;
  }

  get latestMilestone(): any | undefined {
    return this.hasLatestMilestone
      ? this.invoice.milestones[0]
      : undefined;
  }

  get hasLatestMilestoneComments(): boolean {
    return !!this.latestMilestone?.comments;
  }

  get latestMilestoneComments(): string {
    return this.latestMilestone?.comments ?? '';
  }

  get commentLabelPrefix(): string {
    return this.getCommentLabelPrefix(this.latestMilestone);
  }

  public getCommentLabelPrefix(milestone: Milestone): string {
    const status = milestone?.status;
    if (status?.key && status.key === 'SUBMITTED') {
      return 'Creator';
    }
    return 'General';
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
    this.initForm();
  }

  public initForm(): void {
    this.resetForm();
    if (this.falconInvoiceNumber) {
      this.loadData();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public ngOnChanges(change: SimpleChanges): void {
    if (change?.readOnly?.currentValue === false) {
      this.enableFormFields();
    }
    if (change?.falconInvoiceNumber) {
      this.initForm();
    }
  }

  public async loadTemplate(templateName: string): Promise<void> {
    if (!templateName) {
      return;
    }
    this.loadingService.showLoading('Loading Template');
    try {
      const template = await this.templateService.getTemplateByName(templateName).toPromise();
      if (template) {
        this.invoiceFormGroup.controls.workType.setValue(template.workType);
        this.invoiceFormGroup.controls.companyCode.setValue(template.companyCode);
        this.invoiceFormGroup.controls.erpType.setValue(template.erpType);
        this.invoiceFormGroup.controls.vendorNumber.setValue(template.vendorNumber);
        this.invoiceFormGroup.controls.currency.setValue(template.currency);
        this.lineItemsFormArray.clear();
        for (const lineItem of template.lineItems) {
          this.lineItemsFormArray.push(new FormGroup({
            glAccount: new FormControl({value: lineItem.glAccount, disabled: this.readOnly}, [Validators.required]),
            costCenter: new FormControl({value: lineItem.costCenter, disabled: this.readOnly}, [Validators.required]),
            companyCode: new FormControl({value: lineItem.companyCode, disabled: this.readOnly}),
            lineItemNetAmount: new FormControl({value: 0, disabled: this.readOnly}, [Validators.required]),
            notes: new FormControl({value: '', disabled: this.readOnly})
          }));
        }
        if (this.lineItemsFormArray.length === 0) {
          this.addNewEmptyLineItem();
        }
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  public loadData(): void {
    this.loadingService.showLoading('Loading');
    this.subscriptions.push(
      this.invoiceService.getInvoice(this.falconInvoiceNumber)
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
          this.invoiceFormGroup.controls.comments.setValue(invoice.comments);
          this.invoiceFormGroup.disable();

          this.osptFormGroup.controls.isPaymentOverrideSelected.setValue(!!invoice.standardPaymentTermsOverride);
          this.osptFormGroup.controls.paymentTerms.setValue(invoice.standardPaymentTermsOverride);
          this.osptFormGroup.disable();

          // Line Items
          this.lineItemsFormArray.clear();
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
          if (this.uploadFormComponent) {
            this.uploadFormComponent.load(invoice.attachments);
          }

          this.updateMilestones.emit(this.invoice.milestones.sort((a: any, b: any) => {
            return b.timestamp.localeCompare(a.timestamp);
          }));
          if (this.invoice.status.key === 'DELETED') {
            this.isDeletedInvoice.emit(true);
          }
          if (this.invoice.status.key === 'SUBMITTED') {
            this.isSubmittedInvoice.emit(true);
          }
          this.loadingService.hideLoading();
          this.calculateLineItemNetAmount();

          this.markFormAsPristine();
        })
    );
  }

  public resetForm(): void {
    this.resetTemplateOptions().finally();
    this.invoiceFormGroup.reset();
    this.osptFormGroup.reset();
    this.selectedTemplateFormControl.reset();
    this.lineItemsFormArray.clear();
    if (this.uploadFormComponent) {
      this.uploadFormComponent.reset();
    }
    this.addNewEmptyLineItem();
    this.lineItemRemoveButtonDisable = true;
    // set default currency to USD
    this.invoiceFormGroup.controls.currency.setValue(this.currencyOptions[0]);
    // default work type as long as there is only one value
    if (this.workTypeOptions.length === 1) {
      this.invoiceFormGroup.controls.workType.setValue(this.workTypeOptions[0]);
    }
    this.erpType.markAsPristine();
    this.invoiceDate.markAsPristine();
    this.invoiceFormGroup.controls.companyCode.setValue('');
    this.invoiceFormGroup.controls.amountOfInvoice.setValue('0');
    this.calculateLineItemNetAmount();
    this.markFormAsPristine();
    this.subscriptions.push(
      this.selectedTemplateFormControl.valueChanges
        .subscribe(v => this.loadTemplate(v))
    );
  }

  private async resetTemplateOptions(): Promise<void> {
    const newTemplateOptions: Array<string> = [];
    (await this.templateService.getTemplates().toPromise())
      .forEach((template: Template) => {
        newTemplateOptions.push(template.name);
      });
    this.myTemplateOptions = newTemplateOptions;
  }

  private markFormAsPristine(): void {
    this.invoiceFormGroup.markAsPristine();
    this.osptFormGroup.markAsPristine();
    if (this.uploadFormComponent) {
      this.uploadFormComponent.formGroup.markAsPristine();
    }
    this.lineItemsFormArray.markAsPristine();
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

  public lineItemNetAmountFormControl(index: number): AbstractControl {
    const lineItemFormGroup = this.lineItemsFormArray.at(index) as FormGroup;
    return lineItemFormGroup.controls.lineItemNetAmount;
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
    this.lineItemsFormArray.markAsDirty();
    if (this.lineItemsFormArray.length > 1) {
      this.lineItemRemoveButtonDisable = false;
    }
  }

  public removeLineItem(index: number): void {
    this.lineItemsFormArray.removeAt(index);
    if (this.lineItemsFormArray.length <= 1) {
      this.lineItemRemoveButtonDisable = true;
    }
    this.calculateLineItemNetAmount();
  }

  public async onCancel(): Promise<void> {
    if (this.isFormPristine || await this.askForCancelConfirmation()) {
      await this.gotoInvoiceList();
    }
  }

  private askForCancelConfirmation(): Promise<boolean> {
    return this.util.openConfirmationModal({
      title: 'Cancel',
      innerHtmlMessage: `You will lose all entered information if you cancel creation of this invoice now.
                   <br/><br/><strong>Are you sure you want to cancel creation of this invoice?</strong>`,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No, go back'
    }).toPromise();
  }

  private async gotoInvoiceList(): Promise<boolean> {
    return this.router.navigate(['/invoices']);
  }

  public async onSubmitForApprovalButtonClick(): Promise<void> {
    const invoiceNumber = await this.onSaveButtonClick();
    this.loadingService.showLoading('Submitting');
    try {
      if (invoiceNumber) {
        await this.invoiceService.submitForApproval(invoiceNumber).toPromise();
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  public async onSaveButtonClick(): Promise<string | null> {
    this.loadingService.showLoading('Saving');
    try {
      if (this.isOnEditPage) {
        // consider refactoring update/create invoice methods in the future!
        return this.updateInvoice();
      } else {
        return this.createInvoice();
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  public async updateInvoice(): Promise<string | null> {
    let savedInvoice;
    if (this.validateInvoiceAmount()) {
      // IS VALID
      const invoice = this.invoiceFormGroup.getRawValue();
      invoice.falconInvoiceNumber = this.falconInvoiceNumber;
      const isDuplicate = await this.invoiceService.checkInvoiceIsDuplicate(invoice).toPromise();
      if (isDuplicate) {
        // IS DUPLICATE
        this.onInvoiceIsDuplicate();
      } else {
        // IS NOT DUPLICATE
        this.processInvoice(invoice);
        let shouldReset = false;
        const attachedSuccess = await this.attachmentService.saveAttachments(
          this.falconInvoiceNumber,
          this.uploadFormComponent?.attachments ?? []
        ).toPromise();
        if (attachedSuccess) {
          // ATTACH SUCCESS
          this.onAttachSuccess(this.falconInvoiceNumber);
          shouldReset = true;
          savedInvoice = await this.invoiceService.saveInvoice(invoice).toPromise();
          if (savedInvoice.falconInvoiceNumber) {
            // INVOICE SAVED
            this.onSaveSuccess(savedInvoice.falconInvoiceNumber);
          } else {
            // INVOICE NOT SAVED
            await this.onSaveFailure();
          }
        } else {
          // ATTACH FAILURE
          await this.onAttachFailure();
        }
        if (shouldReset) {
          // RESET FORM
          this.resetForm();
        }
      }
    } else {
      this.onInvoiceInvalidated();
    }
    return savedInvoice?.falconInvoiceNumber ?? null;
  }

  public async createInvoice(): Promise<string | null> {
    let savedInvoice;
    if (this.validateInvoiceAmount()) {
      // IS VALID
      const invoice = this.invoiceFormGroup.getRawValue();
      invoice.falconInvoiceNumber = this.falconInvoiceNumber;
      const isDuplicate = await this.invoiceService.checkInvoiceIsDuplicate(invoice).toPromise();
      if (isDuplicate) {
        // IS DUPLICATE
        this.onInvoiceIsDuplicate();
      } else {
        // IS NOT DUPLICATE
        this.processInvoice(invoice);
        let shouldReset = false;
        savedInvoice = await this.invoiceService.saveInvoice(invoice).toPromise();
        if (savedInvoice.falconInvoiceNumber) {
          // INVOICE SAVED
          shouldReset = true;
          this.onSaveSuccess(savedInvoice.falconInvoiceNumber);
          const attachedSuccess = await this.attachmentService.saveAttachments(
            savedInvoice.falconInvoiceNumber,
            this.uploadFormComponent?.attachments ?? []
          ).toPromise();
          if (attachedSuccess) {
            // ATTACH SUCCESS
            this.onAttachSuccess(savedInvoice.falconInvoiceNumber);
          } else {
            // ATTACH FAILURE
            shouldReset = false;
            await this.onAttachFailure();
          }
        } else {
          // INVOICE NOT SAVED
          await this.onSaveFailure();
        }
        if (shouldReset) {
          // RESET FORM
          this.resetForm();
        }
      }
    } else {
      this.onInvoiceInvalidated();
    }
    return savedInvoice?.falconInvoiceNumber ?? null;
  }

  public saveTemplate(): void {
    this.subscriptions.push(
      this.util.openTemplateInputModal(this.osptFormGroup.controls.isPaymentOverrideSelected.value)
        .subscribe(async (result) => {
          if (result) {
            const template: TemplateToSave = {
              falconInvoiceNumber: this.falconInvoiceNumber,
              name: result.name,
              description: result.description
            };
            const savedTemplate = await this.templateService.createTemplate(template).toPromise();
            (savedTemplate && savedTemplate.name)
              ? this.onSaveTemplateSuccess(savedTemplate.name)
              : this.onSaveTemplateFailure();
          }
        })
    );
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
    invoice.amountOfInvoice = this.util.toNumber(invoice.amountOfInvoice);
    invoice.standardPaymentTermsOverride = this.osptFormGroup.controls.paymentTerms.value
      ? this.osptFormGroup.controls.paymentTerms.value
      : null;
    invoice.lineItems.forEach((lineItem: any) => {
      if (!lineItem.companyCode) {
        lineItem.companyCode = invoice.companyCode;
      }
      lineItem.lineItemNetAmount = this.util.toNumber(lineItem.lineItemNetAmount);
    });
  }

  private onSaveSuccess(invoiceNumber: string): void {
    // do nothing
  }

  private async onSaveFailure(): Promise<void> {
    if (this.isOnEditPage) {
      this.util.openSnackBar(`Failure, invoice was not updated!`);
    } else {
      await this.showSystemErrorModal();
    }
  }

  private onAttachSuccess(invoiceNumber: string): void {
    this.util.openSnackBar(`Success! Falcon Invoice ${invoiceNumber} has been ${this.isOnEditPage ? 'updated' : 'created'}.`);
  }

  private async onAttachFailure(): Promise<void> {
    if (this.isOnEditPage) {
      this.util.openSnackBar(`One or more documents failed to attach!`);
    } else {
      await this.showSystemErrorModal();
    }
  }

  private async showSystemErrorModal(): Promise<void> {
    await this.util.openErrorModal({
      title: 'System Error',
      innerHtmlMessage: `Invoice creation failed.<br/><br/>
         <strong>Please contact your administrator.</strong>`,
    }).toPromise();
    await this.gotoInvoiceList();
  }

  private onSaveTemplateSuccess(templateName: string): void {
    this.util.openSnackBar(`Success! Template saved as ${templateName}.`);
  }

  private onSaveTemplateFailure(): void {
    this.util.openSnackBar(`Failure, template was not created.`);
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
    this.invoiceFormGroup.controls.invoiceDate.enable();
    this.invoiceFormGroup.controls.amountOfInvoice.enable();
    this.invoiceFormGroup.controls.currency.enable();
    this.invoiceFormGroup.controls.lineItems.enable();
    this.invoiceFormGroup.controls.comments.enable();
  }

  public calculateLineItemNetAmount(): void {
    this.totalLineItemNetAmount = 0;
    for (const control of this.lineItemsFormArray.controls) {
      this.totalLineItemNetAmount += parseFloat((control as FormGroup).controls.lineItemNetAmount.value);
    }
  }

  public validateDate(control: AbstractControl): ValidationErrors | null {
    const dateString = control.value;
    if (dateString) {
      if (!(dateString instanceof Date)) {
        return {validateDate: true};
      } else if (dateString.getFullYear() < 1000
        || dateString.getFullYear() > 9999) {
        return {validateDate: true};
      }
    }
    return null;
  }

}
