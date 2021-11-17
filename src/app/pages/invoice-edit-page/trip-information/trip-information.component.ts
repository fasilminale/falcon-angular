import {Component, Inject, Input} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../../services/subscription-manager';

@Component({
  selector: 'app-trip-information',
  templateUrl: './trip-information.component.html',
  styleUrls: ['./trip-information.component.scss']
})
export class TripInformationComponent {

  private _formGroup = new FormGroup({});
  private _tripIdControl = new FormControl({
    disabled: true
  });
  private _invoiceDateControl = new FormControl({
    disabled: true
  });
  public _pickUpDateControl = new FormControl();
  private _deliveryDateControl = new FormControl();
  private _proTrackingNumberControl = new FormControl();
  private _bolNumberControl = new FormControl();
  private _freightPaymentTermsControl = new FormControl();
  private _carrierControl = new FormControl();
  private _carrierModeControl = new FormControl();
  private _serviceLevelControl = new FormControl();

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) {
  }

  @Input() set formGroup(givenFormGroup: FormGroup) {
    givenFormGroup.setControl('tripId', this._tripIdControl);
    givenFormGroup.setControl('invoiceDate', this._invoiceDateControl);
    givenFormGroup.setControl('pickUpDate', this._pickUpDateControl);
    givenFormGroup.setControl('deliveryDate', this._deliveryDateControl);
    givenFormGroup.setControl('proTrackingNumber', this._proTrackingNumberControl);
    givenFormGroup.setControl('bolNumber', this._bolNumberControl);
    givenFormGroup.setControl('freightPaymentTerms', this._freightPaymentTermsControl);
    givenFormGroup.setControl('carrier', this._carrierControl);
    givenFormGroup.setControl('carrierMode', this._carrierModeControl);
    givenFormGroup.setControl('serviceLevel', this._serviceLevelControl);
    this._formGroup = givenFormGroup;
  }

  get formGroup(): FormGroup {
    return this._formGroup;
  }

  @Input() set loadTripInformation$(observable: Observable<TripInformation>) {
    this.subscriptionManager.manage(observable.subscribe(
      t => this.loadTripInformation(t)
    ));
  }

  private loadTripInformation(t: TripInformation): void {
    console.log('-----loadTripInformation: ', t);
    this._tripIdControl.setValue(t.tripId);
    // this._invoiceDateControl.setValue(t.invoiceDate);
    // this._pickUpDateControl.setValue(t.pickUpDate);
    // this._deliveryDateControl.setValue(t.deliveryDate);
    this._proTrackingNumberControl.setValue(t.proTrackingNumber);
    this._bolNumberControl.setValue(t.bolNumber);
    this._freightPaymentTermsControl.setValue(t.freightPaymentTerms);
    this._carrierControl.setValue(t.carrier);
    this._carrierModeControl.setValue(t.carrierMode);
    this._serviceLevelControl.setValue(t.serviceLevel);
  }
}

export interface TripInformation {
  tripId: string;
  invoiceDate: Date;
  pickUpDate: Date;
  deliveryDate: Date;
  proTrackingNumber: string;
  bolNumber: string;
  freightPaymentTerms: string;
  carrier: { name: string, scac: string };
  carrierMode: { name: string, code: string };
  serviceLevel: { name: string, code: string };
}
