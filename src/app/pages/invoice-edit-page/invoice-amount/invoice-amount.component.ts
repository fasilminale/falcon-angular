import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {FalRadioOption} from 'src/app/components/fal-radio-input/fal-radio-input.component';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {CostLineItem, DisputeLineItem} from 'src/app/models/line-item/line-item-model';
import {SubscriptionManager, SUBSCRIPTION_MANAGER} from 'src/app/services/subscription-manager';
import {CalcDetail, CostBreakDownUtils, RateDetailResponse} from '../../../models/rate-engine/rate-engine-request';
import {first, map} from 'rxjs/operators';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {InvoiceOverviewDetail} from '../../../models/invoice/invoice-overview-detail.model';
import {ConfirmationModalData, ElmFormHelper, SubjectValue, ToastService} from '@elm/elm-styleguide-ui';
import {CommentModel, UtilService} from '../../../services/util-service';
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
  @Input() userInfo: UserInfoModel | undefined = new UserInfoModel();

  @Output() rateEngineCall: EventEmitter<string> = new EventEmitter<string>();
  @Output() getAccessorialDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() resolveDisputeCall: EventEmitter<any> = new EventEmitter<any>();

  chargeLineItemOptionsSubscription: Subscription = new Subscription();
  updateIsEditModeSubscription: Subscription = new Subscription();
  loadInvoiceOverviewDetailSubscription: Subscription = new Subscription();

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
    this.insertLineItems(this.deniedChargeLineItems, this.deniedChargeLineItemControls);
    givenFormGroup.setControl('deniedChargeLineItems', this.deniedChargeLineItems);
    this.insertLineItems(this.deletedChargeLineItems, this.deletedChargeLineItemControls);
    givenFormGroup.setControl('deletedChargeLineItems', this.deletedChargeLineItems);
    this.insertDisputeLineItems();
    givenFormGroup.setControl('disputeLineItems', this.disputeLineItems);
    this._formGroup = givenFormGroup;
  }

  loadForm(givenFormGroup: FormGroup, invoiceAmountDetail?: InvoiceAmountDetail): void {
    givenFormGroup.get('amountOfInvoice')?.setValue(this.costBreakdownTotal ?? '');
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
    this.insertLineItems(this.deletedChargeLineItems, this.deletedChargeLineItemControls, invoiceAmountDetail?.deletedChargeLineItems);
    this.insertDisputeLineItems(invoiceAmountDetail?.disputeLineItems);
  }

  insertLineItems(items: FormArray, controls: AbstractControl[], lineItems?: CostLineItem[]): void {
    if (lineItems && lineItems.length > 0) {
      lineItems.forEach((lineItem) => {
        const group = new FormGroup({
          attachment: new FormControl(lineItem.attachment ?? null),
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
          variables: new FormControl(lineItem.variables ?? [])
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
    console.log('---------------------');
    let totalAmount = 0;
    this.costBreakdownItemsControls
      .filter(c => !!c)
      .forEach(c => {
        if (c.get('totalAmount')?.value) {
          totalAmount += parseFloat(c.get('totalAmount')?.value);
          console.log('---------------------2');
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
      const newLineItemGroup = this.createEmptyLineItemGroup();
      this.costBreakdownItemsControls.push(newLineItemGroup);
      newLineItemGroup.get('charge')?.setValue(modalResponse.selected.name);
      newLineItemGroup.get('entrySourcePair')?.setValue({key: 'FREIGHT_PAY', label: 'FAL'});
      newLineItemGroup.get('requestStatusPair')?.setValue({key: 'ACCEPTED', label: 'Accepted'});
      newLineItemGroup.get('createdBy')?.setValue(this.userInfo?.email);
      if ('OTHER' === modalResponse.selected.name) {
        const variables = modalResponse.selected.variables ?? [];
        newLineItemGroup.get('totalAmount')?.setValue(variables[0]?.quantity);
        newLineItemGroup.get('rate')?.setValue('N/A');
        newLineItemGroup.get('type')?.setValue('N/A');
        newLineItemGroup.get('quantity')?.setValue('N/A');
        newLineItemGroup.get('rateSourcePair')?.setValue({key: 'MANUAL', label: 'Manual'});
        newLineItemGroup.get('responseComment')?.setValue(modalResponse.comment);
        this._formGroup.get('amountOfInvoice')?.setValue(this.costBreakdownTotal);
      } else {
        newLineItemGroup.get('rateSourcePair')?.setValue({key: 'CONTRACT', label: 'Contract'});
        newLineItemGroup.get('accessorialCode')?.setValue(modalResponse.selected.accessorialCode);
        newLineItemGroup.get('lineItemType')?.setValue('ACCESSORIAL');
        newLineItemGroup.get('variables')?.setValue(modalResponse.selected.variables);
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
    const entrySource = new FormControl('');
    const entrySourcePair = new FormControl(null);
    const requestStatus = new FormControl('')
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
    const autoApproved = new FormControl(true);
    const responseComment = new FormControl(null);
    const variables = new FormControl([]);
    const group = new FormGroup({
      charge, rateSource, rateSourcePair,
      entrySource, entrySourcePair,
      requestStatus, requestStatusPair,
      createdDate, createdBy,
      rate, type, quantity, totalAmount,
      message, manual, expanded, lineItemType,
      accessorialCode, autoApproved,
      variables, responseComment
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
      confirmButtonStyle: 'primary',
      cancelButtonText: 'Cancel'
    };
    const modalResult = this.displayPendingChargeModal(modalData);
    this.handlePendingChargeResult(modalResult, costLineItem, 'Accepted');
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
    const modalResult = this.displayPendingChargeModal(modalData);
    this.handlePendingChargeResult(modalResult, costLineItem, 'Denied');
  }

  handlePendingChargeResult(modalResult: Observable<boolean | CommentModel>, costLineItem: any, action: string): void {
    modalResult.subscribe(result => {
      if (result) {
        const index = this.pendingChargeLineItemControls.findIndex(lineItem => lineItem.value.charge === costLineItem.charge);
        const pendingLineItem: AbstractControl | null = this.pendingChargeLineItems.get(index.toString());

        if (pendingLineItem !== null) {
          this.pendingChargeLineItems.removeAt(index);
          this.setPendingChargeResponse(action, pendingLineItem, result);
          if (action === 'Accepted') {
            this.costBreakdownItemsControls.push(pendingLineItem);
            this.costBreakdownItemsControls.sort((a, b) => {
              return a.get('step')?.value < b.get('step')?.value ? -1 : 1;
            });
            this.rateEngineCall.emit(this.pendingAccessorialCode);
          } else {
            this.deniedChargeLineItemControls.push(pendingLineItem);
          }
          this._formGroup.get('amountOfInvoice')?.setValue(this.costBreakdownTotal);
          this.toastService.openSuccessToast(`Success. Charge was ${action.toLowerCase()}.`);
        }
      }
    });
  }

  setPendingChargeResponse(responseStatus: string, pendingLineItem: AbstractControl, result: CommentModel | boolean): void {
    pendingLineItem.patchValue({
      requestStatus: responseStatus,
      requestStatusPair: { key: responseStatus.toUpperCase(), label: responseStatus}}
    );
    if (typeof result !== 'boolean') {
      pendingLineItem.get('responseComment')?.setValue(result.comment);
    }
    pendingLineItem.get('closedDate')?.setValue(new Date().toISOString());
    pendingLineItem.get('closedBy')?.setValue(this.userInfo?.email);
  }

  displayPendingChargeModal(modalData: ConfirmationModalData): Observable<CommentModel | boolean> {
    return this.utilService.openCommentModal({
      ...modalData,
      commentSectionFieldName: 'Response Comment',
      requireField: modalData.title === 'Deny Charge'
    });
  }
  async onEditCostLineItem(costLineItem: AbstractControl, costLineItems: AbstractControl[]): Promise<void> {
    const editChargeDetails = await this.utilService.openEditChargeModal({
      costLineItem
    }).pipe(first()).toPromise();
    if (editChargeDetails) {
      const existingCostLineItem = costLineItems.find(lineItem => editChargeDetails.charge === lineItem.value?.charge);
      if (existingCostLineItem) {
        this.toastService.openSuccessToast(`Success. Variables have been updated for the line item.`);
        existingCostLineItem.patchValue({
          variables: editChargeDetails.variables
        });
        existingCostLineItem.markAsDirty();
        this.pendingAccessorialCode = costLineItem.value.accessorialCode;
        this.rateEngineCall.emit(this.pendingAccessorialCode);
      }
    }
  }

  async onDeleteCostLineItem(costLineItem: any): Promise<void> {
    const dialogResult = await this.utilService.openCommentModal({
      title: 'Delete Charge',
      innerHtmlMessage: `Are you sure you want to delete this charge?
               <br/><br/><strong>This action cannot be undone.</strong>`,
      confirmButtonText: 'Delete Charge',
      confirmButtonStyle: 'destructive',
      cancelButtonText: 'Cancel',
      commentSectionFieldName: 'Reason for Deletion',
      requireField: true
    }).pipe(first()).toPromise();
    if (dialogResult) {
      const index = this.costBreakdownItemsControls.findIndex(lineItem => lineItem.value.accessorialCode === costLineItem.value.accessorialCode);
      const existingCostLineItem: AbstractControl | null = this.costBreakdownItems.get(index.toString());

      if (existingCostLineItem) {
        this.costBreakdownItems.removeAt(index);
        this.deletedChargeLineItemControls.push(existingCostLineItem);

        this.toastService.openSuccessToast(`Success. Line item has been deleted.`);
        existingCostLineItem.patchValue({
          responseComment: dialogResult.comment,
          requestStatus: 'Deleted',
          requestStatusPair: { key: 'DELETED', label: 'Deleted'}
        });
        this.pendingAccessorialCode = costLineItem.value.accessorialCode;
        this.rateEngineCall.emit(this.pendingAccessorialCode);
      }
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

  resolveDispute(action: string): void {
    this.resolveDisputeCall.emit(action);
  }

  public downloadAttachment(url: string): void {
    if (url) {
      window.open(url);
    }
  }

}
