import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {forkJoin, Observable, Subject, Subscription} from 'rxjs';
import {FREIGHT_PAYMENT_TERM_OPTIONS, TripInformation, WeightAdjustment} from '../../../models/invoice/trip-information-model';
import {MasterDataService} from '../../../services/master-data-service';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {CarrierReference, CarrierUtils} from '../../../models/master-data-models/carrier-model';
import {map} from 'rxjs/operators';
import {
  CarrierModeCodeReference,
  CarrierModeCodeUtils
} from '../../../models/master-data-models/carrier-mode-code-model';
import {ServiceLevel, ServiceLevelUtils} from '../../../models/master-data-models/service-level-model';
import {
  BillToLocation,
  BillToLocationUtils,
  LocationUtils,
  ShippingPointLocation,
  ShippingPointLocationSelectOption,
  ShippingPointWarehouseLocation
} from 'src/app/models/location/location-model';
import {FreightOrder} from 'src/app/models/freight-order/freight-order-model';
import {CarrierSCAC} from '../../../models/master-data-models/carrier-scac';
import {NgbDateAdapter, NgbDateNativeAdapter, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {DateParserFormatter} from '../../../utils/date-parser-formatter';
import {CarrierDetailModel} from '../../../models/master-data-models/carrier-detail-model';
import {SubjectValue} from 'src/app/utils/subject-value';
import {InvoiceService} from 'src/app/services/invoice-service';
import {InvoiceUtils} from 'src/app/models/invoice/invoice-model';
import {CustomValidators, validateAlphanumeric} from '../../../utils/falcon-validators';
import { DateTime } from 'luxon';
import { ElmValidators } from '@elm/elm-styleguide-ui';

const {required, maxLength} = Validators;

export function validateDate(control: AbstractControl): ValidationErrors | null {
  const dateString = control.value;
  if (dateString) {
    if (DateTime.fromISO(dateString) >= DateTime.now()) {
      return {dateBefore: true};
    }
  }
  return null;
}

@Component({
  selector: 'app-trip-information',
  templateUrl: './trip-information.component.html',
  styleUrls: ['./trip-information.component.scss'],
})
export class TripInformationComponent implements OnInit, OnDestroy{
  @Output() updateAndContinueClickEvent = new EventEmitter<any>();
  @Output() openWeightAdjustmentModalEvent = new EventEmitter<any>();
  @Output() refreshMasterDataEvent = new EventEmitter<any>();

  public readonly MAX_BOL_NUMBER_LENGTH = 35;

  public freightPaymentTermOptions = FREIGHT_PAYMENT_TERM_OPTIONS;
  public carrierOptions: Array<SelectOption<CarrierReference>> = [];
  public carrierModeOptions: Array<SelectOption<CarrierModeCodeReference>> = [];
  public serviceLevelOptions: Array<SelectOption<ServiceLevel>> = [];
  public carrierSCACs: Array<CarrierSCAC> = [];
  public carrierDetails: Array<CarrierDetailModel> = [];

  public totalGrossWeight = new FormControl({value: 0, disabled: true});
  public originalTotalGrossWeight = new FormControl(0);
  public weightAdjustments = new FormArray([]);
  public totalVolume = new FormControl({value: 0, disabled: true});
  public totalPalletCount = new FormControl({value: 0, disabled: true});

  public filteredCarrierModeOptions: Array<SelectOption<CarrierModeCodeReference>> = [];
  public filteredServiceLevels: Array<SelectOption<ServiceLevel>> = [];
  public masterDataShippingPoints: Array<ShippingPointLocationSelectOption> = [];
  public filteredShippingPoints$ = new Subject<Array<ShippingPointLocationSelectOption>>();
  public masterDataShippingPointWarehouses: Array<ShippingPointWarehouseLocation> = [];

  public tripIdControl = new FormControl();
  public vendorNumberControl = new FormControl({}, [required]);
  public freightOrders = new FormControl();
  public invoiceDateControl = new FormControl({}, [required]);
  public pickUpDateControl = new FormControl({}, [ElmValidators.required(), validateDate]);
  public deliveryDateControl = new FormControl({}, [required]);
  public proTrackingNumberControl = new FormControl({}, [required]);
  public bolNumberControl = new FormControl({}, [CustomValidators.requiredNonNA, validateAlphanumeric,maxLength(this.MAX_BOL_NUMBER_LENGTH)]);
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
    this.serviceLevelControl,
    this.bolNumberControl,
  ]);
  public tripInformation: TripInformation = {} as TripInformation;
  public localPeristentTripInformation: TripInformation = {} as TripInformation;
  public assumedDeliveryDateTime: Date | undefined;
  public overriddenDeliveryDateTime: Date | undefined;
  public isPickupDateTimeTendered = false;
  public pickupDateMatchesTenderDate = false;
  public arrowLabelForDeliveryDateTime = '';
  public showArrowForDeliveryDateTime = false;
  public hasWeightAdjustments = false;

  public showFreightOrderSection = false;
  public showWeightAdjustmentSection = false;
  carrierDetailFound = true;
  loadOriginAddress$ = new Subject<ShippingPointLocation>();
  loadDestinationAddress$ = new Subject<ShippingPointLocation>();
  loadBillToAddress$ = new Subject<BillToLocation>();
  loadFreightOrders$ = new Subject<FreightOrder[]>();
  filteredCarrierModeOptionsPopulatedSubject: Subject<number> = new Subject<number>();

  // allow access static display utils in template
  carrierModeCodeUtilsToDisplayLabel = CarrierModeCodeUtils.toDisplayLabel;
  carrierUtilsToDisplayLabel = CarrierUtils.toDisplayLabel;

  public enableTripEditButton = false;
  public isTripEditMode$ = new SubjectValue<boolean>(false);

  private loadTripInformationSubscription = new Subscription();
  private isEditModeSubscription = new Subscription();

  private readonly subscriptions = new Subscription();

  constructor(private masterData: MasterDataService, private changeDetection: ChangeDetectorRef,
              private invoiceService: InvoiceService) {
                
  }

  ngOnInit(): void {
    this.formGroup = this._formGroup;
    this.formGroup.disable();
    const observables: Observable<any>[] = [this.masterData.getCarrierSCACs(),
      this.masterData.getCarrierModeCodes().pipe(map(CarrierModeCodeUtils.toOptions)),
      this.masterData.getCarriers().pipe(map(CarrierUtils.toOptions)),
      this.masterData.getServiceLevels().pipe(map(ServiceLevelUtils.toOptions)),
      this.masterData.getCarrierDetails(),
      this.invoiceService.getMasterDataShippingPointWarehouses().pipe(map(InvoiceUtils.toShippingPointWarehouseLocations)),
      this.invoiceService.getMasterDataShippingPoints().pipe(map(InvoiceUtils.toShippingPointLocations))];
    this.subscriptions.add(
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
          this.filteredCarrierModeOptionsPopulatedSubject.next(0);
          this.filteredCarrierModeOptionsPopulatedSubject.complete();
        }
      ),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
    givenFormGroup.setControl('originalTotalGrossWeight', this.originalTotalGrossWeight);
    givenFormGroup.setControl('weightAdjustments', this.weightAdjustments);
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
    this.isEditModeSubscription.unsubscribe();
    this.isEditModeSubscription = observable.subscribe(
      isGlobalEditMode => {
        this.enableTripEditButton = isGlobalEditMode;
      }
    );
  }

  @Input() set loadTripInformation$(observable: Observable<TripInformation>) {
    this.loadTripInformationSubscription.unsubscribe();
    this.loadTripInformationSubscription = observable.subscribe(
      async tripInfo => {
        // TODO fix this workaround
        await this.loadTripInformationData(tripInfo);
        // running the loading logic twice because it always fails to properly load the first time
        await this.loadTripInformationData(tripInfo);
      }
    );
  }

  async loadTripInformationData(tripInfo: TripInformation): Promise<void> {
    // wait on the options to be loaded before moving on
    await this.filteredCarrierModeOptionsPopulatedSubject.toPromise();
    this.localPeristentTripInformation = this.tripInformation = tripInfo;
    if (this._editableFormArray.disabled) {
      this.formGroup.enable();
    }
    this.tripIdControl.setValue(tripInfo.tripId ?? 'N/A');
    this.vendorNumberControl.setValue(tripInfo.vendorNumber);
    this.vendorNumberControl.markAsDirty();
    this.invoiceDateControl.setValue(tripInfo.invoiceDate?.toISOString() ?? undefined);
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
    this.filteredShippingPoints$.next(this.masterDataShippingPoints.filter(
      shippingPointLocation => shippingPointLocation.businessUnit == tripInfo.businessUnit)
    );
    this.loadDestinationAddress$.next(tripInfo.destinationAddress);
    this.loadBillToAddress$.next(tripInfo.billToAddress);
    this.loadFreightOrders$.next(tripInfo.freightOrders);
    this.totalGrossWeight.setValue(tripInfo.totalGrossWeight);
    this.originalTotalGrossWeight.setValue(tripInfo.originalTotalGrossWeight);
    this.weightAdjustments.clear();
    tripInfo.weightAdjustments
      ?.map(this.toWeightAdjustmentFormGroup)
      .forEach(fg => this.weightAdjustments.push(fg));
    this.hasWeightAdjustments = this.weightAdjustments.controls.length > 0;
    this.formGroup.updateValueAndValidity();
    if (this._editableFormArray.disabled) {
      this.formGroup.disable();
    }
  }

  public toWeightAdjustmentFormGroup(weightAdjustment: WeightAdjustment): FormGroup {
    const formGroup = new FormGroup({
      amount: new FormControl(weightAdjustment.amount),
      customerCategory: new FormControl(weightAdjustment.customerCategory),
      freightClasses: new FormControl(weightAdjustment.freightClasses.join(', '))
    });
    formGroup.disable();
    return formGroup;
  }

  derivePickupDate(tripInfo?: TripInformation): any | undefined {
    const deliveryDate = tripInfo?.deliveryDate?.getTime();
    if (tripInfo?.pickUpDate?.getTime() == tripInfo?.tripTenderTime?.getTime()
      && tripInfo?.tripTenderTime?.getTime() != null) {
      this.pickupDateMatchesTenderDate = true;
    } else if (tripInfo?.pickUpDate && tripInfo.tripTenderTime && deliveryDate == tripInfo.tripTenderTime.getTime()) {
      this.isPickupDateTimeTendered = true;
    }
    return tripInfo?.pickUpDate?.toISOString() ?? undefined;
  }

  deriveDeliveryDate(tripInfo: TripInformation): any | undefined {
    let dateToReturn: Date | undefined = tripInfo.deliveryDate ? new Date(tripInfo.deliveryDate) : undefined ;
    const overriddenDeliveryDateTime = tripInfo.overriddenDeliveryDateTime;
    const assumedDeliveryDateTime = tripInfo.assumedDeliveryDateTime;
    if (overriddenDeliveryDateTime && overriddenDeliveryDateTime.getTime() == dateToReturn?.getTime()) {
      dateToReturn = overriddenDeliveryDateTime;
      this.showArrowForDeliveryDateTime = true;
      this.arrowLabelForDeliveryDateTime = 'OVERRIDDEN';
    } else if (assumedDeliveryDateTime && assumedDeliveryDateTime.getTime() == dateToReturn?.getTime()) {
      dateToReturn = assumedDeliveryDateTime;
      this.showArrowForDeliveryDateTime = true;
      this.arrowLabelForDeliveryDateTime = 'ASSUMED';
    } else if (tripInfo.createdDate && tripInfo.createdDate.getTime() == dateToReturn?.getTime()) {
      dateToReturn = tripInfo.createdDate;
      this.showArrowForDeliveryDateTime = true;
      this.arrowLabelForDeliveryDateTime = 'CREATED';
    } else if (dateToReturn) {
      this.showArrowForDeliveryDateTime = false;
      this.arrowLabelForDeliveryDateTime = '';
    } 
    return dateToReturn?.toISOString() ?? undefined;
  }

  clickEditButton(): void {
    this.isTripEditMode$.value = true;
    this._editableFormArray.enable();
    this.updateAndContinueClickEvent.emit({event: 'edit', value: false});
  }

  clickCancelButton(): void {
    this.loadTripInformationData(this.localPeristentTripInformation);
    this.updateAndContinueClickEvent.emit({event: 'cancel', value: false});
    this.isTripEditMode$.value = false;
    this._editableFormArray.disable();
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
    this.updateAndContinueClickEvent.emit({event: 'update', value: true});
    this.isTripEditMode$.value = false;
    this._editableFormArray.disable();
  }

  updateBillToEvent($event: any): void {
    const shippingPointWarehouse = this.masterDataShippingPointWarehouses.find(
      spWarehouse => spWarehouse.shippingPointCode == $event
    );
    if (shippingPointWarehouse?.billto) {
      this.loadBillToAddress$.next(shippingPointWarehouse.billto);
    }
  }

  toggleFreightOrderDetailsSection(): void {
    this.showFreightOrderSection = !this.showFreightOrderSection;
  }

  toggleWeightAdjustmentDetailsSection(): void {
    this.showWeightAdjustmentSection = !this.showWeightAdjustmentSection;
  }

  compareWith(item: any, value: any): boolean {
    return item.id === value.id;
  }

  compareServiceLevelWith(a: any, b: any): boolean {
    const aLevel = a?.level ?? a?.value?.level;
    const bLevel = b?.level ?? b?.value?.level;
    return (aLevel === bLevel) || (aLevel === b);
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

  refreshMasterData(): void {
    this.refreshMasterDataEvent.emit();
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

  get hasAnyWeightToleranceError(): boolean {
    return !!this.tripInformation.freightOrders
      ?.map(fo => !!fo.hasWeightError)
      ?.some(err => err);
  }

  get isValidBolNumber(): boolean {
    let value: string = this.bolNumberControl.value ?? '';
    return !(typeof value === 'string' && value.toLocaleLowerCase() === 'n/a');
  }

  get bolNumberControlErrorMessages(): Array<string> {
    const messages = [];
    if (this.bolNumberControl.errors?.required || !this.isValidBolNumber) {
      messages.push('BOL Number is missing');
    }
    if (this.bolNumberControl.errors?.pattern) {
      messages.push('Contains invalid characters');
    }
    if (this.bolNumberControl.errors?.maxlength) {
      messages.push('Maximum characters ' + this.MAX_BOL_NUMBER_LENGTH);
    }
    return messages;
  }

}

