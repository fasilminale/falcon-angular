import {AfterViewInit, Component, Inject, Input} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../../services/subscription-manager';
import {FREIGHT_PAYMENT_TERM_OPTIONS, FreightPaymentTerms, TripInformation} from '../../../models/invoice/trip-information-model';
import {MasterDataService} from '../../../services/master-data-service';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {Carrier, CarrierUtils} from '../../../models/master-data-models/carrier-model';
import {map} from 'rxjs/operators';
import {CarrierModeCode, CarrierModeCodeUtils} from '../../../models/master-data-models/carrier-mode-code-model';
import {ServiceLevel, ServiceLevelUtils} from '../../../models/master-data-models/service-level-model';

@Component({
  selector: 'app-trip-information',
  templateUrl: './trip-information.component.html',
  styleUrls: ['./trip-information.component.scss']
})
export class TripInformationComponent implements AfterViewInit {

  private _formGroup = new FormGroup({});
  private _tripIdControl = new FormControl();
  private _invoiceDateControl = new FormControl();
  private _pickUpDateControl = new FormControl();
  private _deliveryDateControl = new FormControl();
  private _proTrackingNumberControl = new FormControl();
  private _bolNumberControl = new FormControl();
  private _freightPaymentTermsControl = new FormControl();
  private _carrierControl = new FormControl();
  private _carrierModeControl = new FormControl();
  private _serviceLevelControl = new FormControl();
  private _editableFormArray = new FormArray([
    this._invoiceDateControl,
    this._pickUpDateControl,
    this._deliveryDateControl,
    this._proTrackingNumberControl,
    this._bolNumberControl,
    this._freightPaymentTermsControl,
    this._carrierControl,
    this._carrierModeControl,
    this._serviceLevelControl
  ]);

  public freightPaymentTermOptions = FREIGHT_PAYMENT_TERM_OPTIONS;
  public carrierOptions: Array<SelectOption<Carrier>> = [];
  public carrierModeOptions: Array<SelectOption<CarrierModeCode>> = [];
  public serviceLevelOptions: Array<SelectOption<ServiceLevel>> = [];

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager,
              private masterData: MasterDataService) {
  }

  ngAfterViewInit(): void {
    this.formGroup.disable();
    this.subscriptionManager.manage(
      // Carrier Options
      this.masterData.getCarriers().pipe(map(CarrierUtils.toOptions))
        .subscribe(opts => this.carrierOptions = opts),

      // Carrier Mode Code Options
      this.masterData.getCarrierModeCodes().pipe(map(CarrierModeCodeUtils.toOptions))
        .subscribe(opts => this.carrierModeOptions = opts),

      // Service Level Options
      this.masterData.getServiceLevels().pipe(map(ServiceLevelUtils.toOptions))
        .subscribe(opts => this.serviceLevelOptions = opts),
    );
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

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => isEditMode
        ? this._editableFormArray.enable()
        : this._editableFormArray.disable()
    ));
  }

  @Input() set loadTripInformation$(observable: Observable<TripInformation>) {
    this.subscriptionManager.manage(observable.subscribe(t => {
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
    }));
  }

}

