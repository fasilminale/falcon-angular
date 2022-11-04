import {
  Component,
  EventEmitter,
  forwardRef, Inject,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  AbstractControl, FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {FalFileInputComponent} from '../fal-file-input/fal-file-input.component';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {Router} from '@angular/router';
import {LoadingService} from '../../services/loading-service';
import {TemplateService} from '../../services/template-service';
import {UtilService} from '../../services/util-service';
import {UploadFormComponent} from '../upload-form/upload-form.component';
import {Template, TemplateToSave} from '../../models/template/template-model';
import {InvoiceService} from '../../services/invoice-service';
import {ATTACHMENT_SERVICE, AttachmentService} from '../../services/attachment-service';
import {Milestone} from '../../models/milestone/milestone-model';
import {MatDialog} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {Observable, of, Subscription} from 'rxjs';
import {InvoiceFormManager} from './invoice-form-manager';
import {KeyedLabel} from '../../models/generic/keyed-label';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {ConfirmationModalData, ElmFormHelper, ModalService, ToastService} from '@elm/elm-styleguide-ui';
import {ElmUamRoles} from '../../utils/elm-uam-roles';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InvoiceFormComponent),
    multi: true
  }]
})
export class InvoiceFormComponent implements OnInit, OnChanges, OnDestroy {

  /* PUBLIC FIELDS */
  public readonly regex = /[a-zA-Z0-9_\\-]/;
  public readonly freeTextRegex = /[\w\-\s]/;
  public readonly specialCharErrorMessage = 'Special characters are not allowed';
  public readonly requiredPermissions = [ElmUamRoles.ALLOW_INVOICE_WRITE];
  public editableInvoice = true;
  public lineItemRemoveButtonDisable = true;
  public validAmount = true;
  public externalAttachment = false;
  public file = null;
  public isInvoiceSaved: boolean = false;

  /* PRIVATE FIELDS */
  private invoice = new InvoiceDataModel();
  private lineItemNumber = 0;
  private subscriptions = new Subscription();
  private onCancelSubscription = new Subscription();

  /* INPUTS */
  @Input() enableMilestones = false;
  @Input() readOnly = false;
  @Input() falconInvoiceNumber = '';
  @Input() userInfo: UserInfoModel | undefined = new UserInfoModel();

  /* OUTPUTS */
  @Output() updateMilestones = new EventEmitter<Array<Milestone>>();
  @Output() toggleMilestones = new EventEmitter<void>();
  @Output() isDeletedInvoice = new EventEmitter<boolean>();
  @Output() isSubmittedInvoice = new EventEmitter<boolean>();
  @Output() isAutoInvoice = new EventEmitter<boolean>();
  @Output() isApprovedInvoice = new EventEmitter<boolean>();
  @Output() isRejectedInvoice = new EventEmitter<boolean>();
  @Output() invoiceStatusChange = new EventEmitter<KeyedLabel | null>();

  /* CHILDREN */
  @ViewChild(FalFileInputComponent) fileChooserInput?: FalFileInputComponent;
  @ViewChild(UploadFormComponent) uploadFormComponent?: UploadFormComponent;

  /* CONSTRUCTORS */
  public constructor(
    private dialog: MatDialog,
    private loadingService: LoadingService,
    private invoiceService: InvoiceService,
    private templateService: TemplateService,
    private util: UtilService,
    private toast: ToastService,
    private modal: ModalService,
    private router: Router,
    public form: InvoiceFormManager,
    @Inject(ATTACHMENT_SERVICE) private attachmentService: AttachmentService,
  ) {
  }

  ngOnDestroy(): void {
    // Bug is styleguide .... for some reason formarray supporting checkbox is not clearing out.
    (this.form.osptFormGroup.controls.isPaymentOverrideSelected as FormArray).clear();
    this.form.destroy();
    this.subscriptions.unsubscribe();
  }

  /* PROPERTY FUNCTIONS */
  @Input() set onCancel$(observable: Observable<any>) {
    this.onCancelSubscription.unsubscribe();
    this.onCancelSubscription = observable.subscribe(() => {
      this.gotoInvoiceList();
    });
  }

  get isOnEditPage(): boolean {
    return !!this.falconInvoiceNumber;
  }

  get isFormPristine(): boolean {
    return this.form.invoiceFormGroup.pristine
      && this.form.osptFormGroup.pristine
      && (this.uploadFormComponent?.formGroup.pristine ?? true)
      && this.form.lineItems.pristine;
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
    return this.util.getCommentLabelPrefix(this.latestMilestone);
  }

  /* METHODS */
  public ngOnInit(): void {
    this.initForm();
  }

