import {AfterViewInit, Component, Inject, Input} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../../services/subscription-manager';
import {FREIGHT_PAYMENT_TERM_OPTIONS, TripInformation} from '../../../models/invoice/trip-information-model';
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

  public freightPaymentTermOptions = FREIGHT_PAYMENT_TERM_OPTIONS;
  public carrierOptions: Array<SelectOption<Carrier>> = [];
  public carrierModeOptions: Array<SelectOption<CarrierModeCode>> = [];
  public serviceLevelOptions: Array<SelectOption<ServiceLevel>> = [];

  public tripIdControl = new FormControl();
  public invoiceDateControl = new FormControl();
  public pickUpDateControl = new FormControl();
  public deliveryDateControl = new FormControl();
  public proTrackingNumberControl = new FormControl();
  public bolNumberControl = new FormControl();
  public freightPaymentTermsControl = new FormControl();
  public carrierControl = new FormControl();
  public carrierModeControl = new FormControl();
  public serviceLevelControl = new FormControl();

  private _formGroup = new FormGroup({});
  private _editableFormArray = new FormArray([
    this.invoiceDateControl,
    this.pickUpDateControl,
    this.deliveryDateControl,
    this.proTrackingNumberControl,
    this.bolNumberControl,
    this.freightPaymentTermsControl,
    this.carrierControl,
    this.carrierModeControl,
    this.serviceLevelControl
  ]);

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager,
              private masterData: MasterDataService) {
    this.formGroup = this._formGroup;
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
    givenFormGroup.setControl('tripId', this.tripIdControl);
    givenFormGroup.setControl('invoiceDate', this.invoiceDateControl);
    givenFormGroup.setControl('pickUpDate', this.pickUpDateControl);
    givenFormGroup.setControl('deliveryDate', this.deliveryDateControl);
    givenFormGroup.setControl('proTrackingNumber', this.proTrackingNumberControl);
    givenFormGroup.setControl('bolNumber', this.bolNumberControl);
    givenFormGroup.setControl('freightPaymentTerms', this.freightPaymentTermsControl);
    givenFormGroup.setControl('carrier', this.carrierControl);
    givenFormGroup.setControl('carrierMode', this.carrierModeControl);
    givenFormGroup.setControl('serviceLevel', this.serviceLevelControl);
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
      this.tripIdControl.setValue(t.tripId);
      this.invoiceDateControl.setValue(t.invoiceDate);
      this.pickUpDateControl.setValue(t.pickUpDate);
      this.deliveryDateControl.setValue(t.deliveryDate);
      this.proTrackingNumberControl.setValue(t.proTrackingNumber);
      this.bolNumberControl.setValue(t.bolNumber);
      this.freightPaymentTermsControl.setValue(t.freightPaymentTerms);
      this.carrierControl.setValue(t.carrier);
      this.carrierModeControl.setValue(t.carrierMode);
      this.serviceLevelControl.setValue(t.serviceLevel);
    }));
  }

}

