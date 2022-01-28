import { Component, Inject, Input, OnInit } from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';
import { Observable } from 'rxjs';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';
import { InvoiceAllocationDetail } from '../../../models/invoice/trip-information-model';

@Component({
  selector: 'app-invoice-allocation',
  templateUrl: './invoice-allocation.component.html',
  styleUrls: ['./invoice-allocation.component.scss']
})
export class InvoiceAllocationComponent implements OnInit {

  _formGroup = new FormGroup({});
  isEditMode = true;
  totalAllocationAmount = 0;
  isAllocationAmountValid = true;

  public totalGlAmount = new FormControl({});
  public invoiceNetAmount = new FormControl({});
  public invoiceAllocations = new FormArray([]);

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) {
  }

  ngOnInit(): void {
    this.formGroup = this._formGroup;
    this.formGroup.disable();
  }

  @Input() set formGroup(givenFormGroup: FormGroup) {
    givenFormGroup.setControl('totalGlAmount', this.totalGlAmount);
    givenFormGroup.setControl('invoiceNetAmount', this.invoiceNetAmount);
    givenFormGroup.setControl('invoiceAllocations', this.invoiceAllocations);
    this._formGroup = givenFormGroup;
  }

  get formGroup(): FormGroup {
    return this._formGroup;
  }

  @Input() set loadAllocationDetails(observable: Observable<InvoiceAllocationDetail>) {
    this.subscriptionManager.manage(observable.subscribe(t => {
      const array = new FormArray([]);
      this.totalGlAmount.setValue(t.totalGlAmount ?? 0);
      this.invoiceNetAmount.setValue(t.invoiceNetAmount ?? 0);
      this._formGroup.setControl('totalGlAmount', this.totalGlAmount);
      this._formGroup.setControl('invoiceNetAmount', this.invoiceNetAmount);
      for (const glLineItem of t.glLineItems) {
        array.push(new FormGroup({
          allocationPercent: new FormControl(glLineItem.allocationPercent ?? undefined),
          warehouse: new FormControl(glLineItem.shippingPointWarehouse ?? undefined),
          glCostCenter: new FormControl(glLineItem.glCostCenter ?? undefined),
          glAccount: new FormControl(glLineItem.glAccount ?? undefined),
          glCompanyCode: new FormControl(glLineItem.glCompanyCode ?? undefined),
          allocationAmount: new FormControl(glLineItem.glAmount ?? undefined)
        }));
      }
      this._formGroup.setControl('invoiceAllocations', array);
      this.updateTotalAllocationAmount();
      this.validateInvoiceAmount();
    }));
  }

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => this.isEditMode = !isEditMode
    ));
  }

  updateTotalAllocationAmount(): void{
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
      const lineItemAmount = item.get('allocationAmount') as FormControl;
      sum += lineItemAmount.value;
    });
    this.isAllocationAmountValid = parseFloat(this.invoiceNetAmount.value) > 0 && sum.toFixed(2) === this.invoiceNetAmount.value;
  }

  get invoiceAllocationsControls(): AbstractControl[] {
    return this._formGroup.get('invoiceAllocations') ? (this._formGroup.get('invoiceAllocations') as FormArray).controls : new FormArray([]).controls;
  }

}