  public initForm(): void {
    this.form.init();
    this.resetForm();
    if (this.falconInvoiceNumber) {
      this.loadData();
    }
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
        this.form.workType.setValue(template.workType);
        this.form.companyCode.setValue(template.companyCode);
        this.form.erpType.setValue(template.erpType);
        this.form.vendorNumber.setValue(template.vendorNumber);
        this.form.currency.setValue(template.currency);
        this.form.lineItems.clear();
        for (const lineItem of template.lineItems) {
          const newLineItemGroup = this.form.createEmptyLineItemGroup();
          newLineItemGroup.controls.companyCode.setValue(lineItem.companyCode);
          newLineItemGroup.controls.costCenter.setValue(lineItem.costCenter);
          newLineItemGroup.controls.glAccount.setValue(lineItem.glAccount);
          this.form.establishTouchLink(newLineItemGroup, this.form.lineItems);
          this.form.lineItems.push(newLineItemGroup);
        }
        if (this.form.lineItems.length === 0) {
          this.form.addNewEmptyLineItem();
        }
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  public loadData(): void {
    this.loadingService.showLoading('Loading');
    this.subscriptions.add(
      this.invoiceService.getInvoice(this.falconInvoiceNumber)
        .subscribe(
          (invoice: any) => {
            this.invoice = new InvoiceDataModel(invoice);
            this.invoiceStatusChange.emit(this.invoice?.status);
            this.form.workType.setValue(invoice.workType);
            this.form.companyCode.setValue(invoice.companyCode);
            this.form.erpType.setValue(invoice.erpType);
            this.form.vendorNumber.setValue(invoice.vendorNumber);
            this.form.externalInvoiceNumber.setValue(invoice.externalInvoiceNumber);
            this.form.invoiceDate.setValue(new Date(invoice.invoiceDate));
            this.form.amountOfInvoice.setValue(invoice.amountOfInvoice);
            this.form.currency.setValue(invoice.currency);
            this.form.comments.setValue(invoice.comments);
            this.form.invoiceFormGroup.disable();

            if (!!invoice.standardPaymentTermsOverride) {
              ElmFormHelper.checkCheckbox(this.form.osptFormGroup.controls.isPaymentOverrideSelected as FormArray,
                this.form.overridePaymentTermsOptions[0], true);
            }

            this.form.paymentTerms.setValue(invoice.standardPaymentTermsOverride);
            this.form.osptFormGroup.disable();

            // Line Items
            this.form.lineItems.clear();
            for (const lineItem of invoice.lineItems) {
              const newLineItemGroup = this.form.createEmptyLineItemGroup();
              newLineItemGroup.controls.companyCode.setValue(lineItem.companyCode);
              newLineItemGroup.controls.costCenter.setValue(lineItem.costCenter);
              newLineItemGroup.controls.glAccount.setValue(lineItem.glAccount);
              newLineItemGroup.controls.lineItemNetAmount.setValue(lineItem.lineItemNetAmount);
              newLineItemGroup.controls.notes.setValue(lineItem.notes);
              this.form.lineItems.push(newLineItemGroup);
            }
            this.form.lineItems.disable();

            // Attachments
            if (this.uploadFormComponent) {
              this.uploadFormComponent.load(invoice.attachments);
            }

            this.updateMilestones.emit(invoice.milestones);
            if (this.invoice.status.key === 'DELETED') {
              this.isDeletedInvoice.emit(true);
            }
            if (this.invoice.status.key !== 'CREATED' && this.invoice.status.key !== 'REJECTED') {
              this.editableInvoice = false;
              this.isSubmittedInvoice.emit(true);
            }
            if (this.invoice.entryType === 'AUTO') {
              this.isAutoInvoice.emit(true);
            }
            if (this.invoice.status.key === 'APPROVED') {
              this.isApprovedInvoice.emit(true);
            }
            if (this.invoice.status.key === 'REJECTED') {
              this.isRejectedInvoice.emit(true);
            }
            this.loadingService.hideLoading();
            this.markFormAsPristine();
          }
        ));
  }

  public resetForm(): void {
    this.resetTemplateOptions().finally();
    this.form.invoiceFormGroup.reset();
    this.form.osptFormGroup.reset();
    this.form.selectedTemplate.reset();
    if (this.uploadFormComponent) {
      this.uploadFormComponent.reset();
      this.uploadFormComponent.pristine = true;
    }
    this.form.lineItems.clear();
    this.form.lineItems.valueChanges.subscribe(() => {
      this.lineItemRemoveButtonDisable = this.form.lineItems.length <= 1;
    });
    this.form.addNewEmptyLineItem();
    // set default currency to USD
    this.form.currency.setValue(this.form.currencyOptions[0].value);
    // default work type as long as there is only one value
    if (this.form.workTypeOptions.length === 1) {
      this.form.workType.setValue(this.form.workTypeOptions[0]);
    }
    this.form.erpType.markAsPristine();
    this.form.invoiceDate.markAsPristine();
    this.form.companyCode.setValue('');
    this.form.amountOfInvoice.setValue('0');
    this.markFormAsPristine();
    this.form.invoiceFormGroup.markAsUntouched();
    this.form.isInvoiceAmountValid = true;
  }

  private async resetTemplateOptions(): Promise<void> {
    if (this.isOnEditPage) {
      this.form.myTemplateOptions = [];
      this.form.selectedTemplate.disable();
    } else {
      const newTemplateOptions: Array<string> = [];
      (await this.templateService.getTemplates().toPromise())
        .forEach((template: Template) => {
          newTemplateOptions.push(template.name);
          newTemplateOptions.sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1);
        });
      this.form.myTemplateOptions = newTemplateOptions;
      if (newTemplateOptions.length === 0) {
        this.form.selectedTemplate.disable();
      } else {
        this.form.selectedTemplate.enable();
      }
    }
    this.subscriptions.add(
      this.form.selectedTemplate.valueChanges.subscribe((v: string) => this.loadTemplate(v))
    );
  }

