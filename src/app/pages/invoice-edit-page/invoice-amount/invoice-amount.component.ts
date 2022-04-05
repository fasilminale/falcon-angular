import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {FalRadioOption} from 'src/app/components/fal-radio-input/fal-radio-input.component';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {CostLineItem} from 'src/app/models/line-item/line-item-model';
import {SubscriptionManager, SUBSCRIPTION_MANAGER} from 'src/app/services/subscription-manager';
import {CalcDetail, CostBreakDownUtils, RateEngineResponse} from '../../../models/rate-engine/rate-engine-request';
import {map} from 'rxjs/operators';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {WebServices} from '../../../services/web-services';
import {InvoiceOverviewDetail} from "../../../models/invoice/invoice-overview-detail.model";
import {ElmFormHelper} from "@elm/elm-styleguide-ui";

@Component({
  selector: 'app-invoice-amount',
  templateUrl: './invoice-amount.component.html',
  styleUrls: ['./invoice-amount.component.scss']
})
export class InvoiceAmountComponent implements OnInit {

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

  public costBreakdownOptions: Array<SelectOption<CalcDetail>> = [];

  readOnlyForm = true;
  costBreakdownItems = new FormArray([]);

  @Output() rateEngineCall: EventEmitter<string> = new EventEmitter<string>();

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) {
  }

  ngOnInit(): void {
    this.setUpOverrideStandardPaymentTermsSubscription();
    this.enableDisableOverrideStandardPaymentTerms(true);
    this.enableDisableCurrency(true);
  }

  setUpOverrideStandardPaymentTermsSubscription(): void {
    this.subscriptionManager.manage(this.isPaymentOverrideSelected.valueChanges
      .subscribe((selected: string) => {
        const selectedBool = selected + '' === this.overridePaymentTermsOptions[0].value ? true : false;
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

  @Input() set chargeLineItemOptions$(observable: Observable<RateEngineResponse>) {
    this.subscriptionManager.manage(observable.pipe(
      map(response => {
        return CostBreakDownUtils.toOptions(response.calcDetails);
      })
    ).subscribe(
      opts => {
        this.costBreakdownOptions = opts.filter(opt => {
          for (const control of this.costBreakdownItemsControls) {
            if (control.value?.charge === opt.label) {
              return null;
            }
          }
          return opt;
        }).filter(Boolean);
        this.costBreakdownOptions.push(CostBreakDownUtils.toOption({name: 'OTHER', accessorialCode: 'OTHER'}));
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
    this.insertBreakDownItems();
    givenFormGroup.setControl('costBreakdownItems', this.costBreakdownItems);
    this._formGroup = givenFormGroup;
  }

  loadForm(givenFormGroup: FormGroup, invoiceAmountDetail?: InvoiceAmountDetail): void {
    givenFormGroup.get('amountOfInvoice')?.setValue(invoiceAmountDetail?.amountOfInvoice ? invoiceAmountDetail.amountOfInvoice : '');
    givenFormGroup.get('currency')?.setValue(invoiceAmountDetail?.currency ? invoiceAmountDetail.currency : '');
    if (!!invoiceAmountDetail?.standardPaymentTermsOverride) {
      ElmFormHelper.checkCheckbox(this.isPaymentOverrideSelected,
        this.overridePaymentTermsOptions[0], true);
    }
    this.overridePaymentTermsFormGroup.controls.paymentTerms.setValue(invoiceAmountDetail?.standardPaymentTermsOverride ? invoiceAmountDetail.standardPaymentTermsOverride : '');

    givenFormGroup.get('mileage')?.setValue(invoiceAmountDetail?.mileage ? invoiceAmountDetail.mileage : '');
    (givenFormGroup.get('costBreakdownItems') as FormArray).clear();
    this.insertBreakDownItems(invoiceAmountDetail?.costLineItems);
  }

  insertBreakDownItems(costBreakdownItems?: CostLineItem[]): void {
    if (costBreakdownItems && costBreakdownItems.length > 0) {
      this.costBreakdownItems = new FormArray([]);
      costBreakdownItems.forEach((costBreakdownItem) => {
        this.costBreakdownItemsControls.push(new FormGroup({
          charge: new FormControl(costBreakdownItem.chargeCode),
          rateSource: new FormControl(costBreakdownItem.rateSource?.label ?? 'N/A'),
          entrySource: new FormControl(costBreakdownItem.entrySource?.label ?? 'N/A'),
          rate: new FormControl(costBreakdownItem.rateAmount ? `${costBreakdownItem.rateAmount}` : 'N/A'),
          type: new FormControl(costBreakdownItem.rateType ? costBreakdownItem.rateType : ''),
          quantity: new FormControl(costBreakdownItem.quantity ? costBreakdownItem.quantity : 'N/A'),
          totalAmount: new FormControl(costBreakdownItem.chargeLineTotal || 0),
          message: new FormControl(costBreakdownItem.message ?? ''),
          contracted: new FormControl(true)
        }));
      });
    } else {
      this.costBreakdownItemsControls.push(new FormGroup({
        charge: new FormControl(''),
        rateSource: new FormControl(''),
        entrySource: new FormControl(''),
        rate: new FormControl(''),
        type: new FormControl(''),
        quantity: new FormControl(''),
        totalAmount: new FormControl(''),
        contracted: new FormControl(true)
      }));
    }
  }

  get costBreakdownItemsControls(): AbstractControl[] {
    return this._formGroup.get('costBreakdownItems') ? (this._formGroup.get('costBreakdownItems') as FormArray).controls : new FormArray([]).controls;
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

  @Input() set loadInvoiceAmountDetail$(observable: Observable<InvoiceAmountDetail>) {
    this.subscriptionManager.manage(observable.subscribe(
      invoiceAmountDetail => this.loadForm(this._formGroup, invoiceAmountDetail)
    ));
  }

  get hasMileage(): boolean {
    return !!this._formGroup?.get('mileage')?.value;
  }


  addNewEmptyLineItem(): void {
    this.costBreakdownItemsControls.push(this.createEmptyLineItemGroup());
  }

  createEmptyLineItemGroup(): FormGroup {
    const charge = new FormControl(null);
    const rateSource = new FormControl('Manual');
    const rate = new FormControl('');
    const type = new FormControl('');
    const quantity = new FormControl(0);
    const totalAmount = new FormControl(0);
    const message = new FormControl('');
    const contracted = new FormControl(false);

    return new FormGroup({charge, rateSource, rate, type, quantity, totalAmount, message, contracted});
  }

  onSelectRate(value: any): void {
    if (value.accessorialCode === 'OTHER') {
      return;
    }

    this.rateEngineCall.emit(value.accessorialCode);
  }
}
