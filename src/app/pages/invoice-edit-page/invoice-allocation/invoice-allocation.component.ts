import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {InvoiceAllocationDetail} from '../../../models/invoice/trip-information-model';
import {InvoiceOverviewDetail} from '../../../models/invoice/invoice-overview-detail.model';
import {GlLineItem, GlLineItemError} from 'src/app/models/line-item/line-item-model';

@Component({
  selector: 'app-invoice-allocation',
  templateUrl: './invoice-allocation.component.html',
  styleUrls: ['./invoice-allocation.component.scss']
})
export class InvoiceAllocationComponent implements OnInit {

  _formGroup = new UntypedFormGroup({});
  isEditMode = true;
  totalAllocationAmount = 0;
  isAllocationAmountValid = true;
  @Output() allocationAmountInvalid = new EventEmitter<any>();
  isPrepaid?: boolean;

  public totalGlAmount = new UntypedFormControl({});
  public invoiceNetAmount = new UntypedFormControl({});
  public invoiceAllocations = new UntypedFormArray([]);
  public invoiceAllocationErrors?: Array<GlLineItemError>;
  @Output() editGlLineItemEvent = new EventEmitter<any>();

  private loadInvoiceOverviewDetailSubscription = new Subscription();
  private loadAllocationDetailsSubscription = new Subscription();
  private isEditModeSubscription = new Subscription();

  constructor() {
    // empty
  }

  ngOnInit(): void {
    this.formGroup = this._formGroup;
    this.formGroup.disable();
  }

  @Input() set loadInvoiceOverviewDetail$(observable: Observable<InvoiceOverviewDetail>) {
    this.loadInvoiceOverviewDetailSubscription.unsubscribe();
    this.loadInvoiceOverviewDetailSubscription = observable.subscribe(
      invoiceOverviewDetail => this.isPrepaid = invoiceOverviewDetail.freightPaymentTerms === 'PREPAID'
    );
  }

  @Input() set formGroup(givenFormGroup: UntypedFormGroup) {
    givenFormGroup.setControl('totalGlAmount', this.totalGlAmount);
    givenFormGroup.setControl('invoiceNetAmount', this.invoiceNetAmount);
    givenFormGroup.setControl('invoiceAllocations', this.invoiceAllocations);
    this._formGroup = givenFormGroup;
  }

  get formGroup(): UntypedFormGroup {
    return this._formGroup;
  }

  @Input() set loadAllocationDetails(observable: Observable<InvoiceAllocationDetail>) {
    this.loadAllocationDetailsSubscription.unsubscribe();
    this.loadAllocationDetailsSubscription = (observable.subscribe(t => {
      this.invoiceAllocationErrors = t.glLineItemsInvalid ? t.glLineItemsErrors : undefined;
      this.invoiceAllocations.clear();
      this.totalGlAmount.setValue(t.totalGlAmount ?? 0);
      this.invoiceNetAmount.setValue(t.invoiceNetAmount ?? 0);
      this._formGroup.setControl('totalGlAmount', this.totalGlAmount);
      this._formGroup.setControl('invoiceNetAmount', this.invoiceNetAmount);
      for (const glLineItem of t.glLineItems) {
        const glCostCenter = glLineItem.glCostCenter ? glLineItem.glCostCenter : glLineItem.glProfitCenter ? 'N/A' : undefined;
        const glProfitCenter = glLineItem.glProfitCenter ? glLineItem.glProfitCenter : glLineItem.glCostCenter ? 'N/A' : undefined;

        const invoiceAllocationFormGroup = new UntypedFormGroup({
          allocationPercent: new UntypedFormControl(glLineItem.allocationPercent ?? undefined),
          customerCategory: new UntypedFormControl(glLineItem.customerCategory ?? undefined),
          glProfitCenter: new UntypedFormControl(glProfitCenter),
          glCostCenter: new UntypedFormControl(glCostCenter),
          glAccount: new UntypedFormControl(glLineItem.glAccount ?? undefined, [Validators.required]),
          glCompanyCode: new UntypedFormControl(glLineItem.glCompanyCode ?? undefined),
          allocationAmount: new UntypedFormControl(glLineItem.glAmount ?? 0),
          glAmount: new UntypedFormControl(glLineItem.glAmount ?? 0)
        });
        this.invoiceAllocations.push(invoiceAllocationFormGroup);
      }
      this.invoiceAllocations.disable();
      this.updateTotalAllocationAmount();
      this.validateInvoiceAmount();
    }));
  }

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.isEditModeSubscription.unsubscribe();
    this.isEditModeSubscription = observable.subscribe(
      isEditMode => this.isEditMode = !isEditMode
    );
  }

  updateTotalAllocationAmount(): void {
    this.totalAllocationAmount = 0;
    this.invoiceAllocationsControls.forEach((item: any) => {
      const totalAmount = item.get('allocationAmount')?.value;
      if (!isNaN(parseFloat(totalAmount))) {
        this.totalAllocationAmount += parseFloat(totalAmount.toFixed(2));
      }
    });
  }

  public validateInvoiceAmount(): void {
    let sum = 0;
    this.invoiceAllocationsControls.forEach((item: any) => {
      const lineItemAmount = item.get('allocationAmount') as UntypedFormControl;
      sum += lineItemAmount.value;
    });
    this.isAllocationAmountValid = parseFloat(this.invoiceNetAmount.value) > 0 && sum.toFixed(2) === parseFloat(this.invoiceNetAmount.value).toFixed(2);
    this.allocationAmountInvalid.emit({'form': 'invoice-allocation', 'value': this.isAllocationAmountValid});
  }

  get invoiceAllocationsControls(): AbstractControl[] {
    return this._formGroup.get('invoiceAllocations') ? (this._formGroup.get('invoiceAllocations') as UntypedFormArray).controls : new UntypedFormArray([]).controls;
  }

  onEditGlLineItem(glLineItem: GlLineItem): void {
    this.invoiceAllocations.enable();
    this.editGlLineItemEvent.emit(glLineItem);
    this.invoiceAllocations.disable();
  }

}
