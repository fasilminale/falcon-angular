import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { GlLineItem } from 'src/app/models/line-item/line-item-model';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';

@Component({
  selector: 'app-invoice-allocation',
  templateUrl: './invoice-allocation.component.html',
  styleUrls: ['./invoice-allocation.component.scss']
})
export class InvoiceAllocationComponent implements OnInit {

  _formArray = new FormArray([]);
  _formGroup = new FormGroup({});
  isEditMode = true;
  invoiceNetAmount = 0;

  @Input() set formGroup(givenFormGroup: FormGroup) {
    const formGroup = new FormGroup({});
    formGroup.setControl('allocationPercentage', new FormControl('50%'));
    formGroup.setControl('warehouse', new FormControl('Other'));
    formGroup.setControl('glCostCenter', new FormControl('23344'));
    formGroup.setControl('glAccount', new FormControl('71257000'));
    formGroup.setControl('glCompanyCode', new FormControl('4323345')); 
    formGroup.setControl('allocationAmount', new FormControl(300)); 
    this._formArray.controls.push(formGroup);
    givenFormGroup.setControl('invoiceAllocations', this._formArray);
    this._formGroup = givenFormGroup;
  }

  @Input() set loadGlLineItems$(observable: Observable<GlLineItem[]>) {
    this.subscriptionManager.manage(observable.subscribe(
      glLineItems => {
        this._formArray = new FormArray([]);
        glLineItems.forEach(glLineItem => {
          const formGroup = new FormGroup({});
          formGroup.setControl('allocationPercentage', new FormControl(`${glLineItem.allocationPercent}%`));
          formGroup.setControl('warehouse', new FormControl(glLineItem.shippingPointWarehouse));
          formGroup.setControl('glCostCenter', new FormControl(glLineItem.glCostCenter));
          formGroup.setControl('glAccount', new FormControl(glLineItem.glAccount));
          formGroup.setControl('glCompanyCode', new FormControl(glLineItem.glCompanyCode)); 
          formGroup.setControl('allocationAmount', new FormControl(glLineItem.glAmount)); 
          this._formArray.controls.push(formGroup);
        });
      }
    ));
  }

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => this.isEditMode = !isEditMode
    ));
  }

  @Input() set updateInvoiceNetAmount$(observable: Observable<number>) {
    this.subscriptionManager.manage(observable.subscribe(
      invoiceNetAmount => this.invoiceNetAmount = invoiceNetAmount
    ));
  }

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { }

  ngOnInit(): void {
  }

  get invoiceAllocationsControls() {
    return this._formGroup.get('invoiceAllocations') ? (this._formGroup.get('invoiceAllocations') as FormArray).controls: new FormArray([]).controls;
  }

  getTotalAllocationAmount() {
    let totalAmount = 0;
    this.invoiceAllocationsControls.forEach(control => {
      totalAmount = +control.get('allocationAmount')?.value;
    });
    return totalAmount;
  }

}
