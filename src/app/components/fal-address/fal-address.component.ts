import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';
const {required, minLength} = Validators;

@Component({
  selector: 'app-fal-address',
  templateUrl: './fal-address.component.html',
  styleUrls: ['./fal-address.component.scss']
})
export class FalAddressComponent implements OnInit, OnChanges {

  shippingPointItems = [
    'Home',
    'Office'
  ];

  @Input() formGroup = new FormGroup({});

  @Input() showShippingItemField = true;

  @Input() showPickupDate = false;

  @Input() set isEditMode$(observable: Observable<boolean>)  {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => {
        if(isEditMode) {
          this.formGroup.enable();
        } else {
          this.formGroup.disable();
        }
      }));
  }

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.formGroup) {
      this.formGroup = new FormGroup({
        name: new FormControl(),
        country: new FormControl(),
        city: new FormControl(),
        zipCode: new FormControl('', [minLength(5)]),
        state: new FormControl(),
        streetAddress: new FormControl(),
        streetAddress2: new FormControl(),
        shippingPoint: new FormControl(),
        pickUpDate: new FormControl({}, [required])
      });
      this.formGroup.disable();
    }
  }

}
