import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {combineLatest, forkJoin, Observable, Subject} from 'rxjs';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../../services/subscription-manager';
import {FREIGHT_PAYMENT_TERM_OPTIONS, TripInformation} from '../../../models/invoice/trip-information-model';
import {MasterDataService} from '../../../services/master-data-service';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {CarrierReference, CarrierUtils} from '../../../models/master-data-models/carrier-model';
import {map} from 'rxjs/operators';
import {
  CarrierModeCodeReference,
  CarrierModeCodeUtils
} from '../../../models/master-data-models/carrier-mode-code-model';
import {ServiceLevel, ServiceLevelUtils} from '../../../models/master-data-models/service-level-model';
import {BillToLocation, BillToLocationUtils, LocationUtils, ShippingPointLocation, ShippingPointLocationSelectOption, ShippingPointWarehouseLocation} from 'src/app/models/location/location-model';
import {FreightOrder} from 'src/app/models/freight-order/freight-order-model';
import {CarrierSCAC} from '../../../models/master-data-models/carrier-scac';
import {NgbDateAdapter, NgbDateNativeAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {DateParserFormatter} from '../../../utils/date-parser-formatter';
import {CarrierDetailModel} from '../../../models/master-data-models/carrier-detail-model';
import { SubjectValue } from 'src/app/utils/subject-value';
import { InvoiceService } from 'src/app/services/invoice-service';
import {InvoiceDataModel, InvoiceUtils} from 'src/app/models/invoice/invoice-model';

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
  @Output() onUpdateAndContinueClickEvent = new EventEmitter<boolean>();
  @Output() openWeightAdjustmentModalEvent = new EventEmitter<any>();

  public freightPaymentTermOptions = FREIGHT_PAYMENT_TERM_OPTIONS;
  public carrierOptions: Array<SelectOption<CarrierReference>> = [];
  public carrierModeOptions: Array<SelectOption<CarrierModeCodeReference>> = [];
  public serviceLevelOptions: Array<SelectOption<ServiceLevel>> = [];
  public carrierSCACs: Array<CarrierSCAC> = [];
  public carrierDetails: Array<CarrierDetailModel> = [];

  public totalGrossWeight = new FormControl(0);
  public totalVolume = new FormControl(0);
  public totalPalletCount = new FormControl(0);

  public filteredCarrierModeOptions: Array<SelectOption<CarrierModeCodeReference>> = [];
  public filteredServiceLevels: Array<SelectOption<ServiceLevel>> = [];
  public masterDataShippingPoints: Array<ShippingPointLocationSelectOption> = [];
  public filteredShippingPoints$ = new Subject<Array<ShippingPointLocationSelectOption>>();
  public masterDataShippingPointWarehouses: Array<ShippingPointWarehouseLocation> = [];

  public tripIdControl = new FormControl();
  public vendorNumberControl = new FormControl({}, [required]);
  public freightOrders = new FormControl();
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
  public tripInformation: TripInformation = {} as TripInformation;
  public localPeristentTripInformation: TripInformation = {} as TripInformation;
  public assumedDeliveryDateTime: Date | undefined;
  public overriddenDeliveryDateTime: Date | undefined;
  public isPickupDateTimeTendered: boolean = false;
  public pickupDateMatchesTenderDate: boolean = false;
  public arrowLabelForDeliveryDateTime: string = "";
  public showArrowForDeliveryDateTime: boolean = false;

  public showFreightOrderSection = false;
  carrierDetailFound = true;
  loadOriginAddress$ = new Subject<ShippingPointLocation>();
  loadDestinationAddress$ = new Subject<ShippingPointLocation>();
  loadBillToAddress$ = new Subject<BillToLocation>();
  loadFreightOrders$ = new Subject<FreightOrder[]>();
  filteredCarrierModeOptionsPopulatedSubject: Subject<number> = new Subject<number>();

  // allow access static display utils in template
  carrierModeCodeUtilsToDisplayLabel = CarrierModeCodeUtils.toDisplayLabel;
  carrierUtilsToDisplayLabel = CarrierUtils.toDisplayLabel;

  public isTripEditMode$ = new SubjectValue<boolean>(false);

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager,
    private masterData: MasterDataService, private changeDetection: ChangeDetectorRef,
    private invoiceService: InvoiceService) {
  }

  ngOnInit(): void {
    this.formGroup = this._formGroup;
    this.formGroup.disable();
    let observables: Observable<any>[] = [this.masterData.getCarrierSCACs(),
      this.masterData.getCarrierModeCodes().pipe(map(CarrierModeCodeUtils.toOptions)),
      this.masterData.getCarriers().pipe(map(CarrierUtils.toOptions)),
      this.masterData.getServiceLevels().pipe(map(ServiceLevelUtils.toOptions)),
      this.masterData.getCarrierDetails(),
      this.invoiceService.getMasterDataShippingPointWarehouses().pipe(map(InvoiceUtils.toShippingPointWarehouseLocations)),
      this.invoiceService.getMasterDataShippingPoints().pipe(map(InvoiceUtils.toShippingPointLocations))];
    this.subscriptionManager.manage(
      forkJoin(observables).subscribe(
        ([carrierSCACs,
           carrierModeCodes,
           carrierReferences,
           serviceLevels,
           carrierDetails,
           masterDataShippingPointWarehouses,
           masterDataShippingPoints]) => {
          this.masterDataShippingPointWarehouses = masterDataShippingPointWarehouses;
          this.masterDataShippingPoints = masterDataShippingPoints;
          this.carrierSCACs = carrierSCACs;
          this.carrierOptions = carrierReferences;
          this.carrierControl.setValidators([
            required,
            this.validateIsOption(this.carrierOptions, this.compareCarrierWith)
          ]);
          this.carrierControl.updateValueAndValidity();
          this.carrierModeOptions = carrierModeCodes;
          this.filteredCarrierModeOptions = this.filterCarrierModes();
          this.carrierModeControl.setValidators([
            required,
            this.validateIsOption(this.filteredCarrierModeOptions, this.compareCarrierModeWith)
          ]);
          this.carrierModeControl.updateValueAndValidity();
          this.serviceLevelOptions = serviceLevels;
          this.carrierDetails = carrierDetails;
          this.carrierModeControl.setValue(this.tripInformation.carrierMode);
          this.filteredCarrierModeOptionsPopulatedSubject.next(0);
        }
      ),
    );
  }

  isInvalid(control: AbstractControl): boolean {
    return !!this.runValidator(control);
  }

  runValidator(control: AbstractControl): ValidationErrors | null {
    return control.validator ? control.validator(control) : null;
  }

  validateIsOption<T>(options: Array<SelectOption<T>>, comparator: (a: T, b: T) => boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return (!options.map(op => op.value)
        .some(opv => comparator(opv, control.value)))
        ? {invalidSelectOption: true}
        : null;
    };
  }

  @Input() set formGroup(givenFormGroup: FormGroup) {
    givenFormGroup.setControl('tripId', this.tripIdControl);
    givenFormGroup.setControl('vendorNumber', this.vendorNumberControl);
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
    givenFormGroup.setControl('freightOrders', this.freightOrders);
    givenFormGroup.setControl('totalGrossWeight', this.totalGrossWeight);
    givenFormGroup.setControl('totalVolume', this.totalVolume);
    givenFormGroup.setControl('totalPalletCount', this.totalPalletCount);
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

  populateVendorNumberByScac(scac: CarrierReference): void {
    const foundCarrierDetails: CarrierDetailModel | undefined = this.carrierDetails.find((carrierDetail) => {
      return carrierDetail.carrierSCAC === scac.scac;
    });

    if (foundCarrierDetails) {
      this.vendorNumberControl.setValue(foundCarrierDetails.vendorNumber);
      this.carrierDetailFound = true;
    } else {
      this.vendorNumberControl.setValue(null);
      this.carrierDetailFound = false;
    }

  }

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => {
        this.isTripEditMode$.value = isEditMode;
        this.isTripEditMode$.value ? this._editableFormArray.enable() : this._editableFormArray.disable();
      }
    ));
  }

  @Input() set loadTripInformation$(observable: Observable<TripInformation>) {
    this.subscriptionManager.manage(combineLatest([
      this.filteredCarrierModeOptionsPopulatedSubject.asObservable(),
      observable
    ]).subscribe(([populated, tripInfo]) => {
      this.loadTripInformationData(tripInfo);
    }));
  }

  loadTripInformationData(tripInfo: TripInformation) {
    this.localPeristentTripInformation = this.tripInformation = tripInfo;
      if (this._editableFormArray.disabled) {
        this.formGroup.enable();
      }
      this.tripIdControl.setValue(tripInfo.tripId ?? 'N/A');
      this.vendorNumberControl.setValue(tripInfo.vendorNumber);
      this.vendorNumberControl.markAsDirty();
      this.invoiceDateControl.setValue(tripInfo.invoiceDate ?? undefined);
      this.pickUpDateControl.setValue(this.derivePickupDate(tripInfo));
      this.deliveryDateControl.setValue(this.deriveDeliveryDate(tripInfo));
      this.proTrackingNumberControl.setValue(tripInfo.proTrackingNumber ?? 'N/A');
      this.bolNumberControl.setValue(tripInfo.bolNumber ?? 'N/A');
      this.freightPaymentTermsControl.setValue(tripInfo.freightPaymentTerms ?? undefined);
      this.carrierControl.valueChanges.subscribe(() => {
        this.filteredCarrierModeOptions = this.filterCarrierModes();
        this.carrierModeControl.setValidators([
          required,
          this.validateIsOption(this.filteredCarrierModeOptions, this.compareCarrierModeWith)
        ]);
        this.filteredServiceLevels = this.filterServiceLevels();
        this.carrierModeControl.updateValueAndValidity();
      });
      this.carrierControl.setValue(tripInfo.carrier ?? undefined);
      this.changeDetection.detectChanges();
      this.carrierModeControl.setValue(tripInfo.carrierMode ?? undefined);
      this.serviceLevelControl.setValue(tripInfo.serviceLevel ?? undefined);
      this.freightOrders.setValue(tripInfo.freightOrders ?? undefined);
      this.loadOriginAddress$.next(tripInfo.originAddress);
      this.filteredShippingPoints$.next(this.masterDataShippingPoints.filter(function (shippingPointLocation) {
        return shippingPointLocation.businessUnit == tripInfo.businessUnit
      }));
      this.loadDestinationAddress$.next(tripInfo.destinationAddress);
      this.loadBillToAddress$.next(tripInfo.billToAddress);
      this.loadFreightOrders$.next(tripInfo.freightOrders);
      this.totalGrossWeight.setValue(tripInfo.totalGrossWeight);
      this.formGroup.updateValueAndValidity();
      if (this._editableFormArray.disabled) {
        this.formGroup.disable();
      }
  }

  derivePickupDate(tripInfo?: TripInformation): Date | undefined {
   let deliveryDate = tripInfo?.deliveryDate?.getTime();
  if (tripInfo?.pickUpDate?.getTime() == tripInfo?.tripTenderTime?.getTime()) {
    this.pickupDateMatchesTenderDate = true;
  } else if (tripInfo?.pickUpDate && tripInfo.tripTenderTime && deliveryDate == tripInfo.tripTenderTime.getTime()) {
      this.isPickupDateTimeTendered = true;
   }
   return tripInfo?.pickUpDate ?? undefined;
  }

  deriveDeliveryDate(tripInfo: TripInformation): Date | undefined {
    let dateToReturn: Date | undefined;
    let foDeliveryDateTime = tripInfo.freightOrders[0]?.deliverydatetime;
    let overriddenDeliveryDateTime = tripInfo.overriddenDeliveryDateTime;
    let assumedDeliveryDateTime = tripInfo.assumedDeliveryDateTime;
    if (foDeliveryDateTime) {
      dateToReturn = new Date(foDeliveryDateTime);
      this.showArrowForDeliveryDateTime = false;
    } else if (overriddenDeliveryDateTime) {
      dateToReturn = overriddenDeliveryDateTime;
      this.showArrowForDeliveryDateTime = true;
      this.arrowLabelForDeliveryDateTime = 'OVERRIDDEN';
    } else if (assumedDeliveryDateTime) {
      dateToReturn = assumedDeliveryDateTime;
      this.showArrowForDeliveryDateTime = true;
      this.arrowLabelForDeliveryDateTime = 'ASSUMED';
    } else {
      dateToReturn = tripInfo.createdDate;
      this.showArrowForDeliveryDateTime = true;
      this.arrowLabelForDeliveryDateTime = 'CREATED';
    }
    return dateToReturn;
  }

  clickEditButton(): void {
    this.isTripEditMode$.value = true;
    this._editableFormArray.enable();
  }

  clickCancelButton(): void {
    this.isTripEditMode$.value = false;
    this._editableFormArray.disable();
    this.loadTripInformationData(this.localPeristentTripInformation);
    this.onUpdateAndContinueClickEvent.emit(false);
  }

  clickUpdateButton(): void {
    this.localPeristentTripInformation.pickUpDate = this.pickUpDateControl.value;
    this.localPeristentTripInformation.carrier = this.carrierControl.value;
    this.localPeristentTripInformation.carrierMode = this.carrierModeControl.value;
    this.localPeristentTripInformation.serviceLevel = this.serviceLevelControl.value;

    const originAddressFormGroup = this.originAddressFormGroup;
    this.localPeristentTripInformation.originAddress = LocationUtils.extractShippingPointLocation(originAddressFormGroup, 'origin');
    const destinationAddressFormGroup = this.destinationAddressFormGroup;
    this.localPeristentTripInformation.destinationAddress = LocationUtils.extractShippingPointLocation(destinationAddressFormGroup, 'destination', this.localPeristentTripInformation.destinationAddress?.code);
    const billToAddressFormGroup = this.billToAddressFormGroup;
    this.localPeristentTripInformation.billToAddress = BillToLocationUtils.extractBillToLocation(billToAddressFormGroup);
    this.onUpdateAndContinueClickEvent.emit(true);
  }

  updateBillToEvent($event: any): void {
    let shippingPointWarehouse = this.masterDataShippingPointWarehouses.find(function(spWarehouse){
      return spWarehouse.shippingPointCode == $event
    });
    if (shippingPointWarehouse?.billto) {
      this.loadBillToAddress$.next(shippingPointWarehouse.billto);
    }
  }

  toggleFreightOrderDetailsSection(): void {
    this.showFreightOrderSection = !this.showFreightOrderSection;
  }

  compareWith(item: any, value: any): boolean {
    return item.id === value.id;
  }

  compareServiceLevelWith(item: any, value: any): boolean {
    return item?.level === (value?.level || value);
  }

  compareCarrierWith(a: any, b: any): boolean {
    const aScac = a?.scac ?? a?.value?.scac;
    const bScac = b?.scac ?? b?.value?.scac;
    return aScac === bScac;
  }

  compareCarrierModeWith(a: any, b: any): boolean {
    const aReportKeyMode = a?.reportKeyMode ?? a?.value?.reportKeyMode;
    const bReportKeyMode = b?.reportKeyMode ?? b?.value?.reportKeyMode;
    const aReportModeDescription = a?.reportModeDescription ?? a?.value?.reportModeDescription;
    const bReportModeDescription = b?.reportModeDescription ?? b?.value?.reportModeDescription;
    return aReportKeyMode === bReportKeyMode
      && aReportModeDescription === bReportModeDescription;
  }

  refreshCarrierData(): void {
    this.filteredCarrierModeOptions = this.filterCarrierModes();
    this.filteredServiceLevels = this.filterServiceLevels();
    this.populateVendorNumberByScac(this.carrierControl.value);

    if (!this.filteredCarrierModeOptions.some(opt => opt.value?.mode === this.carrierModeControl?.value?.mode)) {
      this.carrierModeControl.setValue(null);
    }

    const serviceLevelValue = this.serviceLevelControl?.value?.level || this.serviceLevelControl?.value;
    if (!this.filteredServiceLevels.some(opt => opt.value.level === serviceLevelValue)) {
      this.serviceLevelControl.setValue(null);
    }
  }

  updateFreightOrderTotals(totals: any): void {
    this.totalVolume.setValue(totals.totalVolume);
    this.totalPalletCount.setValue(totals.totalPalletCount);
  }

  openWeightAdjustmentModal(): void {
    this.openWeightAdjustmentModalEvent.emit(this.totalGrossWeight.value);
  }
}

