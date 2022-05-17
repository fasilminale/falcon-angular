import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {FalRadioOption} from 'src/app/components/fal-radio-input/fal-radio-input.component';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {CostLineItem, DisputeLineItem} from 'src/app/models/line-item/line-item-model';
import {SubscriptionManager, SUBSCRIPTION_MANAGER} from 'src/app/services/subscription-manager';
import {CalcDetail, CostBreakDownUtils, RateDetailResponse, RatesResponse} from '../../../models/rate-engine/rate-engine-request';
import {first, map} from 'rxjs/operators';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {InvoiceOverviewDetail} from '../../../models/invoice/invoice-overview-detail.model';
import {ConfirmationModalData, ElmFormHelper, SubjectValue, ToastService} from '@elm/elm-styleguide-ui';
import {CommentModel, UtilService} from '../../../services/util-service';
import {UserService} from '../../../services/user-service';
import {UserInfoModel} from '../../../models/user-info/user-info-model';

@Component({
  selector: 'app-invoice-amount',
  templateUrl: './invoice-amount.component.html',
  styleUrls: ['./invoice-amount.component.scss']
})
export class InvoiceAmountComponent implements OnInit {

  public readonly dateFormat = 'MM-dd-YYYY';
  public readonly ellipsisPipeLimit = 10;

  _formGroup = new FormGroup({});
  amountOfInvoiceControl = new FormControl();
  isValidCostBreakdownAmount = true;
  isPrepaid?: boolean;

  public paymentTermOptions: Array<FalRadioOption> = [
    {value: 'Z000', display: 'Pay Immediately'},
    {value: 'ZN14', display: 'Pay in 14 days'}
  ];
  public currencyOptions = [
    {label: 'USD', value: 'USD', disabled: false},
    {label: 'CAD', value: 'CAD', disabled: false}
  ];
  public costBreakdownTypes = [
    {display: 'Per hour', value: 'PERHOUR'},
    {display: 'Flat', value: 'Flat'},
    {display: 'Per mile', value: 'PERMILE'},
    {display: 'Percent', value: 'Percentage'},
    {display: 'N/A', value: ''}];
  public overridePaymentTermsOptions = [
    {label: 'Override Standard Payment Terms', value: 'override', disabled: false}
  ];
  isPaymentOverrideSelected = new FormArray([]);
  overridePaymentTermsFormGroup = new FormGroup({
    isPaymentOverrideSelected: this.isPaymentOverrideSelected,
    paymentTerms: new FormControl('')
  });

  public costBreakdownOptions$: SubjectValue<Array<SelectOption<CalcDetail>>> = new SubjectValue<Array<SelectOption<CalcDetail>>>([]);
  public filteredCostBreakdownOptions: Array<SelectOption<CalcDetail>> = [];

  readOnlyForm = true;
  costBreakdownItems = new FormArray([]);
  pendingChargeLineItems = new FormArray([]);
  deniedChargeLineItems = new FormArray([]);
  disputeLineItems = new FormArray([]);
  pendingAccessorialCode = '';
  @Input() userInfo: UserInfoModel | undefined = new UserInfoModel();

