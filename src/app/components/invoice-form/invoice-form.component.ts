import {
    Component,
    EventEmitter,
    forwardRef, Inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import {FalFileInputComponent} from '../fal-file-input/fal-file-input.component';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import { Router} from '@angular/router';
import {LoadingService} from '../../services/loading-service';
import {TemplateService} from '../../services/template-service';
import {UtilService} from '../../services/util-service';
import {UploadFormComponent} from '../upload-form/upload-form.component';
import {Template, TemplateToSave} from '../../models/template/template-model';
import {InvoiceService} from '../../services/invoice-service';
import {ATTACHMENT_SERVICE, AttachmentService} from '../../services/attachment-service';
import {Milestone} from '../../models/milestone/milestone-model';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../services/subscription-manager';
import {MatDialog} from '@angular/material/dialog';
import {of} from 'rxjs';
import {InvoiceFormManager} from './invoice-form-manager';

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
export class InvoiceFormComponent implements OnInit, OnChanges {

    /* PUBLIC FIELDS */
    public readonly regex = /[a-zA-Z0-9_\\-]/;
    public readonly freeTextRegex = /[\w\-\s]/;
    public readonly specialCharErrorMessage = 'Special characters are not allowed';
    public lineItemRemoveButtonDisable = true;
    public validAmount = true;
    public externalAttachment = false;
    public file = null;

    /* PRIVATE FIELDS */
    private invoice = new InvoiceDataModel();
    private lineItemNumber = 0;

    /* INPUTS */
    @Input() enableMilestones = false;
    @Input() readOnly = false;
    @Input() falconInvoiceNumber = '';

    /* OUTPUTS */
    @Output() updateMilestones = new EventEmitter<Array<Milestone>>();
    @Output() toggleMilestones = new EventEmitter<void>();
    @Output() isDeletedInvoice = new EventEmitter<boolean>();
    @Output() isSubmittedInvoice = new EventEmitter<boolean>();

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
        private router: Router,
        public form: InvoiceFormManager,
        @Inject(ATTACHMENT_SERVICE) private attachmentService: AttachmentService,
        @Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager,
    ) {
    }

    /* PROPERTY FUNCTIONS */
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
        return this.getCommentLabelPrefix(this.latestMilestone);
    }

    public getCommentLabelPrefix(milestone: Milestone): string {
        const status = milestone?.status;
        if (status?.key && status.key === 'SUBMITTED') {
            return 'Creator';
        }
        if (status?.key && status.key === 'REJECTED') {
          return 'Rejection';
        }
        return 'General';
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
        this.subscriptionManager.manage(
            this.invoiceService.getInvoice(this.falconInvoiceNumber)
                .subscribe(
                    (invoice: any) => {
                        this.invoice = new InvoiceDataModel(invoice);
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

                        this.form.isPaymentOverrideSelected.setValue(!!invoice.standardPaymentTermsOverride);
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
                            this.isSubmittedInvoice.emit(true);
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
        this.form.currency.setValue(this.form.currencyOptions[0]);
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
        this.subscriptionManager.manage(
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


    public async onCancel(): Promise<void> {
        if (this.isFormPristine || await this.askForCancelConfirmation()) {
            await this.gotoInvoiceList();
        }
    }

    private askForCancelConfirmation(): Promise<boolean> {
        let line1Message= 'You will lose all entered information if you cancel creation of this invoice now.';
        let line2Message = 'Are you sure you want to cancel creation of this invoice?';
        if(this.isOnEditPage) {
             line1Message = 'All changes to this invoice will be lost if you cancel now.';
             line2Message = 'Are you sure you want to cancel?';
        }
        return this.util.openConfirmationModal({
            title: 'Cancel',
            innerHtmlMessage: `${line1Message}
                   <br/><br/><strong>
                   ${line2Message}
                   </strong>`,
            confirmButtonText: 'Yes, cancel',
            confirmButtonStyle: 'destructive',
            cancelButtonText: 'No, go back'
        }).toPromise();
    }

    private async gotoInvoiceList(): Promise<boolean> {
        return this.router.navigate(['/invoices']);
    }

    public async onSubmitForApprovalButtonClick(): Promise<void> {
        const invoiceNumber = await this.saveInvoice();
        this.loadingService.showLoading('Submitting');
        try {
            if (invoiceNumber) {
                await this.invoiceService.submitForApproval(invoiceNumber).toPromise();
            }
        } finally {
            this.loadingService.hideLoading();
        }
        await this.gotoInvoiceList();
    }

    public async onSaveButtonClick(): Promise<void> {
        await this.saveInvoice();
        await this.gotoInvoiceList();
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
        this.subscriptionManager.manage(
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
        this.util.openErrorModal({
            title: 'Invalid Amount(s)',
            innerHtmlMessage: `Total of Line Net Amount(s) must equal Invoice Net Amount.`
        });
        this.form.validateInvoiceNetAmountSum();
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
    }

    public async checkCompanyCode(): Promise<string | null> {
        const companyCode = this.form.companyCode.value;

        if (companyCode !== this.invoice.companyCode || this.checkFormArrayCompanyCode()) {
            const dialogRef = this.util.openConfirmationModal({
                title: `You've changed company code(s)`,
                innerHtmlMessage: `Are you sure you want to continue with the changes?`,
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

    public focusInvoiceDate() {
        this.form.forceValueChangeEvent(this.form.invoiceDate);
        if (this.uploadFormComponent) {
            this.uploadFormComponent.pristine = false;
            this.uploadFormComponent.formGroup.markAsDirty();
        }
    }

    public focusAmountOfInvoice() {
        this.focusInvoiceDate();
        this.form.forceValueChangeEvent(this.form.amountOfInvoice)
    }

    public focusLineItemElement(formControl: AbstractControl) {
        this.focusInvoiceDate();
        this.form.forceValueChangeEvent(formControl)
    }
}
