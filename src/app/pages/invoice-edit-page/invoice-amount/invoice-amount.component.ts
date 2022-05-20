import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {FalRadioOption} from 'src/app/components/fal-radio-input/fal-radio-input.component';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {CostLineItem, DisputeLineItem} from 'src/app/models/line-item/line-item-model';
import {SubscriptionManager, SUBSCRIPTION_MANAGER} from 'src/app/services/subscription-manager';
import {CalcDetail, CostBreakDownUtils, RateDetailResponse, RatesResponse} from '../../../models/rate-engine/rate-engine-request';
import {first, map} from 'rxjs/operators';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {InvoiceOverviewDetail} from '../../../models/invoice/invoice-overview-detail.model';
import {ElmFormHelper, SubjectValue} from '@elm/elm-styleguide-ui';
import {UtilService} from '../../../services/util-service';

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
  disputeLineItems = new FormArray([]);
  pendingAccessorialCode = '';

  @Output() rateEngineCall: EventEmitter<string> = new EventEmitter<string>();
  @Output() getAccessorialDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() resolveDisputeCall: EventEmitter<any> = new EventEmitter<any>();

  rateEngineCallResponse: Subscription = new Subscription();
  chargeLineItemOptionsSubscription: Subscription = new Subscription();
  updateIsEditModeSubscription: Subscription = new Subscription();
  loadInvoiceOverviewDetailSubscription: Subscription = new Subscription();

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager,
              private utilService: UtilService) {
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

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.updateIsEditModeSubscription.unsubscribe();
    this.updateIsEditModeSubscription = observable.subscribe(
      isEditMode => {
        this.readOnlyForm = !isEditMode;
        this.enableDisableOverrideStandardPaymentTerms(this.readOnlyForm);
        this.enableDisableCurrency(this.readOnlyForm);
      }
    );
  }

  @Input() set loadInvoiceOverviewDetail$(observable: Observable<InvoiceOverviewDetail>) {
    this.loadInvoiceOverviewDetailSubscription.unsubscribe();
    this.loadInvoiceOverviewDetailSubscription = observable.subscribe(
      invoiceOverviewDetail => this.isPrepaid = invoiceOverviewDetail.freightPaymentTerms === 'PREPAID'
    );
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
    this.insertDisputeLineItems();
    givenFormGroup.setControl('disputeLineItems', this.disputeLineItems);
    this._formGroup = givenFormGroup;
  }

  // /**
  //  *  Applies the response from rate engine to the pending accessorial that is expecting
  //  *  the response from rate engine.
  //  */
  // @Input() set rateEngineCallResult$(observable: Observable<RatesResponse>) {
  //   this.rateEngineCallResponse.unsubscribe();
  //   this.rateEngineCallResponse = observable.subscribe(rateEngineResult => {
  //     console.log('RECEIVED RATE ENGINE RESPONSE', rateEngineResult);
  //     const carrierSummary = rateEngineResult.carrierRateSummaries[0];
  //     const leg = carrierSummary.legs[0];
  //     // Check if accessorial code is contained in the description of the response
  //     const accessorial = leg.carrierRate.lineItems.find(item => item.accessorial
  //       && item.description.substr(0, 3) === this.pendingAccessorialCode);
  //
  //     // If a match is found, update the pending line item with information from the response
  //     if (accessorial) {
  //       console.log('found accessorial');
  //       console.log('controls: ', this.costBreakdownItems.controls.map(c => c.get('charge')?.value));
  //       for (const control of this.costBreakdownItems.controls) {
  //         const chargeValue = control.get('charge')?.value;
  //         if (chargeValue.accessorialCode === this.pendingAccessorialCode) {
  //           console.log('found control');
  //           control.patchValue({
  //             rate: accessorial.rate,
  //             type: accessorial.rateType,
  //             totalAmount: accessorial.lineItemTotal,
  //             message: accessorial.message
  //           });
  //         }
  //       }
  //       // Update invoice total and available accessorial options
  //       this._formGroup.get('amountOfInvoice')?.setValue(this.costBreakdownTotal);
  //     }
  //     console.log('END RATE ENGINE RESPONSE');
  //   });
  // }

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
    this.insertDisputeLineItems(invoiceAmountDetail?.disputeLineItems);
  }

  insertLineItems(items: FormArray, controls: AbstractControl[], lineItems?: CostLineItem[]): void {
    if (lineItems && lineItems.length > 0) {
      lineItems.forEach((lineItem) => {
        const group = new FormGroup({
          accessorial: new FormControl(lineItem.accessorial ?? false),
          accessorialCode: new FormControl(lineItem.accessorialCode),
          charge: new FormControl(lineItem.chargeCode),
          rateSource: new FormControl(lineItem.rateSource?.label ?? 'N/A'),
          rateSourcePair: new FormControl(lineItem.rateSource),
          entrySource: new FormControl(lineItem.entrySource?.label ?? 'N/A'),
          entrySourcePair: new FormControl(lineItem.entrySource),
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
          autoApproved: new FormControl(lineItem.autoApproved ?? true),
          attachmentRequired: new FormControl(lineItem.attachmentRequired ?? false),
          planned: new FormControl(lineItem.planned ?? false),
          fuel: new FormControl(lineItem.fuel ?? false),
          manual: new FormControl(false),
          lineItemType: new FormControl(lineItem.lineItemType ?? null)
        });
        group.get('rateSourcePair')?.valueChanges?.subscribe(
          value => group.get('rateSource')?.setValue(value?.label ?? 'N/A')
        );
        group.get('entrySourcePair')?.valueChanges?.subscribe(
          value => group.get('entrySource')?.setValue(value?.label ?? 'N/A')
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

  get costBreakdownItemsControls(): AbstractControl[] {
    return this.costBreakdownItems.controls;
  }

  get pendingChargeLineItemControls(): AbstractControl[] {
    return this._formGroup.get('pendingChargeLineItems')
      ? (this._formGroup.get('pendingChargeLineItems') as FormArray).controls
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
    const modalResponse = await this.utilService.openNewChargeModal({
      costBreakdownOptions: filteredCostBreakdownOptions
    }).pipe(first()).toPromise();
    if (modalResponse) {
      // TODO still need to save the comment from newChargeDetails on the invoice somewhere...
      const newLineItemGroup = this.createEmptyLineItemGroup();
      this.costBreakdownItemsControls.push(newLineItemGroup);
      newLineItemGroup.get('charge')?.setValue(modalResponse.selected.name);
      if ('OTHER' === modalResponse.selected.name) {
        const variables = modalResponse.selected.variables ?? [];
        newLineItemGroup.get('totalAmount')?.setValue(variables[0]?.quantity);
        newLineItemGroup.get('rate')?.setValue('N/A');
        newLineItemGroup.get('type')?.setValue('N/A');
        newLineItemGroup.get('quantity')?.setValue('N/A');
        newLineItemGroup.get('rateSourcePair')?.setValue({key: 'MANUAL', label: 'Manual'});
        this._formGroup.get('amountOfInvoice')?.setValue(this.costBreakdownTotal);
      } else {
        // FIXME in FAL-547
        newLineItemGroup.get('rateSourcePair')?.setValue({key: 'CONTRACT', label: 'Contract'});
        newLineItemGroup.get('accessorialCode')?.setValue(modalResponse.selected.accessorialCode);
        newLineItemGroup.get('lineItemType')?.setValue('ACCESSORIAL');
        this.pendingAccessorialCode = modalResponse.selected.accessorialCode;
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
    const rateSourcePair = new FormControl(null);
    const rate = new FormControl('N/A');
    const type = new FormControl('N/A');
    const quantity = new FormControl('N/A');
    const totalAmount = new FormControl(0);
    const message = new FormControl('');
    const manual = new FormControl(true);
    const expanded = new FormControl(false);
    const lineItemType = new FormControl(null);
    const accessorialCode = new FormControl(null);
    const autoApproved = new FormControl(true);
    const group = new FormGroup({
      charge, rateSource, rateSourcePair,
      rate, type, quantity, totalAmount,
      message, manual, expanded, lineItemType,
      accessorialCode, autoApproved
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
}
