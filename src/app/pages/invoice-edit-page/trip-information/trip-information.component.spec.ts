import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {TripInformationComponent} from './trip-information.component';
import {FalconTestingModule} from '../../../testing/falcon-testing.module';
import {MasterDataService} from '../../../services/master-data-service';
import {of, Subject} from 'rxjs';
import {Carrier, TenderMethod} from '../../../models/master-data-models/carrier-model';
import {YesNo} from '../../../models/master-data-models/yes-no-model';
import {CarrierModeCode, TripType} from '../../../models/master-data-models/carrier-mode-code-model';
import {ServiceLevel} from '../../../models/master-data-models/service-level-model';
import {FormControl, FormGroup} from '@angular/forms';
import {FreightPaymentTerms, TripInformation} from '../../../models/invoice/trip-information-model';
import {CarrierSCAC} from '../../../models/master-data-models/carrier-scac';
import {CarrierDetailModel} from '../../../models/master-data-models/carrier-detail-model';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import { FreightOrder } from 'src/app/models/freight-order/freight-order-model';

describe('TripInformationComponent', () => {

  let component: TripInformationComponent;
  let fixture: ComponentFixture<TripInformationComponent>;
  let masterDataService: MasterDataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [TripInformationComponent]
    }).compileComponents();

    // Mock MasterDataService
    masterDataService = TestBed.inject(MasterDataService);


    // Create Component
    fixture = TestBed.createComponent(TripInformationComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  describe('after component creation', () => {

    beforeEach(() => {
      spyOn(masterDataService, 'getCarrierSCACs').and.returnValue(of([]));
      spyOn(masterDataService, 'getCarriers').and.returnValue(of([]));
      spyOn(masterDataService, 'getCarrierModeCodes').and.returnValue(of([]));
      spyOn(masterDataService, 'getServiceLevels').and.returnValue(of([]));
    });

    it('should have component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
    it('formGroup should be disabled', () => {
      fixture.detectChanges();
      expect(component.formGroup.disabled).toBeTrue();
    });
    it('should have zero carrier options', () => {
      fixture.detectChanges();
      expect(component.carrierSCACs).toEqual([]);
    });
    it('should have zero carrier options', () => {
      fixture.detectChanges();
      expect(component.carrierOptions).toEqual([]);
    });
    it('should have zero carrier mode options', () => {
      fixture.detectChanges();
      expect(component.carrierModeOptions).toEqual([]);
    });
    it('should have zero service level options', () => {
      fixture.detectChanges();
      expect(component.serviceLevelOptions).toEqual([]);
    });
    it('should have controls in formGroup', () => {
      fixture.detectChanges();
      expect(Object.keys(component.formGroup.controls).length).toBe(15);
    });
  });


  describe('#forkJoin', () => {
    const CARRIER: Carrier = {
      name: 'Test Carrier',
      scac: 'TCS',
      tenderAutoAccept: YesNo.NO,
      tenderMethod: TenderMethod.NONE
    };
    const CARRIER_DETAIL: CarrierDetailModel = {
      carrierSCAC: 'ABCD',
      vendorNumber: '1234321',
    };
    const CARRIER_SCAC: CarrierSCAC = {
      scac: 'TCS',
      mode: 'LTL',
      serviceLevel: 't1'
    };
    const CARRIER_MODE: CarrierModeCode = {
      mode: 'LTL',
      reportKeyMode: 'TLTL',
      reportModeDescription: 'Test Mode Description',
      tripType: TripType.NONE
    };
    const SERVICE_LEVEL: ServiceLevel = {
      level: 't1',
      name: 'Test Service Level'
    };
    beforeEach(() => {
      spyOn(masterDataService, 'getCarriers').and.returnValue(of([CARRIER]));
      spyOn(masterDataService, 'getCarrierDetails').and.returnValue(of([CARRIER_DETAIL]));
      spyOn(masterDataService, 'getCarrierSCACs').and.returnValue(of([CARRIER_SCAC]));
      spyOn(masterDataService, 'getCarrierModeCodes').and.returnValue(of([CARRIER_MODE]));
      spyOn(masterDataService, 'getServiceLevels').and.returnValue(of([SERVICE_LEVEL]));
      component.ngOnInit();
    });
    it('should have carrier option', () => {
      fixture.detectChanges();
      expect(component.carrierOptions).toEqual([{
        label: 'TCS (Test Carrier)',
        value: CARRIER
      }]);
    });
    it('should have carrier details', () => {
      fixture.detectChanges();
      expect(component.carrierDetails).toEqual([{
        carrierSCAC: 'ABCD',
        vendorNumber: '1234321'
      }]);
    });
    it('should have carrier option', () => {
      fixture.detectChanges();
      expect(component.carrierSCACs).toEqual([{
        scac: 'TCS',
        mode: 'LTL',
        serviceLevel: 't1'
      }]);
    });
    it('should have carrier mode option', () => {
      fixture.detectChanges();
      expect(component.carrierModeOptions).toEqual([{
        label: 'TLTL (Test Mode Description)',
        value: CARRIER_MODE
      }]);
    });
    it('should have service level option', () => {
      fixture.detectChanges();
      expect(component.serviceLevelOptions).toEqual([{
        label: 't1 (Test Service Level)',
        value: SERVICE_LEVEL
      }]);
    });
  });

  describe('selection compare', () => {
    const CARRIER: Carrier = {
      name: 'Test Carrier',
      scac: 'TCS',
      tenderAutoAccept: YesNo.NO,
      tenderMethod: TenderMethod.NONE
    };

    const selectedCarrier: Carrier = {
      name: 'Test Carrier',
      scac: 'TCS',
      tenderAutoAccept: YesNo.NO,
      tenderMethod: TenderMethod.NONE
    };

    it('it should compare the two values', () => {
      fixture.detectChanges();
      const result = component.compareWith(CARRIER, selectedCarrier);
      expect(result).toBe(true);
    });

  });

  describe('#formGroup', () => {
    let parentFormGroup: FormGroup;
    beforeEach(() => {
      parentFormGroup = new FormGroup({});
    });
    it('should have default value', () => {
      fixture.detectChanges();
      expect(component.formGroup).toBeTruthy();
      expect(component.formGroup).not.toBe(parentFormGroup);
    });
    describe('given a new form group', () => {
      beforeEach(() => {
        component.formGroup = parentFormGroup;
      });
      it('should accept input from parent', () => {
        fixture.detectChanges();
        expect(component.formGroup).toBe(parentFormGroup);
      });
      it('should inject tripId control', () => {
        fixture.detectChanges();
        expect(component.tripIdControl).toBeTruthy();
      });
      it('should inject invoiceDate control', () => {
        fixture.detectChanges();
        expect(component.invoiceDateControl).toBeTruthy();
      });
      it('should inject pickUpDate control', () => {
        fixture.detectChanges();
        expect(component.pickUpDateControl).toBeTruthy();
      });
      it('should inject deliveryDate control', () => {
        fixture.detectChanges();
        expect(component.deliveryDateControl).toBeTruthy();
      });
      it('should inject proTrackingNumber control', () => {
        fixture.detectChanges();
        expect(component.proTrackingNumberControl).toBeTruthy();
      });
      it('should inject bolNumber control', () => {
        fixture.detectChanges();
        expect(component.bolNumberControl).toBeTruthy();
      });
      it('should inject freightPaymentTerms control', () => {
        fixture.detectChanges();
        expect(component.freightPaymentTermsControl).toBeTruthy();
      });
      it('should inject carrier control', () => {
        fixture.detectChanges();
        expect(component.carrierControl).toBeTruthy();
      });
      it('should inject carrierMode control', () => {
        fixture.detectChanges();
        expect(component.carrierModeControl).toBeTruthy();
      });
      it('should inject serviceLevel control', () => {
        fixture.detectChanges();
        expect(component.serviceLevelControl).toBeTruthy();
      });
    });
  });

  describe('when populateVendorNumberByScac is invoked', () => {

    beforeEach(() => {
      component.carrierDetails = [
        {
          carrierSCAC: 'ABCD',
          vendorNumber: '1234321',
        }
      ];
    });

    it('should set vendorNumber when carrier details found', () => {
      component.populateVendorNumberByScac({scac: 'ABCD', name: 'Vandalay Industries'});

      expect(component.carrierDetailFound).toBeTrue();
      expect(component.vendorNumberControl.value).toEqual(component.carrierDetails[0].vendorNumber);
    });


    it('should not set vendorNumber when carrier details not found', () => {
      component.populateVendorNumberByScac({scac: 'EFGH', name: 'Kramerica'});

      expect(component.carrierDetailFound).toBeFalse();
      expect(component.vendorNumberControl.value).toBeNull();
    });
  });

  describe('when pickup date time is not tendered', () => {
    it('pickup date cannot be derived', () => {

      var customDeliveryDate = new Date(2020, 10, 30);
      const tripInformation: TripInformation = {
        bolNumber: 'TestBolNumber',
        carrier: {
          scac: 'TestScac',
          name: 'TestCarrierName'
  
        },
        carrierMode: {
          mode: 'CarrierMode',
          reportModeDescription: 'ReportModeDescription',
          reportKeyMode: 'ReportKeyMode'
        },
        deliveryDate: customDeliveryDate,
        freightPaymentTerms: FreightPaymentTerms.THIRD_PARTY,
        invoiceDate: new Date(),
        pickUpDate: new Date(),
        proTrackingNumber: 'TestProTrackingNumber',
        serviceLevel: {
          level: 'TL1',
          name: 'TestLevel'
        },
        tripId: 'TestTripId',
        freightOrders: [],
        vendorNumber: '1234321'
      };

      component.derivePickupDate(tripInformation);

      expect(component.isPickupDateTimeTendered).toBeFalse();
    });

    it('pickup date can be derived and tendered', () => {

      var customDeliveryDate = new Date(2020, 10, 30);
      const tripInformation: TripInformation = {
        bolNumber: 'TestBolNumber',
        carrier: {
          scac: 'TestScac',
          name: 'TestCarrierName'
  
        },
        carrierMode: {
          mode: 'CarrierMode',
          reportModeDescription: 'ReportModeDescription',
          reportKeyMode: 'ReportKeyMode'
        },
        deliveryDate: customDeliveryDate,
        freightPaymentTerms: FreightPaymentTerms.THIRD_PARTY,
        invoiceDate: new Date(),
        pickUpDate: new Date(),
        tripTenderTime: customDeliveryDate,
        proTrackingNumber: 'TestProTrackingNumber',
        serviceLevel: {
          level: 'TL1',
          name: 'TestLevel'
        },
        tripId: 'TestTripId',
        freightOrders: [],
        vendorNumber: '1234321'
      };

      component.derivePickupDate(tripInformation);

      expect(component.isPickupDateTimeTendered).toBeTrue();
    });

    it('pickup date is null', () => {

      var customDeliveryDate = new Date(2020, 10, 30);
      const tripInformation: TripInformation = {
        bolNumber: 'TestBolNumber',
        carrier: {
          scac: 'TestScac',
          name: 'TestCarrierName'
  
        },
        carrierMode: {
          mode: 'CarrierMode',
          reportModeDescription: 'ReportModeDescription',
          reportKeyMode: 'ReportKeyMode'
        },
        deliveryDate: customDeliveryDate,
        freightPaymentTerms: FreightPaymentTerms.THIRD_PARTY,
        invoiceDate: new Date(),
        pickUpDate: undefined,
        tripTenderTime: customDeliveryDate,
        proTrackingNumber: 'TestProTrackingNumber',
        serviceLevel: {
          level: 'TL1',
          name: 'TestLevel'
        },
        tripId: 'TestTripId',
        freightOrders: [],
        vendorNumber: '1234321'
      };

      component.derivePickupDate(tripInformation);

      expect(component.isPickupDateTimeTendered).toBeFalsy();
    });

    it('tripTenderTime is null', () => {

      var customDeliveryDate = new Date(2020, 10, 30);
      const tripInformation: TripInformation = {
        bolNumber: 'TestBolNumber',
        carrier: {
          scac: 'TestScac',
          name: 'TestCarrierName'
  
        },
        carrierMode: {
          mode: 'CarrierMode',
          reportModeDescription: 'ReportModeDescription',
          reportKeyMode: 'ReportKeyMode'
        },
        deliveryDate: customDeliveryDate,
        freightPaymentTerms: FreightPaymentTerms.THIRD_PARTY,
        invoiceDate: new Date(),
        pickUpDate: new Date(),
        tripTenderTime: undefined,
        proTrackingNumber: 'TestProTrackingNumber',
        serviceLevel: {
          level: 'TL1',
          name: 'TestLevel'
        },
        tripId: 'TestTripId',
        freightOrders: [],
        vendorNumber: '1234321'
      };

      component.derivePickupDate(tripInformation);

      expect(component.isPickupDateTimeTendered).toBeFalsy();
    });

    it('deliverDate  is null', () => {

      var customDeliveryDate = new Date(2020, 10, 30);
      const tripInformation: TripInformation = {
        bolNumber: 'TestBolNumber',
        carrier: {
          scac: 'TestScac',
          name: 'TestCarrierName'
  
        },
        carrierMode: {
          mode: 'CarrierMode',
          reportModeDescription: 'ReportModeDescription',
          reportKeyMode: 'ReportKeyMode'
        },
        deliveryDate: undefined,
        freightPaymentTerms: FreightPaymentTerms.THIRD_PARTY,
        invoiceDate: new Date(),
        pickUpDate: new Date(),
        tripTenderTime: customDeliveryDate,
        proTrackingNumber: 'TestProTrackingNumber',
        serviceLevel: {
          level: 'TL1',
          name: 'TestLevel'
        },
        tripId: 'TestTripId',
        freightOrders: [],
        vendorNumber: '1234321'
      };

      component.derivePickupDate(tripInformation);

      expect(component.isPickupDateTimeTendered).toBeFalsy();
    });


    it('deliverDate  is null', () => {
      expect(component.derivePickupDate(undefined)).toBeUndefined();
      expect(component.isPickupDateTimeTendered).toBeFalsy();
    });
  });

  describe('when edit mode is updated', () => {
    let isEditMode$: Subject<boolean>;
    beforeEach(() => {
      isEditMode$ = new Subject();
      component.updateIsEditMode$ = isEditMode$.asObservable();
    });

    it('(edit mode = true) should enable editable forms', done => {
      fixture.detectChanges();
      isEditMode$.subscribe(() => {
        expect(component.tripIdControl.enabled).toBeFalse();
        expect(component.invoiceDateControl.enabled).toBeFalse();
        expect(component.pickUpDateControl.enabled).toBeTrue();
        expect(component.deliveryDateControl.enabled).toBeFalse();
        expect(component.proTrackingNumberControl.enabled).toBeFalse();
        expect(component.bolNumberControl.enabled).toBeFalse();
        expect(component.freightPaymentTermsControl.enabled).toBeFalse();
        expect(component.carrierControl.enabled).toBeTrue();
        expect(component.carrierModeControl.enabled).toBeTrue();
        expect(component.serviceLevelControl.enabled).toBeTrue();
        done();
      });
      isEditMode$.next(true);
    });
    it('(edit mode = false) should disable editable forms', done => {
      fixture.detectChanges();
      isEditMode$.subscribe(() => {
        expect(component.tripIdControl.disabled).toBeTrue();
        expect(component.invoiceDateControl.disabled).toBeTrue();
        expect(component.pickUpDateControl.disabled).toBeTrue();
        expect(component.deliveryDateControl.disabled).toBeTrue();
        expect(component.proTrackingNumberControl.disabled).toBeTrue();
        expect(component.bolNumberControl.disabled).toBeTrue();
        expect(component.freightPaymentTermsControl.disabled).toBeTrue();
        expect(component.carrierControl.disabled).toBeTrue();
        expect(component.carrierModeControl.disabled).toBeTrue();
        expect(component.serviceLevelControl.disabled).toBeTrue();
        done();
      });
      isEditMode$.next(false);
    });
  });

  it('should load trip information', () => {
    const tripInformation: TripInformation = {
      bolNumber: 'TestBolNumber',
      carrier: {
        scac: 'TestScac',
        name: 'TestCarrierName'

      },
      carrierMode: {
        mode: 'CarrierMode',
        reportModeDescription: 'ReportModeDescription',
        reportKeyMode: 'ReportKeyMode'
      },
      deliveryDate: new Date(),
      createdDate: new Date(),
      freightPaymentTerms: FreightPaymentTerms.THIRD_PARTY,
      invoiceDate: new Date(),
      pickUpDate: new Date(),
      proTrackingNumber: 'TestProTrackingNumber',
      serviceLevel: {
        level: 'TL1',
        name: 'TestLevel'
      },
      tripId: 'TestTripId',
      freightOrders: [],
      vendorNumber: '1234321'
    };
    const tripInformation$ = new Subject<TripInformation>();
    component.loadTripInformation$ = tripInformation$.asObservable();
    tripInformation$.next(tripInformation);
    component.filteredCarrierModeOptionsPopulatedSubject.next(1);
    fixture.detectChanges();
    expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
    expect(component.invoiceDateControl.value).toEqual(tripInformation.invoiceDate);
    expect(component.pickUpDateControl.value).toEqual(tripInformation.pickUpDate);
    expect(component.deliveryDateControl.value).toEqual(tripInformation.deliveryDate);
    expect(component.proTrackingNumberControl.value).toEqual(tripInformation.proTrackingNumber);
    expect(component.bolNumberControl.value).toEqual(tripInformation.bolNumber);
    expect(component.freightPaymentTermsControl.value).toEqual(tripInformation.freightPaymentTerms);
    expect(component.carrierControl.value).toEqual(tripInformation.carrier);
    expect(component.carrierModeControl.value).toEqual(tripInformation.carrierMode);
    expect(component.serviceLevelControl.value).toEqual(tripInformation.serviceLevel);
    expect(component.vendorNumberControl.value).toEqual(tripInformation.vendorNumber);
  });

  it('should load trip information and use First FO Delivery date when First FO Delivery date is given', () => {
    const firstFODeliveryDateTime = "2001-06-07T20:16:11Z";
    const freightOrder: FreightOrder = {
      deliverydatetime: firstFODeliveryDateTime,
      accountGroup: '',
      billOfLadingNumber:'',
      carrierModeCode: '',
      createDateTime: '',
      customerPurchaseOrders: null as any,
      customerSalesOrders: null as any,
      sapDeliveryInstructions: null as any,
      deliveryInstructions: null as any,
      deliveryQty: null as any,
      sapDeliveryType: '',
      destination: null as any,
      erpDeliveryNumber: '',
      freightOrderId: '',
      freightOrderStatus: '',
      sapFreightPaymentTerms: '',
      freightPaymentTerms: '',
      incoTerms1: '',
      incoTerms2: '',
      lineItems: null as any,
      volumeGross: null as any,
      volumeNet: null as any,
      weightGross: null as any,
      weightNet: null as any,
      caseCount: 0,
      meansOfTransportId: '',
      origin: null as any,
      originalDeliveryReference: '',
      proofOfDeliveryDate: '',
      routeSchedule: '',
      routePlan: null as any,
      scac: '',
      shipDate: '',
      shippingConditions: '',
      shippingPoint: '',
      shippingPointTimeZone: '',
      shippingUnitPlanned: null as any,
      shippingUnitActual: null as any,
      shipToPartyNumber: '',
      shipVia: '',
      shipViaAir: '',
      soCreateDateTime: '',
      soldToNumber: '',
      storageCodes: '',
      stopId: '',
      threePLSalesOrder: '',
      tmsLoadId: '',
      trackingNumbers: '',
      palletCount: 0
    }
    const tripInformation: TripInformation = {
      bolNumber: 'TestBolNumber',
      carrier: {
        scac: 'TestScac',
        name: 'TestCarrierName'

      },
      carrierMode: {
        mode: 'CarrierMode',
        reportModeDescription: 'ReportModeDescription',
        reportKeyMode: 'ReportKeyMode'
      },
      deliveryDate: new Date(),
      freightPaymentTerms: FreightPaymentTerms.THIRD_PARTY,
      invoiceDate: new Date(),
      pickUpDate: new Date(),
      proTrackingNumber: 'TestProTrackingNumber',
      serviceLevel: {
        level: 'TL1',
        name: 'TestLevel'
      },
      tripId: 'TestTripId',
      freightOrders: [freightOrder],
      vendorNumber: '1234321'
    };
    const tripInformation$ = new Subject<TripInformation>();
    component.loadTripInformation$ = tripInformation$.asObservable();
    tripInformation$.next(tripInformation);
    component.filteredCarrierModeOptionsPopulatedSubject.next(1);
    fixture.detectChanges();
    expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
    expect(component.invoiceDateControl.value).toEqual(tripInformation.invoiceDate);
    expect(component.pickUpDateControl.value).toEqual(tripInformation.pickUpDate);
    expect(component.deliveryDateControl.value).toEqual(new Date(tripInformation.freightOrders[0].deliverydatetime));
    expect(component.proTrackingNumberControl.value).toEqual(tripInformation.proTrackingNumber);
    expect(component.bolNumberControl.value).toEqual(tripInformation.bolNumber);
    expect(component.freightPaymentTermsControl.value).toEqual(tripInformation.freightPaymentTerms);
    expect(component.carrierControl.value).toEqual(tripInformation.carrier);
    expect(component.carrierModeControl.value).toEqual(tripInformation.carrierMode);
    expect(component.serviceLevelControl.value).toEqual(tripInformation.serviceLevel);
    expect(component.vendorNumberControl.value).toEqual(tripInformation.vendorNumber);
  });

  it('should load trip information and use overriddenDeliveryDateTime when overriddenDeliveryDateTime given', () => {
    const overriddenDeliveryDateTime = new Date(new Date().setFullYear(1971, 2, 11));
    const tripInformation: TripInformation = {
      bolNumber: 'TestBolNumber',
      carrier: {
        scac: 'TestScac',
        name: 'TestCarrierName'

      },
      carrierMode: {
        mode: 'CarrierMode',
        reportModeDescription: 'ReportModeDescription',
        reportKeyMode: 'ReportKeyMode'
      },
      deliveryDate: new Date(),
      freightPaymentTerms: FreightPaymentTerms.THIRD_PARTY,
      invoiceDate: new Date(),
      pickUpDate: new Date(),
      proTrackingNumber: 'TestProTrackingNumber',
      serviceLevel: {
        level: 'TL1',
        name: 'TestLevel'
      },
      tripId: 'TestTripId',
      freightOrders: [],
      overriddenDeliveryDateTime,
      vendorNumber: '1234321'
    };
    const tripInformation$ = new Subject<TripInformation>();
    component.loadTripInformation$ = tripInformation$.asObservable();
    tripInformation$.next(tripInformation);
    component.filteredCarrierModeOptionsPopulatedSubject.next(1);
    fixture.detectChanges();
    expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
    expect(component.invoiceDateControl.value).toEqual(tripInformation.invoiceDate);
    expect(component.pickUpDateControl.value).toEqual(tripInformation.pickUpDate);
    expect(component.deliveryDateControl.value).toEqual(tripInformation.overriddenDeliveryDateTime);
    expect(component.proTrackingNumberControl.value).toEqual(tripInformation.proTrackingNumber);
    expect(component.bolNumberControl.value).toEqual(tripInformation.bolNumber);
    expect(component.freightPaymentTermsControl.value).toEqual(tripInformation.freightPaymentTerms);
    expect(component.carrierControl.value).toEqual(tripInformation.carrier);
    expect(component.carrierModeControl.value).toEqual(tripInformation.carrierMode);
    expect(component.serviceLevelControl.value).toEqual(tripInformation.serviceLevel);
    expect(component.vendorNumberControl.value).toEqual(tripInformation.vendorNumber);
  });

  it('should load trip information and use assumedDeliveryDateTime when assumedDeliveryDateTime given', () => {
    const assumedDeliveryDateTime = new Date(new Date().setFullYear(2011, 8, 6));
    const tripInformation: TripInformation = {
      bolNumber: 'TestBolNumber',
      carrier: {
        scac: 'TestScac',
        name: 'TestCarrierName'

      },
      carrierMode: {
        mode: 'CarrierMode',
        reportModeDescription: 'ReportModeDescription',
        reportKeyMode: 'ReportKeyMode'
      },
      deliveryDate: new Date(),
      freightPaymentTerms: FreightPaymentTerms.THIRD_PARTY,
      invoiceDate: new Date(),
      pickUpDate: new Date(),
      proTrackingNumber: 'TestProTrackingNumber',
      serviceLevel: {
        level: 'TL1',
        name: 'TestLevel'
      },
      tripId: 'TestTripId',
      freightOrders: [],
      assumedDeliveryDateTime,
      vendorNumber: '1234321'
    };
    const tripInformation$ = new Subject<TripInformation>();
    component.loadTripInformation$ = tripInformation$.asObservable();
    tripInformation$.next(tripInformation);
    component.filteredCarrierModeOptionsPopulatedSubject.next(1);
    fixture.detectChanges();
    expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
    expect(component.invoiceDateControl.value).toEqual(tripInformation.invoiceDate);
    expect(component.pickUpDateControl.value).toEqual(tripInformation.pickUpDate);
    expect(component.deliveryDateControl.value).toEqual(tripInformation.assumedDeliveryDateTime);
    expect(component.proTrackingNumberControl.value).toEqual(tripInformation.proTrackingNumber);
    expect(component.bolNumberControl.value).toEqual(tripInformation.bolNumber);
    expect(component.freightPaymentTermsControl.value).toEqual(tripInformation.freightPaymentTerms);
    expect(component.carrierControl.value).toEqual(tripInformation.carrier);
    expect(component.carrierModeControl.value).toEqual(tripInformation.carrierMode);
    expect(component.serviceLevelControl.value).toEqual(tripInformation.serviceLevel);
    expect(component.vendorNumberControl.value).toEqual(tripInformation.vendorNumber);
  });

  it('should load trip information and use overriddenDeliveryDateTime ' +
    'when both overriddenDeliveryDateTime and assumedDeliveryDateTime given', () => {
    const overriddenDeliveryDateTime = new Date(new Date().setFullYear(1971, 2, 11));
    const assumedDeliveryDateTime = new Date(new Date().setFullYear(2011, 8, 6));
    const tripInformation: TripInformation = {
      bolNumber: 'TestBolNumber',
      carrier: {
        scac: 'TestScac',
        name: 'TestCarrierName'

      },
      carrierMode: {
        mode: 'CarrierMode',
        reportModeDescription: 'ReportModeDescription',
        reportKeyMode: 'ReportKeyMode'
      },
      deliveryDate: new Date(),
      freightPaymentTerms: FreightPaymentTerms.THIRD_PARTY,
      invoiceDate: new Date(),
      pickUpDate: new Date(),
      proTrackingNumber: 'TestProTrackingNumber',
      serviceLevel: {
        level: 'TL1',
        name: 'TestLevel'
      },
      tripId: 'TestTripId',
      freightOrders: [],
      overriddenDeliveryDateTime,
      assumedDeliveryDateTime,
      vendorNumber: '1234321'
    };
    const tripInformation$ = new Subject<TripInformation>();
    component.loadTripInformation$ = tripInformation$.asObservable();
    tripInformation$.next(tripInformation);
    component.filteredCarrierModeOptionsPopulatedSubject.next(1);
    fixture.detectChanges();
    expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
    expect(component.invoiceDateControl.value).toEqual(tripInformation.invoiceDate);
    expect(component.pickUpDateControl.value).toEqual(tripInformation.pickUpDate);
    expect(component.deliveryDateControl.value).toEqual(tripInformation.overriddenDeliveryDateTime);
    expect(component.proTrackingNumberControl.value).toEqual(tripInformation.proTrackingNumber);
    expect(component.bolNumberControl.value).toEqual(tripInformation.bolNumber);
    expect(component.freightPaymentTermsControl.value).toEqual(tripInformation.freightPaymentTerms);
    expect(component.carrierControl.value).toEqual(tripInformation.carrier);
    expect(component.carrierModeControl.value).toEqual(tripInformation.carrierMode);
    expect(component.serviceLevelControl.value).toEqual(tripInformation.serviceLevel);
    expect(component.vendorNumberControl.value).toEqual(tripInformation.vendorNumber);
  });

  describe('should toggle freight orders section', () => {
    it('toggles freight order section', () => {
      fixture.detectChanges();
      component.showFreightOrderSection = false;
      component.toggleFreightOrderDetailsSection();
      expect(component.showFreightOrderSection).toBe(true);
    });

  });

  describe('should compare with carrier scac', () => {
    it('should return true', () => {
      fixture.detectChanges();
      expect(component.compareCarrierWith({value: {scac: 'TL'}}, {scac: 'TL'})).toBeTrue();
    });

    it('should return false', () => {
      fixture.detectChanges();
      expect(component.compareCarrierWith({value: {scac: 'TLT'}}, {scac: 'TL'})).toBeFalse();
    });

  });

  describe('should compare with carrier mode scac', () => {
    it('should return true', () => {
      fixture.detectChanges();
      expect(component.compareCarrierModeWith(
        {value: {reportKeyMode: 'TL_IM', reportModeDescription: 'TRUCKLOAD'}},
        {reportKeyMode: 'TL_IM', reportModeDescription: 'TRUCKLOAD'}
      )).toBeTrue();
    });

    it('should return false', () => {
      fixture.detectChanges();
      expect(component.compareCarrierModeWith(
        {value: {reportKeyMode: 'TL_IM', reportModeDescription: 'TRUCKLOAD'}},
        {reportKeyMode: 'TL_IM', reportModeDescription: 'BROKER'}
      )).toBeFalse();
    });

    it('should return false', () => {
      fixture.detectChanges();
      expect(component.compareCarrierModeWith({value: {reportKeyMode: 'TLB'}}, {reportKeyMode: 'TL'})).toBeFalse();
    });

  });

  describe('should compare with service level', () => {
    it('should return true', () => {
      fixture.detectChanges();
      expect(component.compareServiceLevelWith({value: {level: 't1'}}, {level: 't1'})).toBeTrue();
    });

    it('should return false', () => {
      fixture.detectChanges();
      expect(component.compareServiceLevelWith({value: {level: 't1'}}, {level: 't2'})).toBeFalse();
    });

  });

  describe('should refresh carrier data', () => {
    it('should call filter methods', () => {
      fixture.detectChanges();
      spyOn(component, 'populateVendorNumberByScac');
      spyOn(component, 'filterServiceLevels').and.callThrough();
      spyOn(component, 'filterCarrierModes').and.callThrough();
      component.carrierControl.setValue({scac: 'TestScac'});
      component.carrierSCACs = [
        {
          scac: 'TestScac',
          mode: 'LTL',
          serviceLevel: 't1'
        }
      ];

      component.carrierModeOptions = [
        {
          label: 'TLTL (Test Mode Description)',
          value: {mode: 'LTL', reportKeyMode: 'LTL', reportModeDescription: 'LTL.'}
        },
        {
          label: 'TL (Test TL Mode Description)',
          value: {mode: 'TL', reportKeyMode: 'TL', reportModeDescription: 'TL.'}
        }
      ];

      component.serviceLevelOptions = [
        {
          label: 't1',
          value: {level: 't1', name: 'T1'}
        },
        {
          label: 't2',
          value: {level: 't2', name: 'T2'}
        }
      ];
      component.refreshCarrierData();
      expect(component.filterCarrierModes).toHaveBeenCalled();
      expect(component.filterServiceLevels).toHaveBeenCalled();
    });
  });

  describe('#validateIsOption', () => {
    const options = [
      {label: 'A', value: {id: 'A'}},
      {label: 'B', value: {id: 'B'}}
    ];

    function comparator(a: any, b: any): boolean {
      return a?.id === b?.id;
    }

    it('should return null when match is found', () => {
      const control = new FormControl({id: 'A'});
      const result = component.validateIsOption(options, comparator)(control);
      expect(result).toBeNull();
    });
    it('should return error when match is NOT found', () => {
      const control = new FormControl({id: 'C'});
      const result = component.validateIsOption(options, comparator)(control);
      expect(result).toEqual({invalidSelectOption: true});
    });
    it('should return null for carriers when comparator is provided', () => {
      const control = new FormControl({scac: 'SOME'});
      const scacOptions: Array<SelectOption<unknown>> = [{value: {scac: 'SOME', name: 'Some Carrier'}}] as any;
      const result = component.validateIsOption(scacOptions, component.compareCarrierWith)(control);
      expect(result).toBeNull();
    });
  });

  describe('#compareCarrierWith', () => {
    it('should mark empty objects as equal', () => {
      const a = {};
      const b = {};
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark null objects as equal', () => {
      const a = null;
      const b = null;
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark equal SelectOptions objects as equal', () => {
      const a = {label: 'Some Carrier', value: {scac: 'SOME'}};
      const b = {label: 'Some Carrier', value: {scac: 'SOME'}};
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark equal Carrier objects as equal', () => {
      const a = {scac: 'SOME'};
      const b = {scac: 'SOME'};
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark Carriers with same scac as equal', () => {
      const a = {scac: 'SOME'};
      const b = {scac: 'SOME', name: 'this field should not effect equality'};
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark equal SelectOption/Carrier objects as equal', () => {
      const a = {label: 'Some Carrier', value: {scac: 'SOME'}};
      const b = {scac: 'SOME'};
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark equal Carrier/SelectOption objects as equal', () => {
      const a = {scac: 'SOME'};
      const b = {label: 'Some Carrier', value: {scac: 'SOME'}};
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark unequal SelectOptions objects as unequal', () => {
      const a = {label: 'Some Carrier', value: {scac: 'SOME'}};
      const b = {label: 'Some Other Carrier', value: {scac: 'OTHER'}};
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeFalse();
    });
    it('should mark unequal Carrier objects as unequal', () => {
      const a = {scac: 'SOME'};
      const b = {scac: 'OTHER'};
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeFalse();
    });
    it('should mark unequal SelectOption/Carrier objects as unequal', () => {
      const a = {label: 'Some Carrier', value: {scac: 'SOME'}};
      const b = {scac: 'OTHER'};
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeFalse();
    });
    it('should mark unequal Carrier/SelectOption objects as unequal', () => {
      const a = {scac: 'SOME'};
      const b = {label: 'Some Other Carrier', value: {scac: 'OTHER'}};
      const result = component.compareCarrierWith(a, b);
      expect(result).toBeFalse();
    });
  });

  describe('#compareCarrierModeWith', () => {
    it('should mark empty objects as equal', () => {
      const a = {};
      const b = {};
      const result = component.compareCarrierModeWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark null objects as equal', () => {
      const a = null;
      const b = null;
      const result = component.compareCarrierModeWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark equal SelectOptions objects as equal', () => {
      const a = {label: 'Some Mode', value: {reportKeyMode: 'SOME', reportModeDescription: 'SOME DESC'}};
      const b = {label: 'Some Mode', value: {reportKeyMode: 'SOME', reportModeDescription: 'SOME DESC'}};
      const result = component.compareCarrierModeWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark equal Mode objects as equal', () => {
      const a = {reportKeyMode: 'SOME', reportModeDescription: 'SOME DESC'};
      const b = {reportKeyMode: 'SOME', reportModeDescription: 'SOME DESC'};
      const result = component.compareCarrierModeWith(a, b);
      expect(result).toBeTrue();
    });
  });

});
