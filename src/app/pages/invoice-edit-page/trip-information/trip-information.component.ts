import {Component, Inject, Input, OnChanges, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
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
import { FreightOrder } from 'src/app/models/freight-order/freight-order-model';
import {CarrierSCAC} from '../../../models/master-data-models/carrier-scac';
import {NgbDateAdapter, NgbDateNativeAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {DateParserFormatter} from '../../../utils/date-parser-formatter';

const {required} = Validators;

export function validateDate(control: AbstractControl): ValidationErrors | null {
  const dateString = control.value;
  if (dateString) {
    if (!(dateString instanceof Date) || (dateString.getFullYear() < 1000
      || dateString.getFullYear() > 9999)) {
      return {validateDate: true};
    } else if (dateString.valueOf() >= Date.now()) {
      return {dateBefore: true};
    }
  }
  return null;
}

@Component({
  selector: 'app-trip-information',
  templateUrl: './trip-information.component.html',
  styleUrls: ['./trip-information.component.scss'],
  providers: [
    {provide: NgbDateAdapter, useClass: NgbDateNativeAdapter},
    {provide: NgbDateParserFormatter, useClass: DateParserFormatter}
  ]
})
export class TripInformationComponent implements OnInit {

  public freightPaymentTermOptions = FREIGHT_PAYMENT_TERM_OPTIONS;
  public carrierOptions: Array<SelectOption<CarrierReference>> = [];
  public carrierModeOptions: Array<SelectOption<CarrierModeCodeReference>> = [];
  public serviceLevelOptions: Array<SelectOption<ServiceLevel>> = [];
  public carrierSCACs: Array<CarrierSCAC> = [];

  public filteredCarrierModeOptions: Array<SelectOption<CarrierModeCodeReference>> = [];
  public filteredServiceLevels: Array<SelectOption<ServiceLevel>> = [];

  public tripIdControl = new FormControl();
  public invoiceDateControl = new FormControl({}, [required]);
  public pickUpDateControl = new FormControl({}, [required, validateDate]);
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
    this.pickUpDateControl,
    this.carrierControl,
    this.carrierModeControl,
    this.serviceLevelControl
  ]);
  private tripInformation: TripInformation = {} as TripInformation;

  public showFreightOrderSection = false;
  loadOriginAddress$ = new Subject<ShippingPointLocation>();
  loadDestinationAddress$ = new Subject<ShippingPointLocation>();
  loadBillToAddress$ = new Subject<ShippingPointLocation>();
  loadFreightOrders$ = new Subject<FreightOrder[]>();


  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager,
              private masterData: MasterDataService) {
  }

  ngOnInit(): void {
    this.formGroup = this._formGroup;
    this.formGroup.disable();
    this.subscriptionManager.manage(
      // Carrier SCACs
      this.masterData.getCarrierSCACs()
        .subscribe(opts => {
          this.carrierSCACs = opts;
          setTimeout(() => {
            this.filteredCarrierModeOptions = this.filterCarrierModes();
            this.filteredServiceLevels = this.filterServiceLevels();
          }, 500);
        }),

      // Carrier Options
      this.masterData.getCarriers().pipe(map(CarrierUtils.toOptions))
        .subscribe(opts => {
          this.carrierOptions = opts;
          if(this.tripInformation) {
            setTimeout(() => {
              this.carrierControl.setValue(this.tripInformation.carrier);
              this.carrierControl.updateValueAndValidity();
            }, 2000);

          }
        }),

      // Carrier Mode Code Options
      this.masterData.getCarrierModeCodes().pipe(map(CarrierModeCodeUtils.toOptions))
        .subscribe(opts =>  {
          this.carrierModeOptions = opts;
          setTimeout(() => {
            this.carrierModeControl.setValue(this.tripInformation.carrierMode);
            this.carrierModeControl.updateValueAndValidity();
          }, 2000);
        }),

      // Service Level Options
      this.masterData.getServiceLevels().pipe(map(ServiceLevelUtils.toOptions))
        .subscribe(opts => {
          this.serviceLevelOptions = opts;
        }),
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

  filterCarrierModes(): Array<SelectOption<CarrierModeCodeReference>> {
    const filteredScacs = this.carrierSCACs.filter(carrier => carrier.scac === this.carrierControl?.value?.scac);
    return this.carrierModeOptions.filter(opt => {
      for (const i in filteredScacs) {
        if (filteredScacs[i].mode === opt.value.mode) {
          return opt;
        }
      }
      return null;
    }).filter(Boolean);
  }

  filterServiceLevels(): Array<SelectOption<ServiceLevel>> {
    const filteredScacs = this.carrierSCACs.filter(carrier => carrier.scac === this.carrierControl?.value?.scac);
    return this.serviceLevelOptions.filter(opt => {
      for (const i in filteredScacs) {
        if (filteredScacs[i].serviceLevel === opt.value.level) {
          return opt;
        }
      }
      return null;
    }).filter(Boolean);
  }

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => isEditMode
        ? this._editableFormArray.enable()
        : this._editableFormArray.disable()
    ));
  }

  @Input() set loadTripInformation$(observable: Observable<TripInformation>) {
    this.subscriptionManager.manage(observable.subscribe(tripInfo => {
      this.tripInformation = tripInfo;
      this.formGroup.enable();
      this.tripIdControl.setValue(tripInfo.tripId ?? 'N/A');
      this.invoiceDateControl.setValue(tripInfo.invoiceDate ?? undefined);
      this.pickUpDateControl.setValue(tripInfo.pickUpDate ?? undefined);
      this.deliveryDateControl.setValue(tripInfo.deliveryDate ?? undefined);
      this.proTrackingNumberControl.setValue(tripInfo.proTrackingNumber ?? 'N/A');
      this.bolNumberControl.setValue(tripInfo.bolNumber ?? 'N/A');
      this.freightPaymentTermsControl.setValue(tripInfo.freightPaymentTerms ?? undefined);
      this.carrierControl.setValue(tripInfo.carrier ?? undefined);
      this.carrierModeControl.setValue(tripInfo.carrierMode ?? undefined);
      this.serviceLevelControl.setValue(tripInfo.serviceLevel ?? undefined);
      this.loadOriginAddress$.next(tripInfo.originAddress);
      this.loadDestinationAddress$.next(tripInfo.destinationAddress);
      this.loadBillToAddress$.next(tripInfo.billToAddress);
      this.loadFreightOrders$.next(tripInfo.freightOrders);
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

  compareServiceLevelWith(item: any, value: any): boolean {
    return item.value.level === (value.level || value);
  }

  compareCarrierWith(item: any, value: any) {
    return item.value.scac === value.scac;
  }

  compareCarrierModeWith(item: any, value: any) {
    return item.value.reportKeyMode === value.reportKeyMode ?
      item.value.reportModeDescription === value.reportModeDescription : false;
  }

  refreshCarrierData(): void {
    this.filteredCarrierModeOptions = this.filterCarrierModes();
    this.filteredServiceLevels = this.filterServiceLevels();

    if (!this.filteredCarrierModeOptions.some(opt => opt.value?.mode === this.carrierModeControl?.value?.mode)) {
      this.carrierModeControl.setValue(null);
    }

    const serviceLevelValue = this.serviceLevelControl?.value?.level || this.serviceLevelControl?.value;
    if (!this.filteredServiceLevels.some(opt => opt.value.level === serviceLevelValue)) {
      this.serviceLevelControl.setValue(null);
    }
  }
}

