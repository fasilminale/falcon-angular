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
  @Input() addressType!: 'origin' | 'destination';

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
        this.nameControl.setValue(l.name ? l.name: 'N/A');
        this.countryControl.setValue(l.country ? l.country: this.validateField ? undefined : 'N/A');
        this.cityControl.setValue(l.city ? l.city: 'N/A');
        this.zipCodeControl.setValue(l.zipCode ? l.zipCode: this.validateField ? undefined : 'N/A');
        this.stateControl.setValue(l.state ? l.state: 'N/A');
        this.streetAddressControl.setValue(l.address ? l.address: 'N/A');
        this.streetAddress2Control.setValue(l.address2 ? l.address2: 'N/A');
        this.shippingPointControl.setValue(this.addressType === 'destination' ? 'N/A' : (l.shippingPoint ? l.shippingPoint : 'N/A'));
        if (this.addressType == undefined) {
          this.name2Control.setValue(l.name2 ? l.name2: 'N/A');
          this.idCodeControl.setValue(l.idCode ? l.idCode: 'N/A');
        }
        this._editableFormArray.clear();
        if (this.addressType == 'origin' || (this.addressType == 'destination' && this.destinationType == 'DC')) {
          this._editableFormArray.push(this.shippingPointControl);
        }
        if (this.addressType == 'destination' && this.destinationType == 'CUST') {
          this._editableFormArray.push(this.nameControl);
          this._editableFormArray.push(this.countryControl);
          this._editableFormArray.push(this.cityControl);
          this._editableFormArray.push(this.zipCodeControl);
          this._editableFormArray.push(this.stateControl);
          this._editableFormArray.push(this.streetAddressControl);
          this._editableFormArray.push(this.streetAddress2Control);
        }
    }))
  }

  @Input() showShippingItemField = true;
  @Input() validateField = true; // TODO: Temporary for FAL-750. Replace when edit capability is implemented

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { }

  ngOnInit(): void {
  }

  onShippingPointChange($event: ShippingPointLocationSelectOption): void {
    let l = $event?.location;
    this.nameControl.setValue(l?.name ? l?.name: 'N/A');
    this.countryControl.setValue(l?.country ? l?.country: 'N/A');
    this.cityControl.setValue(l?.city ? l?.city: 'N/A');
    this.zipCodeControl.setValue(l?.zipCode ? l?.zipCode: 'N/A');
    this.stateControl.setValue(l?.state ? l.state: 'N/A');
    this.streetAddressControl.setValue(l?.address ? l?.address: 'N/A');
    this.streetAddress2Control.setValue(l?.address2 ? l?.address2: 'N/A');
    this.shippingPointControl.setValue($event.value);
    if (this.addressType === 'origin') {
      this.originShippingPointChangeEvent.emit($event?.value);
    }
  }
}
