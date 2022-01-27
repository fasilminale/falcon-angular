import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ShippingPointLocation } from 'src/app/models/location/location-model';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';
const { minLength, required } = Validators;

@Component({
  selector: 'app-fal-address',
  templateUrl: './fal-address.component.html',
  styleUrls: ['./fal-address.component.scss']
})
export class FalAddressComponent implements OnInit {

  shippingPointItems = [
    'Home',
    'Office'
  ];

  public _formGroup = new FormGroup({});

  @Input() set formGroup (newFormGroup: FormGroup) {
    newFormGroup.setControl('name', new FormControl('', [required]))
    newFormGroup.setControl('country', new FormControl('', [required]))
    newFormGroup.setControl('city', new FormControl('', [required]))
    newFormGroup.setControl('zipCode', new FormControl('', [required, minLength(5)]))
    newFormGroup.setControl('state', new FormControl('', [required]))
    newFormGroup.setControl('streetAddress', new FormControl('', [required]))
    newFormGroup.setControl('streetAddress2', new FormControl())
    newFormGroup.setControl('shippingPoint', new FormControl('', [required]))
    this._formGroup = newFormGroup;
    this._formGroup.disable();
  }

  @Input() set loadAddress$(observable: Observable<ShippingPointLocation>) {
    this.subscriptionManager.manage(observable.subscribe(l => {
        this._formGroup.get('name')?.setValue(l.name ? l.name: undefined);
        this._formGroup.get('country')?.setValue(l.country ? l.country: undefined);
        this._formGroup.get('city')?.setValue(l.city ? l.city: undefined);
        this._formGroup.get('zipCode')?.setValue(l.zipCode ? l.zipCode: undefined);
        this._formGroup.get('state')?.setValue(l.state ? l.state: undefined);
        this._formGroup.get('streetAddress')?.setValue(l.address ? l.address: undefined);
        this._formGroup.get('streetAddress2')?.setValue(l.address2 ? l.address2: undefined);
        this._formGroup.get('shippingPoint')?.setValue(l.shippingPoint ? l.shippingPoint: undefined);
    }))
  }

  @Input() showShippingItemField = true;

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { }

  ngOnInit(): void {
  }

}
