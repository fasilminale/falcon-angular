import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {FalRadioOption} from 'src/app/components/fal-radio-input/fal-radio-input.component';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {CostLineItem, DisputeLineItem} from 'src/app/models/line-item/line-item-model';
import {CalcDetail, CostBreakDownUtils, RateDetailResponse} from '../../../models/rate-engine/rate-engine-request';
import {first, map} from 'rxjs/operators';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {InvoiceOverviewDetail} from '../../../models/invoice/invoice-overview-detail.model';
import {ConfirmationModalData, ElmFormHelper, ToastService} from '@elm/elm-styleguide-ui';
import {CommentModel, UtilService} from '../../../services/util-service';
import {UserInfoModel} from '../../../models/user-info/user-info-model';
import {SubjectValue} from 'src/app/utils/subject-value';

@Component({
  selector: 'app-invoice-amount',
  templateUrl: './invoice-amount.component.html',
  styleUrls: ['./invoice-amount.component.scss']
})
export class InvoiceAmountComponent implements OnInit {
  static readonly INVOICE_AMOUNT_CL = 'invoice-amount-cl';
  static readonly INVOICE_AMOUNT_PAYTERM = 'invoice-amount-pt';

  fileFormGroup = new FormGroup({});

  private readonly subscriptions = new Subscription();

  constructor(private utilService: UtilService,
              private toastService: ToastService) {
  }

  @Input() set chargeLineItemOptions$(observable: Observable<RateDetailResponse>) {
    this.chargeLineItemOptionsSubscription.unsubscribe();
    this.chargeLineItemOptionsSubscription = observable.pipe(
      map(response => {
        return CostBreakDownUtils.toOptions(response.calcDetails);
      })
    ).subscribe(
      opts => {
        this.costBreakdownOptions$.value = opts;
      }
    );
  }

