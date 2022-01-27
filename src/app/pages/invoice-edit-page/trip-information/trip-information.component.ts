import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../../services/subscription-manager';
import {FREIGHT_PAYMENT_TERM_OPTIONS, TripInformation} from '../../../models/invoice/trip-information-model';
import {MasterDataService} from '../../../services/master-data-service';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {CarrierReference, CarrierUtils} from '../../../models/master-data-models/carrier-model';
import {map} from 'rxjs/operators';
import {CarrierModeCodeReference, CarrierModeCodeUtils} from '../../../models/master-data-models/carrier-mode-code-model';
import {ServiceLevel, ServiceLevelUtils} from '../../../models/master-data-models/service-level-model';
import { ShippingPointLocation } from 'src/app/models/location/location-model';

const {required} = Validators;

@Component({
  selector: 'app-trip-information',
  templateUrl: './trip-information.component.html',
  styleUrls: ['./trip-information.component.scss']
})
export class TripInformationComponent implements OnInit {

  public freightPaymentTermOptions = FREIGHT_PAYMENT_TERM_OPTIONS;
  public carrierOptions: Array<SelectOption<CarrierReference>> = [];
  public carrierModeOptions: Array<SelectOption<CarrierModeCodeReference>> = [];
  public serviceLevelOptions: Array<SelectOption<ServiceLevel>> = [];

  public tripIdControl = new FormControl();
  public invoiceDateControl = new FormControl({}, [required]);
  public pickUpDateControl = new FormControl({}, [required]);
  public deliveryDateControl = new FormControl({}, [required]);
  public proTrackingNumberControl = new FormControl({}, [required]);
  public bolNumberControl = new FormControl({}, [required]);
  public freightPaymentTermsControl = new FormControl({}, [required]);
  public carrierControl = new FormControl({}, [required]);
  public carrierModeControl = new FormControl({}, [required]);
  public serviceLevelControl = new FormControl({}, [required]);

  private _formGroup = new FormGroup({});
  public originAddressFormGroup = new FormGroup({});
  public destinationAddressFormGroup = new FormGroup({});
  public billToAddressFormGroup = new FormGroup({});
  private _editableFormArray = new FormArray([
    this.invoiceDateControl,
    this.pickUpDateControl,
    this.deliveryDateControl,
    this.proTrackingNumberControl,
    this.bolNumberControl,
    this.freightPaymentTermsControl,
    this.carrierControl,
    this.carrierModeControl,
    this.serviceLevelControl,
    this.originAddressFormGroup,
    this.destinationAddressFormGroup,
    this.billToAddressFormGroup
  ]);

  public showFreightOrderSection = false;
  loadOriginAddress$ = new Subject<ShippingPointLocation>();
  loadDestinationAddress$ = new Subject<ShippingPointLocation>();
  loadBillToAddress$ = new Subject<ShippingPointLocation>();


  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager,
              private masterData: MasterDataService) {
  }

  ngOnInit(): void {
    this.formGroup = this._formGroup;
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
    givenFormGroup.setControl('originAddress', this.originAddressFormGroup);
    givenFormGroup.setControl('destinationAddress', this.destinationAddressFormGroup);
    givenFormGroup.setControl('billToAddress', this.billToAddressFormGroup);
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
      this.formGroup.enable();
      this.tripIdControl.setValue(t.tripId ?? 'N/A');
      this.invoiceDateControl.setValue(t.invoiceDate ?? undefined);
      this.pickUpDateControl.setValue(t.pickUpDate ?? undefined);
      this.deliveryDateControl.setValue(t.deliveryDate ?? undefined);
      this.proTrackingNumberControl.setValue(t.proTrackingNumber ?? 'N/A');
      this.bolNumberControl.setValue(t.bolNumber ?? 'N/A');
      this.freightPaymentTermsControl.setValue(t.freightPaymentTerms ?? undefined);
      this.carrierControl.setValue(t.carrier ?? undefined);
      this.carrierModeControl.setValue(t.carrierMode ?? undefined);
      this.serviceLevelControl.setValue(t.serviceLevel ?? undefined);
      this.loadOriginAddress$.next(t.originAddress);
      this.loadDestinationAddress$.next(t.destinationAddress);
      this.loadBillToAddress$.next(t.billToAddress);
      this.formGroup.updateValueAndValidity();
      this.formGroup.disable();
    }));
  }

  toggleFreightOrderDetailsSection(): void {
    this.showFreightOrderSection = !this.showFreightOrderSection;
  }

  compareWith(item: any, value: any): boolean {
    return item.id === value.id;
  }
}