  @Output() rateEngineCall: EventEmitter<string> = new EventEmitter<string>();
  @Output() getAccessorialDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() resolveDisputeCall: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager,
              private utilService: UtilService,
              private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.setUpOverrideStandardPaymentTermsSubscription();
    this.enableDisableOverrideStandardPaymentTerms(true);
    this.enableDisableCurrency(true);
  }

  setUpOverrideStandardPaymentTermsSubscription(): void {
    this.subscriptionManager.manage(this.isPaymentOverrideSelected.valueChanges
      .subscribe((selected: string) => {
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

  @Input() set chargeLineItemOptions$(observable: Observable<RateDetailResponse>) {
    this.subscriptionManager.manage(observable.pipe(
      map(response => {
        return CostBreakDownUtils.toOptions(response.calcDetails);
      })
    ).subscribe(
      opts => {
        this.costBreakdownOptions$.value = opts;
      }
    ));
  }

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => {
        this.readOnlyForm = !isEditMode;
        this.enableDisableOverrideStandardPaymentTerms(this.readOnlyForm);
        this.enableDisableCurrency(this.readOnlyForm);
      }
    ));
  }

  @Input() set loadInvoiceOverviewDetail$(observable: Observable<InvoiceOverviewDetail>) {
    this.subscriptionManager.manage(observable.subscribe(
      invoiceOverviewDetail => this.isPrepaid = invoiceOverviewDetail.freightPaymentTerms === 'PREPAID'
    ));
  }

  @Input() set formGroup(givenFormGroup: FormGroup) {
    givenFormGroup.setControl('amountOfInvoice', new FormControl('', [Validators.required]));
    givenFormGroup.setControl('currency', new FormControl(''));
    givenFormGroup.setControl('overridePaymentTerms', this.overridePaymentTermsFormGroup);
    givenFormGroup.setControl('paymentTerms', new FormControl(''));
    givenFormGroup.setControl('mileage', new FormControl());
    this.insertLineItems(this.costBreakdownItems, this.costBreakdownItemsControls);
    givenFormGroup.setControl('costBreakdownItems', this.costBreakdownItems);
    this.insertLineItems(this.pendingChargeLineItems, this.pendingChargeLineItemControls);
    givenFormGroup.setControl('pendingChargeLineItems', this.pendingChargeLineItems);
    this.insertLineItems(this.deniedChargeLineItems, this.deniedChargeLineItemControls);
    givenFormGroup.setControl('deniedChargeLineItems', this.deniedChargeLineItems);
    this.insertDisputeLineItems();
    givenFormGroup.setControl('disputeLineItems', this.disputeLineItems);
    this._formGroup = givenFormGroup;
  }

  /**
   *  Applies the response from rate engine to the pending accessorial that is expecting
   *  the response from rate engine.
   */
  @Input() set rateEngineCallResult$(observable: Observable<RatesResponse>) {
    this.subscriptionManager.manage(observable.subscribe(rateEngineResult => {
      const carrierSummary = rateEngineResult.carrierRateSummaries[0];
      const leg = carrierSummary.legs[0];
      // Check if accessorial code is contained in the description of the response
      const accessorial = leg.carrierRate.lineItems.find(item => item.accessorial
        && item.description.substr(0, 3) === this.pendingAccessorialCode);

      // If a match is found, update the pending line item with information from the response
      if (accessorial) {
        for (const control of this.costBreakdownItemsControls) {
          if (control.value?.charge?.accessorialCode === this.pendingAccessorialCode) {
            control.patchValue({
              rate: accessorial.rate,
              type: accessorial.rateType,
              totalAmount: accessorial.lineItemTotal,
              message: accessorial.message
            });
          }
        }
        // Update invoice total and available accessorial options
        this._formGroup.get('amountOfInvoice')?.setValue(this.costBreakdownTotal);
      }
    }));
  }

  loadForm(givenFormGroup: FormGroup, invoiceAmountDetail?: InvoiceAmountDetail): void {
    givenFormGroup.get('amountOfInvoice')?.setValue(invoiceAmountDetail?.amountOfInvoice ?? '');
    givenFormGroup.get('currency')?.setValue(invoiceAmountDetail?.currency ?? '');
    if (!!invoiceAmountDetail?.standardPaymentTermsOverride) {
      ElmFormHelper.checkCheckbox(this.isPaymentOverrideSelected,
        this.overridePaymentTermsOptions[0], true);
    }
    this.overridePaymentTermsFormGroup.controls.paymentTerms.setValue(invoiceAmountDetail?.standardPaymentTermsOverride ?? '');

    givenFormGroup.get('mileage')?.setValue(invoiceAmountDetail?.mileage ?? '');
    (givenFormGroup.get('costBreakdownItems') as FormArray).clear();
    (givenFormGroup.get('pendingChargeLineItems') as FormArray).clear();
    (givenFormGroup.get('disputeLineItems') as FormArray).clear();
    this.insertLineItems(this.costBreakdownItems, this.costBreakdownItemsControls, invoiceAmountDetail?.costLineItems);
    this.insertLineItems(this.pendingChargeLineItems, this.pendingChargeLineItemControls, invoiceAmountDetail?.pendingChargeLineItems);
    this.insertLineItems(this.deniedChargeLineItems, this.deniedChargeLineItemControls, invoiceAmountDetail?.deniedChargeLineItems);
    this.insertDisputeLineItems(invoiceAmountDetail?.disputeLineItems);
  }

  insertLineItems(items: FormArray, controls: AbstractControl[], lineItems?: CostLineItem[]): void {
    if (lineItems && lineItems.length > 0) {
      items = new FormArray([]);
      lineItems.forEach((lineItem) => {
        controls.push(new FormGroup({
          attachment: new FormControl(lineItem.attachment ?? null),
          accessorial: new FormControl(lineItem.accessorial ?? false),
          charge: new FormControl(lineItem.chargeCode),
          rateSource: new FormControl(lineItem.rateSource?.label ?? 'N/A'),
          entrySource: new FormControl(lineItem.entrySource?.label ?? 'N/A'),
          rate: new FormControl(lineItem.rateAmount ? `${lineItem.rateAmount}` : 'N/A'),
          type: new FormControl(lineItem.rateType ? lineItem.rateType : ''),
          quantity: new FormControl(lineItem.quantity ? lineItem.quantity : 'N/A'),
          totalAmount: new FormControl(lineItem.chargeLineTotal || 0),
          requestStatus: new FormControl(lineItem.requestStatus?.label ?? 'N/A'),
          message: new FormControl(lineItem.message ?? 'N/A'),
          createdBy: new FormControl(lineItem.createdBy ?? 'N/A'),
          createdDate: new FormControl(lineItem.createdDate ?? 'N/A'),
          closedBy: new FormControl(lineItem.closedBy ?? 'N/A'),
          closedDate: new FormControl(lineItem.closedDate ?? 'N/A'),
          carrierComment: new FormControl(lineItem.carrierComment ?? 'N/A'),
          responseComment: new FormControl(lineItem.responseComment ?? 'N/A'),
          rateResponse: new FormControl(lineItem.rateResponse ?? 'N/A'),
          autoApproved: new FormControl(lineItem.autoApproved ?? false),
          attachmentRequired: new FormControl(lineItem.attachmentRequired ?? false),
          planned: new FormControl(lineItem.planned ?? false),
          fuel: new FormControl(lineItem.planned ?? false),
          manual: new FormControl(false)
        }));
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

  get costBreakdownTotal(): number {
    let totalAmount = 0;
    this.costBreakdownItemsControls.forEach(c => {
      if (c?.get('totalAmount')?.value) {
        totalAmount += parseFloat(c?.get('totalAmount')?.value);
      }
    });
    const invoiceNetAmount = this._formGroup.get('amountOfInvoice')?.value;
    this.isValidCostBreakdownAmount = parseFloat(invoiceNetAmount) > 0
      && totalAmount.toFixed(2) === parseFloat(invoiceNetAmount).toFixed(2);
    return totalAmount;
  }

  get contractedRateTotal(): number {
    let totalAmount = 0;
    this.costBreakdownItemsControls.forEach(c => {
      if (c?.get('totalAmount')?.value
        && c?.get('rateSource')?.value === 'Contract') {
        totalAmount += parseFloat(c?.get('totalAmount')?.value);
      }
    });
    return totalAmount;
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
    this.subscriptionManager.manage(observable.subscribe(
      invoiceAmountDetail => this.loadForm(this._formGroup, invoiceAmountDetail)
    ));
  }

  get hasMileage(): boolean {
    return !!this._formGroup?.get('mileage')?.value;
  }

  async onAddChargeButtonClick(): Promise<void> {
    if (this.costBreakdownOptions$.value.length === 0) {
      this.getAccessorialDetails.emit();
      // if we need to get the details, then we should wait until they are populated
      await this.costBreakdownOptions$.asObservable().pipe(first()).toPromise();
    }
    const filteredCostBreakdownOptions = this.filterCostBreakdownOptions(this.costBreakdownOptions$.value);
    const newChargeDetails = await this.utilService.openNewChargeModal({
      costBreakdownOptions: filteredCostBreakdownOptions
    }).pipe(first()).toPromise();
    if (newChargeDetails) {
      // TODO still need to save the comment from newChargeDetails on the invoice somewhere...
      const newLineItemGroup = this.createEmptyLineItemGroup();
      this.costBreakdownItemsControls.push(newLineItemGroup);
      newLineItemGroup.get('charge')?.setValue(newChargeDetails.selected.name);
      if ('OTHER' === newChargeDetails.selected.name) {
        const variables = newChargeDetails.selected.variables ?? [];
        newLineItemGroup.get('totalAmount')?.setValue(variables[0]?.quantity);
        newLineItemGroup.get('rateSource')?.setValue('Manual');
        this._formGroup.get('amountOfInvoice')?.setValue(this.costBreakdownTotal);
      } else {
        // FIXME in FAL-547
        newLineItemGroup.get('rateSource')?.setValue('Contract');
        this.pendingAccessorialCode = newChargeDetails.selected.accessorialCode;
        this.rateEngineCall.emit(this.pendingAccessorialCode);
      }
    }
  }

  addNewEmptyLineItem(): void {
    this.costBreakdownItemsControls.push(this.createEmptyLineItemGroup());
    if (this.costBreakdownOptions$.value.length === 0) {
      this.getAccessorialDetails.emit();
    }
  }

  createEmptyLineItemGroup(): FormGroup {
    const charge = new FormControl(null);
    const rateSource = new FormControl('');
    const rate = new FormControl('N/A');
    const type = new FormControl('N/A');
    const quantity = new FormControl('N/A');
    const totalAmount = new FormControl(0);
    const message = new FormControl('');
    const manual = new FormControl(true);
    const expanded = new FormControl(false);

    return new FormGroup({charge, rateSource, rate, type, quantity, totalAmount, message, manual});
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
      confirmButtonStyle: 'primary',
      cancelButtonText: 'Cancel'
    };
    this.displayPendingChargeModal(modalData).subscribe(result => {
      if (result) {
        const index = this.pendingChargeLineItemControls.findIndex(lineItem => lineItem.value.charge === costLineItem.charge);
        const pendingLineItem: AbstractControl | null = this.pendingChargeLineItems.get(index.toString());

        if (pendingLineItem !== null) {
          this.pendingChargeLineItems.removeAt(index);
          this.setPendingChargeResponse('Accepted', pendingLineItem, result);
          this.costBreakdownItemsControls.push(pendingLineItem);
          this._formGroup.get('amountOfInvoice')?.setValue(this.costBreakdownTotal);
          this.toastService.openSuccessToast(`Success. Charge was approved.`);
        }
      }
    });
  }

  denyCharge(costLineItem: any): void {
    const modalData: ConfirmationModalData = {
      title: 'Deny Charge',
      innerHtmlMessage: `Are you sure you want to deny this charge?
               <br/><br/><strong>This action cannot be undone.</strong>`,
      confirmButtonText: 'Deny Charge',
      confirmButtonStyle: 'destructive',
      cancelButtonText: 'Cancel'
    };
    this.displayPendingChargeModal(modalData).subscribe(result => {
      if (result) {
        const index = this.pendingChargeLineItemControls.findIndex(lineItem => lineItem.value.charge === costLineItem.charge);
        const pendingLineItem: AbstractControl | null = this.pendingChargeLineItems.get(index.toString());

        if (pendingLineItem !== null) {
          this.pendingChargeLineItems.removeAt(index);
          this.setPendingChargeResponse('Denied', pendingLineItem, result);
          this.deniedChargeLineItemControls.push(pendingLineItem);
          this._formGroup.get('amountOfInvoice')?.setValue(this.costBreakdownTotal);
          this.toastService.openSuccessToast(`Success. Charge was denied.`);
        }
      }
    });
  }

  private setPendingChargeResponse(responseStatus: string, pendingLineItem: AbstractControl, result: CommentModel | boolean): void {
    pendingLineItem.get('requestStatus')?.setValue(responseStatus);
    if (typeof result !== 'boolean') {
      pendingLineItem.get('responseComment')?.setValue(result.comment);
    }
    pendingLineItem.get('closedDate')?.setValue(Date.now());
    pendingLineItem.get('closedBy')?.setValue(this.userInfo?.email);
  }

  private displayPendingChargeModal(modalData: ConfirmationModalData): Observable<CommentModel | boolean> {
    const dialogResult: Observable<CommentModel | boolean> =
      this.utilService.openCommentModal({
        ...modalData,
        commentSectionFieldName: 'Response Comment',
        requireField: modalData.title === 'Deny Charge'
      });
    return dialogResult;
  }

  /**
   * TODO remove this deprecated method once it is safe to do so.
   * @deprecated
   *  Calls rate engine for rate information to an accessorial.
   *  Rate Management is not called if 'OTHER' is selected.
   */
  onSelectRate(value: any, lineItem: AbstractControl): void {
    lineItem.patchValue({rate: null, type: null, quantity: 0, totalAmount: 0});
    this._formGroup.get('amountOfInvoice')?.setValue(this.costBreakdownTotal);
    const lineItemFormGroup = (lineItem as FormGroup);
    if (value.accessorialCode === 'OTHER') {
      lineItemFormGroup.get('rateSource')?.setValue('Manual');
      lineItemFormGroup.get('rate')?.setValue('N/A');
      lineItemFormGroup.get('type')?.setValue('N/A');
      lineItemFormGroup.get('quantity')?.setValue('N/A');
      lineItemFormGroup.get('totalAmount')?.valueChanges
        .subscribe(() => this.amountOfInvoiceControl.setValue(this.costBreakdownTotal));
    } else {
      lineItemFormGroup.get('rateSource')?.setValue('Contract');
      this.pendingAccessorialCode = value.accessorialCode;
      this.rateEngineCall.emit(value.accessorialCode);
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

  resolveDispute(action: string): void {
    this.resolveDisputeCall.emit(action);
  }

  public downloadAttachment(url: string): void {
    if (url) {
      window.open(url);
    }
  }

}