  @Input() isMakingRateCall = false;

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.updateIsEditModeSubscription.unsubscribe();
    this.updateIsEditModeSubscription = observable.subscribe(
      isEditMode => {
        this.readOnlyForm = !isEditMode;
        this.enableDisableOverrideStandardPaymentTerms(this.readOnlyForm);
        this.enableDisableCurrency(this.readOnlyForm);
        this.invoiceAmountFormInvalid.emit({
          'form': InvoiceAmountComponent.INVOICE_AMOUNT_CL,
          'value': (this.paymentTermValid)
        });
      }
    );
  }

  @Input() set loadInvoiceOverviewDetail$(observable: Observable<InvoiceOverviewDetail>) {
    this.loadInvoiceOverviewDetailSubscription.unsubscribe();
    this.loadInvoiceOverviewDetailSubscription = observable.subscribe(
      invoiceOverviewDetail => {
        this.isPrepaid = invoiceOverviewDetail.freightPaymentTerms === 'PREPAID';
        this.isSpotQuote = invoiceOverviewDetail.isSpotQuote;
        this.isReturnToDomicile = invoiceOverviewDetail.returnToDomicile === true;
      }
    );
  }

  @Input() set formGroup(givenFormGroup: FormGroup) {
    this.amountOfInvoiceControl.valueChanges.subscribe(() => this.requestGlAllocation.emit(true));
    givenFormGroup.setControl('amountOfInvoice', this.amountOfInvoiceControl);
    givenFormGroup.setControl('currency', new FormControl(''));
    givenFormGroup.setControl('overridePaymentTerms', this.overridePaymentTermsFormGroup);
    givenFormGroup.setControl('paymentTerms', new FormControl(''));
    givenFormGroup.setControl('mileage', new FormControl());
    givenFormGroup.setControl('fileFormGroup', this.fileFormGroup);
    this.insertLineItems(this.costBreakdownItems, this.costBreakdownItemsControls);
    givenFormGroup.setControl('costBreakdownItems', this.costBreakdownItems);
    this.insertLineItems(this.pendingChargeLineItems, this.pendingChargeLineItemControls);
    givenFormGroup.setControl('pendingChargeLineItems', this.pendingChargeLineItems);
    this.insertLineItems(this.deniedChargeLineItems, this.deniedChargeLineItemControls);
    givenFormGroup.setControl('deniedChargeLineItems', this.deniedChargeLineItems);
    this.insertLineItems(this.deletedChargeLineItems, this.deletedChargeLineItemControls);
    givenFormGroup.setControl('deletedChargeLineItems', this.deletedChargeLineItems);
    this.insertDisputeLineItems();
    givenFormGroup.setControl('disputeLineItems', this.disputeLineItems);
    this._formGroup = givenFormGroup;
  }

  get costBreakdownItemsControls(): AbstractControl[] {
    return this.costBreakdownItems.controls;
  }

  get pendingChargeLineItemControls(): AbstractControl[] {
    return this._formGroup.get('pendingChargeLineItems')
      ? (this._formGroup.get('pendingChargeLineItems') as FormArray).controls
      : new FormArray([]).controls;
  }

  get deniedChargeLineItemControls(): AbstractControl[] {
    return this._formGroup.get('deniedChargeLineItems')
      ? (this._formGroup.get('deniedChargeLineItems') as FormArray).controls
      : new FormArray([]).controls;
  }

  get disputeLineItemControls(): AbstractControl[] {
    return this._formGroup.get('disputeLineItems')
      ? (this._formGroup.get('disputeLineItems') as FormArray).controls
      : new FormArray([]).controls;
  }

  get deletedChargeLineItemControls(): AbstractControl[] {
    return this._formGroup.get('deletedChargeLineItems')
      ? (this._formGroup.get('deletedChargeLineItems') as FormArray).controls
      : new FormArray([]).controls;
  }

  get costBreakdownTotal(): number {
    // TODO stop adding money together in UI code
    // cannot remove this method, yet, because it is still be used
    let totalAmount = 0;
    this.costBreakdownItemsControls
      .filter(c => !!c)
      .forEach(c => {
        if (c.get('totalAmount')?.value) {
          totalAmount += parseFloat(c.get('totalAmount')?.value);
        }
      });
    const invoiceNetAmount = this._formGroup.get('amountOfInvoice')?.value;
    this.isValidCostBreakdownAmount = parseFloat(invoiceNetAmount) > 0
      && totalAmount.toFixed(2) === parseFloat(invoiceNetAmount).toFixed(2);
    this.invoiceAmountFormInvalid.emit({
      'form': InvoiceAmountComponent.INVOICE_AMOUNT_CL,
      'value': (this.paymentTermValid)
    });
    return totalAmount;
  }

  get contractedRateTotal(): number {
    return this.amountOfInvoiceControl.value - this.nonContractedRateTotal;
  }

  get nonContractedRateTotal(): number {
    let totalAmount = 0;
    this.costBreakdownItemsControls.forEach(c => {
      if (c?.get('totalAmount')?.value
        && c?.get('rateSource')?.value !== 'Contract') {
        totalAmount += parseFloat(c?.get('totalAmount')?.value);
      }
    });
    return totalAmount;
  }

  @Input() set loadInvoiceAmountDetail$(observable: Observable<InvoiceAmountDetail>) {
    this.invoiceAmountDetailSubscription.unsubscribe();
    this.invoiceAmountDetailSubscription = observable.subscribe(
      invoiceAmountDetail => this.loadForm(this._formGroup, invoiceAmountDetail)
    );
  }

  get hasMileage(): boolean {
    return !!this._formGroup?.get('mileage')?.value;
  }

  public readonly dateFormat = 'MM-dd-YYYY';
  public readonly ellipsisPipeLimit = 10;

  _formGroup = new FormGroup({});
  amountOfInvoiceControl = new FormControl('', [Validators.required]);
  @Output() invoiceAmountFormInvalid = new EventEmitter<any>();
  isValidCostBreakdownAmount = true;
  isPrepaid?: boolean;
  isSpotQuote?: boolean;
  isReturnToDomicile?: boolean;

  public paymentTermOptions: Array<FalRadioOption> = [
    {value: 'Z000', display: 'Pay Immediately'},
    {value: 'ZN14', display: 'Pay in 14 days'}
  ];
  public currencyOptions = [
    {label: 'USD', value: 'USD', disabled: true},
    {label: 'CAD', value: 'CAD', disabled: true}
  ];
  public overridePaymentTermsOptions = [
    {label: 'Override Standard Payment Terms', value: 'override', disabled: false}
  ];
  isPaymentOverrideSelected = new FormArray([]);
  overridePaymentTermsFormGroup = new FormGroup({
    isPaymentOverrideSelected: this.isPaymentOverrideSelected,
    paymentTerms: new FormControl('')
  });

  public costBreakdownOptions$: SubjectValue<Array<SelectOption<CalcDetail>>> = new SubjectValue<Array<SelectOption<CalcDetail>>>([]);

  readOnlyForm = true;
  costBreakdownItems = new FormArray([]);
  pendingChargeLineItems = new FormArray([]);
  deniedChargeLineItems = new FormArray([]);
  deletedChargeLineItems = new FormArray([]);
  disputeLineItems = new FormArray([]);
  pendingAccessorialCode = '';
  paymentTermValid: boolean = true;

  @Input() userInfo: UserInfoModel | undefined = new UserInfoModel();

  @Output() rateEngineCall = new EventEmitter<string>();
  @Output() getAccessorialDetails = new EventEmitter<any>();
  @Output() resolveDisputeCall = new EventEmitter<any>();
  @Output() requestGlAllocation = new EventEmitter<boolean>();

  chargeLineItemOptionsSubscription: Subscription = new Subscription();
  updateIsEditModeSubscription: Subscription = new Subscription();
  loadInvoiceOverviewDetailSubscription: Subscription = new Subscription();

  invoiceAmountDetailSubscription = new Subscription();

  ngOnInit(): void {
    this.setUpOverrideStandardPaymentTermsSubscription();
    this.enableDisableOverrideStandardPaymentTerms(true);
    this.enableDisableCurrency(true);
  }

  setUpOverrideStandardPaymentTermsSubscription(): void {
    this.subscriptions.add(this.isPaymentOverrideSelected.valueChanges
      .subscribe((selected: string) => {
        if (!selected || selected.length <= 0) {
          this.paymentTermValid = true;
          this.emitOverrideStandardPaymentTermsValidity();
          return;
        }
        const payTerm = this.overridePaymentTermsFormGroup.controls?.paymentTerms?.value;
        this.paymentTermValid = payTerm ? true : false;
        this.emitOverrideStandardPaymentTermsValidity();
        const selectedBool = selected + '' === this.overridePaymentTermsOptions[0].value;
        if (!selectedBool) {
          this.overridePaymentTermsFormGroup.controls.paymentTerms.reset();
        }
      }));
  }

  enableDisableOverrideStandardPaymentTerms(disable: boolean): void {
    this.overridePaymentTermsOptions[0].disabled = disable;
  }

  enableDisableCurrency(disable: boolean): void {
    if (this._formGroup.controls.currency) {
      if (disable) {
        this._formGroup.controls.currency.disable();
      } else {
        this._formGroup.controls.currency.enable();
      }
    }
  }

  emitOverrideStandardPaymentTermsValidity() {
    this.invoiceAmountFormInvalid.emit({
      'form': InvoiceAmountComponent.INVOICE_AMOUNT_PAYTERM,
      'value': (this.paymentTermValid)
    });
  }

  paymentTermSelected(payTerm: any) {
    this.paymentTermValid = payTerm && payTerm.value ? true : false;
    this.emitOverrideStandardPaymentTermsValidity();
  }

  loadForm(givenFormGroup: FormGroup, invoiceAmountDetail?: InvoiceAmountDetail): void {
    givenFormGroup.get('currency')?.setValue(invoiceAmountDetail?.currency ?? '');
    if (!!invoiceAmountDetail?.standardPaymentTermsOverride) {
      ElmFormHelper.checkCheckbox(this.isPaymentOverrideSelected,
        this.overridePaymentTermsOptions[0], true);
      this.paymentTermValid = true;
      this.emitOverrideStandardPaymentTermsValidity();
    }
    this.overridePaymentTermsFormGroup.controls.paymentTerms.setValue(invoiceAmountDetail?.standardPaymentTermsOverride ?? '');
    givenFormGroup.get('mileage')?.setValue(invoiceAmountDetail?.mileage ?? '');
    givenFormGroup.get('mileage')?.disable();
    (givenFormGroup.get('costBreakdownItems') as FormArray).clear();
    (givenFormGroup.get('pendingChargeLineItems') as FormArray).clear();
    (givenFormGroup.get('disputeLineItems') as FormArray)?.clear();
    (givenFormGroup.get('deletedChargeLineItems') as FormArray)?.clear();
    (givenFormGroup.get('deniedChargeLineItems') as FormArray)?.clear();

    this.insertLineItems(this.costBreakdownItems, this.costBreakdownItemsControls, invoiceAmountDetail?.costLineItems);
    this.insertLineItems(this.pendingChargeLineItems, this.pendingChargeLineItemControls, invoiceAmountDetail?.pendingChargeLineItems);
    this.insertLineItems(this.deniedChargeLineItems, this.deniedChargeLineItemControls, invoiceAmountDetail?.deniedChargeLineItems);
    this.insertLineItems(this.deletedChargeLineItems, this.deletedChargeLineItemControls, invoiceAmountDetail?.deletedChargeLineItems);
    this.insertDisputeLineItems(invoiceAmountDetail?.disputeLineItems);
    this.amountOfInvoiceControl.setValue(
      parseFloat(invoiceAmountDetail?.amountOfInvoice ?? '0'),
      {emitEvent: false}
    );
  }

  insertLineItems(items: FormArray, controls: AbstractControl[], lineItems?: CostLineItem[]): void {
    if (lineItems && lineItems.length > 0) {
      lineItems.forEach((lineItem) => {
        const quantityAssertion = lineItem.quantity !== null && lineItem.quantity !== undefined;
        const group = new FormGroup({
          attachment: new FormControl(lineItem.attachment ?? null),
          attachmentLink: new FormControl(lineItem.attachmentLink ?? null),
          accessorial: new FormControl(lineItem.accessorial ?? false),
          accessorialCode: new FormControl(lineItem.accessorialCode),
          uid: new FormControl(lineItem.uid),
          charge: new FormControl(lineItem.chargeCode),
          rateSource: new FormControl(lineItem.rateSource?.label ?? 'N/A'),
          rateSourcePair: new FormControl(lineItem.rateSource),
          entrySource: new FormControl(lineItem.entrySource?.label ?? 'N/A'),
          entrySourcePair: new FormControl(lineItem.entrySource),
          rate: new FormControl(lineItem.rateAmount ? `${lineItem.rateAmount}` : 'N/A'),
          type: new FormControl(lineItem.rateType ? lineItem.rateType : ''),
          quantity: new FormControl(quantityAssertion ? lineItem.quantity : 'N/A'),
          totalAmount: new FormControl(lineItem.chargeLineTotal || 0),
          requestStatus: new FormControl(lineItem.requestStatus?.label ?? 'N/A'),
          requestStatusPair: new FormControl(lineItem.requestStatus),
          message: new FormControl(lineItem.message ?? 'N/A'),
          createdBy: new FormControl(lineItem.createdBy ?? 'N/A'),
          createdDate: new FormControl(lineItem.createdDate ?? 'N/A'),
          closedBy: new FormControl(lineItem.closedBy ?? 'N/A'),
          closedDate: new FormControl(lineItem.closedDate ?? 'N/A'),
          carrierComment: new FormControl(lineItem.carrierComment ?? 'N/A'),
          responseComment: new FormControl(lineItem.responseComment ?? 'N/A'),
          rateResponse: new FormControl(lineItem.rateResponse ?? 'N/A'),
          autoApproved: new FormControl(lineItem.autoApproved ?? true),
          attachmentRequired: new FormControl(lineItem.attachmentRequired ?? false),
          planned: new FormControl(lineItem.planned ?? false),
          fuel: new FormControl(lineItem.fuel ?? false),
          manual: new FormControl(false),
          lineItemType: new FormControl(lineItem.lineItemType ?? null),
          variables: new FormControl(lineItem.variables ?? []),
          deletedDate: new FormControl(lineItem.deletedDate),
          persisted: new FormControl(lineItem.persisted),
        });
        group.get('rateSourcePair')?.valueChanges?.subscribe(
          value => group.get('rateSource')?.setValue(value?.label ?? 'N/A')
        );
        group.get('entrySourcePair')?.valueChanges?.subscribe(
          value => group.get('entrySource')?.setValue(value?.label ?? 'N/A')
        );
        group.get('requestStatusPair')?.valueChanges?.subscribe(
          value => group.get('requestStatus')?.setValue(value?.label ?? 'N/A')
        );
        controls.push(group);
      });
    }
  }

  insertDisputeLineItems(disputeLineItems?: DisputeLineItem[]): void {
    if (disputeLineItems && disputeLineItems.length > 0) {
      this.disputeLineItems = new FormArray([]);
      disputeLineItems.forEach((disputeLineItem) => {
        this.disputeLineItemControls.push(new FormGroup({
          comment: new FormControl(disputeLineItem.comment),
          attachment: new FormControl(disputeLineItem.attachment),
          createdDate: new FormControl(disputeLineItem.createdDate),
          createdBy: new FormControl(disputeLineItem.createdBy),
          disputeStatus: new FormControl(disputeLineItem.disputeStatus),
          responseComment: new FormControl(disputeLineItem.responseComment ? disputeLineItem.responseComment : 'N/A'),
          closedDate: new FormControl(disputeLineItem.closedDate ?? 'N/A'),
          closedBy: new FormControl(disputeLineItem.closedBy ?? 'N/A')
        }));
      });
    }
  }

  async onAddChargeButtonClick(): Promise<void> {
    let attachment;
    if (!this.isSpotQuote && this.costBreakdownOptions$.value.length === 0) {
      this.getAccessorialDetails.emit();
      // if we need to get the details, then we should wait until they are populated
      await this.costBreakdownOptions$.asObservable().pipe(first()).toPromise();
    }
    const filteredCostBreakdownOptions = this.filterCostBreakdownOptions(this.costBreakdownOptions$.value);
    const modalResponse = await this.utilService.openNewChargeModal({
      costBreakdownOptions: filteredCostBreakdownOptions
    }).pipe(first()).toPromise();
    if (modalResponse) {
      const newLineItemGroup = this.createEmptyLineItemGroup();
      this.costBreakdownItemsControls.push(newLineItemGroup);
      newLineItemGroup.get('charge')?.setValue(modalResponse.selected.name);
      newLineItemGroup.get('entrySourcePair')?.setValue({key: 'FREIGHT_PAY', label: 'FAL'});
      newLineItemGroup.get('requestStatusPair')?.setValue({key: 'ACCEPTED', label: 'Accepted'});
      newLineItemGroup.get('createdBy')?.setValue(this.userInfo?.email);

      console.log(this.costBreakdownItemsControls);
      if ('OTHER' === modalResponse.selected.name) {
        const variables = modalResponse.selected.variables ?? [];
        newLineItemGroup.get('totalAmount')?.setValue(variables[0]?.quantity);
        newLineItemGroup.get('toBeRated')?.setValue(false);
        newLineItemGroup.get('rate')?.setValue('N/A');
        newLineItemGroup.get('type')?.setValue('N/A');
        newLineItemGroup.get('quantity')?.setValue('N/A');
        newLineItemGroup.get('rateSourcePair')?.setValue({key: 'MANUAL', label: 'Manual'});
        newLineItemGroup.get('responseComment')?.setValue(modalResponse.comment);
        newLineItemGroup.get('variables')?.setValue(modalResponse.selected.variables);
        const otherCharges = this.costBreakdownItemsControls.filter(x => x.value.charge === 'OTHER');
        newLineItemGroup.get('uid')?.setValue(`OTHER${otherCharges.length}`);
      } else {
        newLineItemGroup.get('rateSourcePair')?.setValue({key: 'CONTRACT', label: 'Contract'});
        newLineItemGroup.get('accessorialCode')?.setValue(modalResponse.selected.accessorialCode);
        newLineItemGroup.get('uid')?.setValue(modalResponse.selected.accessorialCode);
        newLineItemGroup.get('lineItemType')?.setValue('ACCESSORIAL');
        newLineItemGroup.get('variables')?.setValue(modalResponse.selected.variables);
        this.pendingAccessorialCode = modalResponse.selected.accessorialCode;
      }

      if (modalResponse.file) {
        // The pending url is updated to the real once the invoice saved and the backend generates a filename with UUID.
        attachment = {url: 'pending'};
      } else {
        // no-file causes the html not to display a link.
        attachment = {url: 'no-file'};
      }

      newLineItemGroup.get('attachment')?.setValue(attachment);
      this.fileFormGroup.removeControl(newLineItemGroup.get('uid')?.value);
      this.fileFormGroup.addControl(newLineItemGroup.get('uid')?.value, new FormControl(modalResponse.file));
      this.rateEngineCall.emit(this.pendingAccessorialCode);
    }
  }

  addNewEmptyLineItem(): void {
    this.costBreakdownItemsControls.push(this.createEmptyLineItemGroup());
    if (this.costBreakdownOptions$.value.length === 0) {
      this.getAccessorialDetails.emit();
    }
  }

  createEmptyLineItemGroup(): FormGroup {
    const attachmentString = {url: 'no-file'};
    const attachment = new FormControl(attachmentString);
    const charge = new FormControl(null);
    const rateSource = new FormControl('');
    const rateSourcePair = new FormControl(null);
    const entrySource = new FormControl('');
    const entrySourcePair = new FormControl(null);
    const requestStatus = new FormControl('');
    const requestStatusPair = new FormControl(null);
    const createdDate = new FormControl(new Date().toISOString());
    const createdBy = new FormControl(null);
    const rate = new FormControl('N/A');
    const type = new FormControl('N/A');
    const quantity = new FormControl('N/A');
    const totalAmount = new FormControl(0);
    const message = new FormControl('');
    const manual = new FormControl(true);
    const expanded = new FormControl(false);
    const lineItemType = new FormControl(null);
    const accessorialCode = new FormControl(null);
    const uid = new FormControl(null);
    const autoApproved = new FormControl(true);
    const persisted = new FormControl(false);
    const responseComment = new FormControl(null);
    const variables = new FormControl([]);
    const file = new FormControl(null);
    const toBeRated = new FormControl(true);
    const group = new FormGroup({
      attachment, charge, rateSource, rateSourcePair,
      entrySource, entrySourcePair,
      requestStatus, requestStatusPair,
      createdDate, createdBy,
      rate, type, quantity, totalAmount,
      message, manual, expanded, lineItemType,
      accessorialCode, uid, autoApproved,
      variables, responseComment, file, persisted,
      toBeRated
    });
    group.get('rateSourcePair')?.valueChanges?.subscribe(
      value => group.get('rateSource')?.setValue(value?.label ?? 'N/A')
    );
    group.get('entrySourcePair')?.valueChanges?.subscribe(
      value => group.get('entrySource')?.setValue(value?.label ?? 'N/A')
    );
    return group;
  }

  onExpandCostLineItem(costLineItem: any): void {
    costLineItem.expanded = !costLineItem.expanded;
  }

  acceptCharge(costLineItem: any): void {
    const modalData: ConfirmationModalData = {
      title: 'Accept Charge',
      innerHtmlMessage: `Are you sure you want to accept this charge?
               <br/><br/><strong>This action cannot be undone.</strong>`,
      confirmButtonText: 'Accept Charge',
      cancelButtonText: 'Cancel'
    };
    const modalResult = this.displayPendingChargeModal(modalData, 'primary');
    this.handlePendingChargeResult(modalResult, costLineItem, 'Accepted');
  }

  denyCharge(costLineItem: any): void {
    const modalData: ConfirmationModalData = {
      title: 'Deny Charge',
      innerHtmlMessage: `Are you sure you want to deny this charge?
               <br/><br/><strong>This action cannot be undone.</strong>`,
      confirmButtonText: 'Deny Charge',
      cancelButtonText: 'Cancel'
    };
    const modalResult = this.displayPendingChargeModal(modalData, 'primary');
    this.handlePendingChargeResult(modalResult, costLineItem, 'Denied');
  }

  handlePendingChargeResult(modalResult: Observable<boolean | CommentModel>, costLineItem: any, action: string): void {
    modalResult.subscribe(result => {
      if (result) {
        const index = this.pendingChargeLineItemControls.findIndex(lineItem => lineItem.value.id === costLineItem.id);
        const pendingLineItem: AbstractControl | null = this.pendingChargeLineItems.get(index.toString());

        if (pendingLineItem !== null) {
          this.pendingChargeLineItems.removeAt(index);
          this.setPendingChargeResponse(action, pendingLineItem, result);
          if (action === 'Accepted') {
            this.costBreakdownItemsControls.push(pendingLineItem);
            this.costBreakdownItemsControls.sort((a, b) => {
              return a.get('step')?.value < b.get('step')?.value ? -1 : 1;
            });
          } else {
            this.deniedChargeLineItemControls.push(pendingLineItem);
          }
          this.rateEngineCall.emit(this.pendingAccessorialCode);
          // TODO stop using costBreakdownTotal calculated in UI, this should be a re-rate.
          this.amountOfInvoiceControl.setValue(this.costBreakdownTotal, {emitEvent: false});
          this.toastService.openSuccessToast(`Success. Charge was ${action.toLowerCase()}.`);
        }
      }
    });
  }

  setPendingChargeResponse(responseStatus: string, pendingLineItem: AbstractControl, result: CommentModel | boolean): void {
    pendingLineItem.patchValue({
        requestStatus: responseStatus,
        requestStatusPair: {key: responseStatus.toUpperCase(), label: responseStatus}
      }
    );
    if (typeof result !== 'boolean') {
      pendingLineItem.get('responseComment')?.setValue(result.comment || 'N/A');
    }
    pendingLineItem.get('closedDate')?.setValue(new Date().toISOString());
    pendingLineItem.get('closedBy')?.setValue(this.userInfo?.email);
  }

  displayPendingChargeModal(modalData: ConfirmationModalData, confirmButtonStyle: string): Observable<CommentModel | boolean> {
    return this.utilService.openCommentModal({
      ...modalData,
      commentSectionFieldName: 'Response Comment',
      requireField: modalData.title === 'Deny Charge',
      confirmButtonStyle: confirmButtonStyle
    });
  }

  async onEditCostLineItem(costLineItem: AbstractControl, costLineItems: AbstractControl[]): Promise<void> {
    const editChargeDetails = await this.utilService.openEditChargeModal({
      costLineItem
    }).pipe(first()).toPromise();
    if (editChargeDetails) {
      const existingCostLineItem = costLineItems.find(lineItem => editChargeDetails.uid === lineItem.value?.uid);
      if (existingCostLineItem) {
        if (existingCostLineItem.value.charge === 'OTHER') {
          existingCostLineItem.patchValue({
            totalAmount: editChargeDetails.variables[0].quantity
          });
        }
        this.toastService.openSuccessToast(`Success. Variables have been updated for the line item.`);
        existingCostLineItem.patchValue({
          variables: editChargeDetails.variables
        });
        existingCostLineItem.markAsDirty();
        this.pendingAccessorialCode = costLineItem.value.accessorialCode;
        let attachment;

        if (editChargeDetails.file) {
          // The pending url is updated to the real once the invoice saved and the backend generates a filename with UUID.
          attachment = {url: 'pending'};
          existingCostLineItem.get('attachment')?.setValue(attachment);
        } else if (!editChargeDetails.file && !existingCostLineItem?.value?.attachment?.fileName) {
          // no-file causes the html not to display a link.
          attachment = {url: 'no-file'};
          existingCostLineItem.get('attachment')?.setValue(attachment);
        }

        this.rateEngineCall.emit(this.pendingAccessorialCode);
        // @ts-ignore
        this.fileFormGroup.removeControl(editChargeDetails.uid);
        // @ts-ignore
        this.fileFormGroup.addControl(editChargeDetails.uid, new FormControl(editChargeDetails.file));

      }
    }
  }

  async onDeleteCostLineItem(costLineItem: any, index: number): Promise<void> {
    if (costLineItem.value.persisted || costLineItem.value.entrySource !== 'FAL') {
      const dialogResult = await this.utilService.openCommentModal({
        title: 'Delete Charge',
        innerHtmlMessage: `Are you sure you want to delete this charge?
               <br/><br/><strong>This action cannot be undone.</strong>`,
        confirmButtonText: 'Delete Charge',
        confirmButtonStyle: 'primary',
        cancelButtonText: 'Cancel',
        commentSectionFieldName: 'Reason for Deletion',
        requireField: true
      }).pipe(first()).toPromise();
      if (dialogResult) {
        const existingCostLineItem: AbstractControl | null = this.costBreakdownItems.get(index.toString());

        if (existingCostLineItem) {
          this.costBreakdownItems.removeAt(index);
          this.deletedChargeLineItemControls.push(existingCostLineItem);

          this.reorderOtherCharges();

          this.toastService.openSuccessToast(`Success. Line item has been deleted.`);
          existingCostLineItem.patchValue({
            responseComment: dialogResult.comment,
            requestStatus: 'Deleted',
            requestStatusPair: {key: 'DELETED', label: 'Deleted'},
            deletedDate: new Date().toISOString()
          });
          this.pendingAccessorialCode = costLineItem.value.accessorialCode;
          this.rateEngineCall.emit(this.pendingAccessorialCode);
        }
      }
    } else {
      this.costBreakdownItems.removeAt(index);
      this.reorderOtherCharges();
      this.pendingAccessorialCode = costLineItem.value.accessorialCode;
      this.rateEngineCall.emit(this.pendingAccessorialCode);
    }
  }

  /**
   * Removes already selected accessorials from the selectable list of options.
   * Appends option 'OTHER' since it should always be available, but is not returned from backend.
   */
  filterCostBreakdownOptions(originalList: Array<SelectOption<CalcDetail>>): Array<SelectOption<CalcDetail>> {
    const filteredList = originalList.filter(
      opt => this.costBreakdownItemsControls.every(
        control => !this.costBreakdownOptionMatchesControl(opt, control)
      ) && this.pendingChargeLineItemControls.every(
        control => !this.costBreakdownOptionMatchesControl(opt, control)
      )
    );
    filteredList.push(CostBreakDownUtils.toOption({
      name: 'OTHER',
      accessorialCode: 'OTHER',
      variables: [{
        variable: 'Amount',
        quantity: 0.00
      }]
    }));
    return filteredList;
  }

  costBreakdownOptionMatchesControl(opt: SelectOption<CalcDetail>, control: AbstractControl): boolean {
    const chargeValue = control.get('charge')?.value;
    return chargeValue.accessorialCode === opt.value.accessorialCode
      || chargeValue === opt.label;
  }

  resolveDispute(action: string, disputeLineItem: any): void {
    const dialogResult: Observable<any> =
      this.utilService.openCommentModal({
        title: `${action} Dispute`,
        innerHtmlMessage: `Are you sure you want to ${action.toLowerCase()} this dispute?
               <br/><br/><strong>This action cannot be undone.</strong>`,
        confirmButtonText: `${action} Dispute`,
        confirmButtonStyle: 'primary',
        cancelButtonText: 'Cancel',
        commentSectionFieldName: 'Response Comment',
        requireField: action === 'Deny'
      });
    dialogResult.subscribe(result => {
      if (result) {
        disputeLineItem.patchValue({
          closedBy: this.userInfo!.email,
          closedDate: new Date().toISOString(),
          responseComment: result.comment || 'N/A',
          disputeStatus: action === 'Accept' ? {key:'ACCEPTED', label: 'Accepted'}
            : {key:'DENIED', label: 'Denied'}
        });
        this.toastService.openSuccessToast(`Success, dispute was closed.`);
      }
    });
  }

  public downloadAttachment(url: string): void {
    if (url) {
      window.open(url);
    }
  }

  public editableField(lineItem: any): boolean {
    return lineItem.quantity !== 'N/A'
      && lineItem.entrySource !== 'AUTO';
  }

  private reorderOtherCharges(): void {
    const otherCharges = this.costBreakdownItemsControls.filter(x => x.value.charge === 'OTHER');
    if (otherCharges.length > 0) {
      otherCharges.forEach((charge, i) => {
        charge.get('uid')?.setValue(`OTHER${i + 1}`);
      });
    }
  }

}