  private markFormAsPristine(): void {
    this.form.invoiceFormGroup.markAsPristine();
    this.form.osptFormGroup.markAsPristine();
    if (this.uploadFormComponent) {
      this.uploadFormComponent.formGroup.markAsPristine();
    }
    this.form.lineItems.markAsPristine();
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

  public askForCancelConfirmation(): Observable<boolean> {
    let line1Message = 'You will lose all entered information if you cancel creation of this invoice now.';
    let line2Message = 'Are you sure you want to cancel creation of this invoice?';
    if (this.isOnEditPage) {
      line1Message = 'All changes to this invoice will be lost if you cancel now.';
      line2Message = 'Are you sure you want to cancel?';
    }
    const data: ConfirmationModalData = {
      title: 'Cancel',
      innerHtmlMessage: `${line1Message}
                 <br/><br/><strong>
                 ${line2Message}
                 </strong>`,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No, go back'
    };
    return this.util.openConfirmationModal(data);
  }

  public async gotoInvoiceList(): Promise<boolean> {
    return this.router.navigate(['/invoices']);
  }

  public async onSubmitForApprovalButtonClick(): Promise<void> {
    const invoiceNumber = await this.saveInvoice();
    this.loadingService.showLoading('Submitting');
    try {
      if (invoiceNumber) {
        await this.invoiceService.submitForApproval(invoiceNumber).toPromise();
        await this.gotoInvoiceList();
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  public async onSaveButtonClick(): Promise<void> {
    const invoiceNumber = await this.saveInvoice();
    if (invoiceNumber) {
      await this.gotoInvoiceList();
    }
  }

  private async saveInvoice(): Promise<string | null> {
    this.loadingService.showLoading('Saving');
    try {
      if (this.isOnEditPage) {
        // consider refactoring update/create invoice methods in the future!
        return this.checkCompanyCode();
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
      const invoice = this.form.invoiceFormGroup.getRawValue();
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
      const invoice = this.form.invoiceFormGroup.getRawValue();
      console.log(`create invoice payment terms ${JSON.stringify(invoice)}`);
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
          this.isInvoiceSaved = true;
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
    this.subscriptions.add(
      this.util.openTemplateInputModal(this.form.isPaymentOverrideSelected.value)
        .subscribe(
          async (result) => {
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
          }
        )
    );
  }

  public validateInvoiceAmount(): boolean {
    let sum = 0;
    const invoiceAmount = this.util
      .toNumber(this.form.amountOfInvoice.value)
      .toFixed(2);
    for (let i = 0; i < this.form.lineItems.controls.length; i++) {
      const lineItem = this.form.lineItems.at(i) as FormGroup;
      const lineItemAmount = lineItem.get('lineItemNetAmount') as FormControl;
      sum += this.util.toNumber(lineItemAmount.value);
    }
    this.validAmount = parseFloat(invoiceAmount) > 0 && sum.toFixed(2) === invoiceAmount;
    return this.validAmount;
  }

  public onInvoiceInvalidated(): void {
    this.modal.openSystemErrorModal({
      title: 'Invalid Invoice Amount',
      innerHtmlMessage: `Line Item Net Amount must equal Invoice Net Amount.`
    });
    this.form.validateInvoiceNetAmountSum();
  }

  private onInvoiceIsDuplicate(): void {
    this.modal.openSystemErrorModal({
      title: 'Duplicate Invoice',
      innerHtmlMessage: `An invoice with the same vendor number, external invoice number, invoice date, and company code already exists.
            <br/><br/><strong>Please update these fields and try again.</strong>`
    });
  }

  private processInvoice(invoice: any): void {
    if (this.isOnEditPage) {
      invoice.falconInvoiceNumber = this.falconInvoiceNumber;
    }
    invoice.amountOfInvoice = this.util.toNumber(invoice.amountOfInvoice);
    invoice.standardPaymentTermsOverride = this.form.paymentTerms.value
      ? this.form.paymentTerms.value
      : null;
    invoice.lineItems.forEach((lineItem: any) => {
      if (!lineItem.companyCode) {
        lineItem.companyCode = invoice.companyCode;
      }
      lineItem.lineItemNumber = ++this.lineItemNumber;
      lineItem.lineItemNetAmount = this.util.toNumber(lineItem.lineItemNetAmount);
    });
  }

  private onSaveSuccess(invoiceNumber: string): void {
    this.gotoInvoiceList();
  }

  private async onSaveFailure(): Promise<void> {
    if (this.isOnEditPage) {
      this.toast.openErrorToast('Failure, invoice was not updated!');
    } else {
      await this.showSystemErrorModal();
    }
  }

  private onAttachSuccess(invoiceNumber: string): void {
    this.toast.openSuccessToast(`Success! Falcon Invoice ${invoiceNumber} has been ${this.isOnEditPage ? 'updated' : 'created'}.`);
  }

  private async onAttachFailure(): Promise<void> {
    if (this.isOnEditPage) {
      this.toast.openErrorToast(`One or more documents failed to attach!`);
    } else {
      await this.showSystemErrorModal();
    }
  }

  private async showSystemErrorModal(): Promise<void> {
    await this.modal.openSystemErrorModal({
      title: 'System Error',
      innerHtmlMessage: `Invoice creation failed.<br/><br/>
         <strong>Please contact your administrator.</strong>`,
    }).toPromise();
    await this.gotoInvoiceList();
  }

  private onSaveTemplateSuccess(templateName: string): void {
    this.toast.openSuccessToast(`Success! Template saved as ${templateName}.`);
  }

  private onSaveTemplateFailure(): void {
    this.toast.openErrorToast('Failure, template was not created.');
  }

  public toggleSidenav(): void {
    this.toggleMilestones.emit();
  }

  private enableFormFields(): void {
    this.form.workType.enable();
    this.form.companyCode.enable();
    this.form.erpType.enable();
    this.form.vendorNumber.enable();
    this.form.externalInvoiceNumber.enable();
    this.form.invoiceDate.enable();
    this.form.amountOfInvoice.enable();
    this.form.currency.enable();
    this.form.lineItems.enable();
    this.form.comments.enable();
    (this.form.osptFormGroup.controls.isPaymentOverrideSelected as FormArray).enable();
  }

  public async checkCompanyCode(): Promise<string | null> {
    const companyCode = this.form.companyCode.value;

    if (companyCode !== this.invoice.companyCode || this.checkFormArrayCompanyCode()) {
      const dialogRef = this.util.openConfirmationModal({
        title: `Review Changes`,
        innerHtmlMessage: `You've made changes to the company code(s)<br/><br/>
                <strong>Are you sure you want to continue with the changes?</strong>`,
        confirmButtonText: 'Yes, continue',
        cancelButtonText: 'No, go back'
      }).toPromise();

      if (await dialogRef) {
        return this.updateInvoice();
      }
      return of(null).toPromise();
    }
    return this.updateInvoice();
  }

  private checkFormArrayCompanyCode(): boolean {
    let isCompanyCodeChanged = false;
    this.form.lineItems.controls.forEach((control: AbstractControl) => {
      const item = control.value;
      if (item.lineItemNumber) {
        const lineItem = this.invoice.lineItems.find(f => f.lineItemNumber === item.lineItemNumber && f.companyCode !== item.companyCode);
        if (lineItem) {
          isCompanyCodeChanged = true;
        }
      }
    });
    return isCompanyCodeChanged;
  }

  public focusInvoiceDate(): void {
    this.form.forceValueChangeEvent(this.form.invoiceDate);
    if (this.uploadFormComponent) {
      this.uploadFormComponent.pristine = false;
      this.uploadFormComponent.formGroup.markAsDirty();
    }
  }

  public focusAmountOfInvoice(): void {
    this.focusInvoiceDate();
    this.form.forceValueChangeEvent(this.form.amountOfInvoice);
  }

  public focusLineItemElement(formControl: AbstractControl): void {
    this.focusInvoiceDate();
    this.form.forceValueChangeEvent(formControl);
  }
}
