import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';

@Component({
  selector: 'app-invoice-allocation',
  templateUrl: './invoice-allocation.component.html',
  styleUrls: ['./invoice-allocation.component.scss']
})
export class InvoiceAllocationComponent implements OnInit {

  _formArray = new FormArray([]);
  _formGroup = new FormGroup({});
  readOnlyForm = true;

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

    console.log(this._formGroup.value)

  }

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => this.readOnlyForm = !isEditMode
    ));
  }

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { }

  ngOnInit(): void {
  }

  get invoiceAllocationsControls() {
    return this._formGroup.get('invoiceAllocations') ? (this._formGroup.get('invoiceAllocations') as FormArray).controls: new FormArray([]).controls;
  }

  

}
