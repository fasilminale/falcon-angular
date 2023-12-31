import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TripInformationComponent} from './trip-information.component';
import {FalconTestingModule} from '../../../testing/falcon-testing.module';
import {MasterDataService} from '../../../services/master-data-service';
import {of, Subject} from 'rxjs';
import {Carrier, TenderMethod} from '../../../models/master-data-models/carrier-model';
import {YesNo} from '../../../models/master-data-models/yes-no-model';
import {CarrierModeCode, TripType} from '../../../models/master-data-models/carrier-mode-code-model';
import {ServiceLevel} from '../../../models/master-data-models/service-level-model';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {FreightPaymentTerms, TripInformation, WeightAdjustment} from '../../../models/invoice/trip-information-model';
import {CarrierSCAC} from '../../../models/master-data-models/carrier-scac';
import {CarrierDetailModel} from '../../../models/master-data-models/carrier-detail-model';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {FreightOrder} from 'src/app/models/freight-order/freight-order-model';
import {
  Location,
  BillToLocation,
  ShippingPointLocationSelectOption,
  ShippingPointWarehouseLocation
} from 'src/app/models/location/location-model';
import {InvoiceService} from 'src/app/services/invoice-service';
import { DateTime } from 'luxon';

describe('TripInformationComponent', () => {

  let component: TripInformationComponent;
  let fixture: ComponentFixture<TripInformationComponent>;
  let masterDataService: MasterDataService;
  let invoiceService: InvoiceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [TripInformationComponent]
    }).compileComponents();

    // Mock MasterDataService
    masterDataService = TestBed.inject(MasterDataService);

    // Mock InvoiceService
    invoiceService = TestBed.inject(InvoiceService);


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
      spyOn(invoiceService, 'getMasterDataShippingPointWarehouses').and.returnValue(of([]));
      spyOn(invoiceService, 'getMasterDataShippingPoints').and.returnValue(of([]));
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
    it('should have zero shipping point warehouse options', () => {
      fixture.detectChanges();
      expect(component.masterDataShippingPointWarehouses).toEqual([]);
    });
    it('should have zero shipping point options', () => {
      fixture.detectChanges();
      expect(component.masterDataShippingPoints).toEqual([]);
    });
    it('should have controls in formGroup', () => {
      fixture.detectChanges();
      expect(Object.keys(component.formGroup.controls).length).toBe(20);
    });
  });

  it('#clickEditButton should toggle isEditMode$', () => {
    const initialValue = component.isTripEditMode$.value;
    component.clickEditButton();
    expect(component.isTripEditMode$.value).toEqual(!initialValue);
  });

  it('#clickCancelButton should toggle isEditMode$', () => {
    const LOCATION: Location = {
      name: 'n1',
      address: 'a1',
      city: 'c',
      state: 's',
      country: 'c',
      zipCode: 'z23',
    };
    const SHIPPING_POINT_LOCATION: ShippingPointLocationSelectOption = {
      label: 'D26',
      value: 'D26',
      businessUnit: 'GPSC',
      location: LOCATION
    };
    component.masterDataShippingPoints = [SHIPPING_POINT_LOCATION];
    const tripInformation: TripInformation = {
      bolNumber: 'TestBolNumber',
      carrier: {
        scac: 'TestScac',
        name: 'TestCarrierName'
      },
      businessUnit: 'GPSC',
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
      vendorNumber: '1234321'
    };
    const tripInformation$ = new Subject<TripInformation>();
    component.loadTripInformation$ = tripInformation$.asObservable();
    tripInformation$.next(tripInformation);
    component.filteredCarrierModeOptionsPopulatedSubject.next(1);
    fixture.detectChanges();
    component.clickEditButton();
    const initialValue = component.isTripEditMode$.value;
    component.clickCancelButton();
    expect(component.isTripEditMode$.value).toEqual(!initialValue);
  });

  it('#clickUpdateButton should update localPeristentTripInformation', () => {
    const LOCATION: Location = {
      name: 'n1',
      address: 'a1',
      city: 'c',
      state: 's',
      country: 'c',
      zipCode: 'z23',
    };
    const SHIPPING_POINT_LOCATION: ShippingPointLocationSelectOption = {
      label: 'D26',
      value: 'D26',
      businessUnit: 'GPSC',
      location: LOCATION
    };
    component.masterDataShippingPoints = [SHIPPING_POINT_LOCATION];
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
      vendorNumber: '1234321'
    };
    const tripInformation$ = new Subject<TripInformation>();
    component.loadTripInformation$ = tripInformation$.asObservable();
    tripInformation$.next(tripInformation);
    component.filteredCarrierModeOptionsPopulatedSubject.next(1);
    fixture.detectChanges();
    component.clickEditButton();
    component.pickUpDateControl.setValue(new Date(2001, 1, 1));
    component.clickUpdateButton();
    expect(component.localPeristentTripInformation.pickUpDate).toEqual(new Date(2001, 1, 1));
  });

  it('updateBillToEvent should success', () => {
    const BILL_TO_LOCATION: BillToLocation = {
      name: 'n1',
      address: 'a1',
      city: 'c',
      state: 's',
      country: 'c',
      zipCode: 'z23',
      name2: 'name'
    };
    const SHIPPING_POINT_WAREHOUSE_LOCATION: ShippingPointWarehouseLocation = {
      warehouse: 'WHS',
      customerCategory: 'CAH',
      shippingPointCode: 'D71',
      billto: BILL_TO_LOCATION
    };
    component.masterDataShippingPointWarehouses = [SHIPPING_POINT_WAREHOUSE_LOCATION];
    component.loadBillToAddress$.subscribe((billTo) => {
      expect(billTo.name).toBe(BILL_TO_LOCATION.name);
      expect(billTo.address).toBe(BILL_TO_LOCATION.address);
      expect(billTo.city).toBe(BILL_TO_LOCATION.city);
      expect(billTo.state).toBe(BILL_TO_LOCATION.state);
      expect(billTo.country).toBe(BILL_TO_LOCATION.country);
      expect(billTo.zipCode).toBe(BILL_TO_LOCATION.zipCode);
    });
    component.updateBillToEvent('D71');
    fixture.detectChanges();
  });

  it('updateBillToEvent should not success', () => {
    const BILL_TO_LOCATION: BillToLocation = {
      name: 'n1',
      address: 'a1',
      city: 'c',
      state: 's',
      country: 'c',
      zipCode: 'z23',
      name2: 'name'
    };
    const SHIPPING_POINT_WAREHOUSE_LOCATION: ShippingPointWarehouseLocation = {
      warehouse: 'WHS',
      customerCategory: 'CAH',
      shippingPointCode: 'D71',
      billto: BILL_TO_LOCATION
    };
    spyOn(component.loadBillToAddress$, 'next').and.stub();
    component.masterDataShippingPointWarehouses = [SHIPPING_POINT_WAREHOUSE_LOCATION];
    expect(component.loadBillToAddress$.next).not.toHaveBeenCalled();
    component.updateBillToEvent('D72');
    fixture.detectChanges();
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

    const BILL_TO_LOCATION: BillToLocation = {
      name: 'n1',
      code: '',
      address: 'a1',
      address2: '',
      city: 'c',
      state: 's',
      country: 'c',
      zipCode: 'z23',
      name2: 'name',
      idCode: '',
    };
    const SHIPPING_POINT_WAREHOUSE_LOCATION: ShippingPointWarehouseLocation = {
      warehouse: 'WHS',
      customerCategory: 'CAH',
      shippingPointCode: 'D71',
      billto: BILL_TO_LOCATION
    };

    const LOCATION: Location = {
      name: 'n1',
      address: 'a1',
      city: 'c',
      state: 's',
      country: 'c',
      zipCode: 'z23',
      code: '',
      address2: '',
    };
    const SHIPPING_POINT_LOCATION: ShippingPointLocationSelectOption = {
      label: 'D26',
      value: 'D26',
      businessUnit: 'GPSC',
      location: LOCATION,
    };

    // TODO - Below invoice service spyOn return value not matching with mocked objects
    // SHIPPING_POINT_WAREHOUSE_LOCATION - SHIPPING_POINT_LOCATION
    beforeEach(() => {
      spyOn(masterDataService, 'getCarriers').and.returnValue(of([CARRIER]));
      spyOn(masterDataService, 'getCarrierDetails').and.returnValue(of([CARRIER_DETAIL]));
      spyOn(masterDataService, 'getCarrierSCACs').and.returnValue(of([CARRIER_SCAC]));
      spyOn(masterDataService, 'getCarrierModeCodes').and.returnValue(of([CARRIER_MODE]));
      spyOn(masterDataService, 'getServiceLevels').and.returnValue(of([SERVICE_LEVEL]));
      spyOn(invoiceService, 'getMasterDataShippingPointWarehouses').and.returnValue(of([]));
      spyOn(invoiceService, 'getMasterDataShippingPoints').and.returnValue(of([]));
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
    it('should have shipping point warehouse option', () => {
      fixture.detectChanges();
      expect(component.masterDataShippingPointWarehouses).toEqual([]);
    });
    it('should have shipping point option', () => {
      fixture.detectChanges();
      expect(component.masterDataShippingPoints).toEqual([]);
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
    let parentFormGroup: UntypedFormGroup;
    beforeEach(() => {
      parentFormGroup = new UntypedFormGroup({});
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
      const customDeliveryDate = new Date(2020, 10, 30);
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
      const customDeliveryDate = new Date(2020, 10, 30);
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
      const customDeliveryDate = new Date(2020, 10, 30);
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

    it('pickup date and tender date are the same', () => {
      const customDeliveryDate = new Date(2020, 10, 30);
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
        pickUpDate: customDeliveryDate,
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
      expect(component.pickupDateMatchesTenderDate).toBeTruthy();
    });

    it('tripTenderTime is null', () => {
      const customDeliveryDate = new Date(2020, 10, 30);
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
      const customDeliveryDate = new Date(2020, 10, 30);
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

    it('both pickup date and trip tender date is null', () => {
      const customDeliveryDate = new Date(2020, 10, 30);
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
        pickUpDate: null as any,
        tripTenderTime: null as any,
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

    it('(edit mode = true) should show edit button next to Trip Information title', done => {
      fixture.detectChanges();
      isEditMode$.subscribe(() => {
        expect(component.enableTripEditButton).toBeTrue();
        done();
      });
      isEditMode$.next(true);
    });
    it('(edit mode = false) should hide edit button next to Trip Information title', done => {
      fixture.detectChanges();
      isEditMode$.subscribe(() => {
        expect(component.enableTripEditButton).toBeFalse();
        done();
      });
      isEditMode$.next(false);
    });
  });

  describe('trip information', () => {
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

    it('should trigger load trip information', done => {
      spyOn(component, 'loadTripInformationData').and.returnValue(Promise.resolve());
      const tripInformation$ = new Subject<TripInformation>();
      component.loadTripInformation$ = tripInformation$.asObservable();
      tripInformation$.subscribe(() => {
        expect(component.loadTripInformationData).toHaveBeenCalled();
        done();
      });
      tripInformation$.next(tripInformation);
    });

    it('should load trip information data', async () => {
      component.filteredCarrierModeOptionsPopulatedSubject.next(1);
      component.filteredCarrierModeOptionsPopulatedSubject.complete();
      await component.loadTripInformationData(tripInformation);
      expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
      expect(DateTime.fromISO(component.invoiceDateControl.value)).toEqual(DateTime.fromJSDate(tripInformation.invoiceDate));
      if (tripInformation.pickUpDate) {
        let expPickUpDate = DateTime.fromJSDate(tripInformation.pickUpDate);
        expect(DateTime.fromISO(component.pickUpDateControl.value)).toEqual(expPickUpDate);
      }
      if (tripInformation.deliveryDate) {
        let expDeliveryDate = DateTime.fromJSDate(tripInformation.deliveryDate);
        expect(DateTime.fromISO(component.deliveryDateControl.value)).toEqual(expDeliveryDate);
      }
      expect(component.proTrackingNumberControl.value).toEqual(tripInformation.proTrackingNumber);
      expect(component.bolNumberControl.value).toEqual(tripInformation.bolNumber);
      expect(component.freightPaymentTermsControl.value).toEqual(tripInformation.freightPaymentTerms);
      expect(component.carrierControl.value).toEqual(tripInformation.carrier);
      expect(component.carrierModeControl.value).toEqual(tripInformation.carrierMode);
      expect(component.serviceLevelControl.value).toEqual(tripInformation.serviceLevel);
      expect(component.vendorNumberControl.value).toEqual(tripInformation.vendorNumber);
    });

    it('should load trip information data with duplicate BOL Number case', async () => {
      component.filteredCarrierModeOptionsPopulatedSubject.next(1);
      component.filteredCarrierModeOptionsPopulatedSubject.complete();
      tripInformation.isBolNumberDuplicate = true;
      tripInformation.duplicateBOLErrorMessage = 'This BOL number exists on another invoice(s)';
      component.hasUpdateAndContinueClicked = true;
      await component.loadTripInformationData(tripInformation);
      expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
      expect(DateTime.fromISO(component.invoiceDateControl.value)).toEqual(DateTime.fromJSDate(tripInformation.invoiceDate));
      if (tripInformation.pickUpDate) {
        let expPickUpDate = DateTime.fromJSDate(tripInformation.pickUpDate);
        expect(DateTime.fromISO(component.pickUpDateControl.value)).toEqual(expPickUpDate);
      }
      if (tripInformation.deliveryDate) {
        let expDeliveryDate = DateTime.fromJSDate(tripInformation.deliveryDate);
        expect(DateTime.fromISO(component.deliveryDateControl.value)).toEqual(expDeliveryDate);
      }
      expect(component.proTrackingNumberControl.value).toEqual(tripInformation.proTrackingNumber);
      expect(component.bolNumberControl.value).toEqual(tripInformation.bolNumber);
      expect(component.freightPaymentTermsControl.value).toEqual(tripInformation.freightPaymentTerms);
      expect(component.carrierControl.value).toEqual(tripInformation.carrier);
      expect(component.carrierModeControl.value).toEqual(tripInformation.carrierMode);
      expect(component.serviceLevelControl.value).toEqual(tripInformation.serviceLevel);
      expect(component.vendorNumberControl.value).toEqual(tripInformation.vendorNumber);
      expect(component.hasUpdateAndContinueClicked).toBeFalse();
      expect(component.tripInformation.isBolNumberDuplicate).toBeTrue();
    });
  });

  it('should load trip information and use First FO Delivery date when First FO Delivery date is given', async () => {
    const firstFODeliveryDateTime = '2001-06-07T20:16:11Z';
    const freightOrder: FreightOrder = {
      deliverydatetime: firstFODeliveryDateTime,
      accountGroup: '',
      billOfLadingNumber: '',
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
    };
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
      deliveryDate: new Date(firstFODeliveryDateTime),
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
    component.filteredCarrierModeOptionsPopulatedSubject.next(1);
    component.filteredCarrierModeOptionsPopulatedSubject.complete();
    await component.loadTripInformationData(tripInformation);
    expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
    expect(DateTime.fromISO(component.invoiceDateControl.value)).toEqual(DateTime.fromJSDate(tripInformation.invoiceDate));
    if (tripInformation.pickUpDate) {
      let expPickUpDate = DateTime.fromJSDate(tripInformation.pickUpDate);
      expect(DateTime.fromISO(component.pickUpDateControl.value)).toEqual(expPickUpDate);
    }
    let expDeliveryDate = DateTime.fromJSDate(new Date(tripInformation.freightOrders[0].deliverydatetime));
    expect(DateTime.fromISO(component.deliveryDateControl.value)).toEqual(expDeliveryDate);
    expect(component.proTrackingNumberControl.value).toEqual(tripInformation.proTrackingNumber);
    expect(component.bolNumberControl.value).toEqual(tripInformation.bolNumber);
    expect(component.freightPaymentTermsControl.value).toEqual(tripInformation.freightPaymentTerms);
    expect(component.carrierControl.value).toEqual(tripInformation.carrier);
    expect(component.carrierModeControl.value).toEqual(tripInformation.carrierMode);
    expect(component.serviceLevelControl.value).toEqual(tripInformation.serviceLevel);
    expect(component.vendorNumberControl.value).toEqual(tripInformation.vendorNumber);
  });

  it('should load trip information and use overriddenDeliveryDateTime when overriddenDeliveryDateTime given', async () => {
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
      deliveryDate: overriddenDeliveryDateTime,
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
    component.filteredCarrierModeOptionsPopulatedSubject.next(1);
    component.filteredCarrierModeOptionsPopulatedSubject.complete();
    await component.loadTripInformationData(tripInformation);
    expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
    expect(DateTime.fromISO(component.invoiceDateControl.value)).toEqual(DateTime.fromJSDate(tripInformation.invoiceDate));
    if (tripInformation.pickUpDate) {
      let expPickUpDate = DateTime.fromJSDate(tripInformation.pickUpDate);
      expect(DateTime.fromISO(component.pickUpDateControl.value)).toEqual(expPickUpDate);
    }
    if (tripInformation.overriddenDeliveryDateTime) {
      let expDeliveryDate = DateTime.fromJSDate(tripInformation.overriddenDeliveryDateTime);
      expect(DateTime.fromISO(component.deliveryDateControl.value)).toEqual(expDeliveryDate);
    }
    expect(component.proTrackingNumberControl.value).toEqual(tripInformation.proTrackingNumber);
    expect(component.bolNumberControl.value).toEqual(tripInformation.bolNumber);
    expect(component.freightPaymentTermsControl.value).toEqual(tripInformation.freightPaymentTerms);
    expect(component.carrierControl.value).toEqual(tripInformation.carrier);
    expect(component.carrierModeControl.value).toEqual(tripInformation.carrierMode);
    expect(component.serviceLevelControl.value).toEqual(tripInformation.serviceLevel);
    expect(component.vendorNumberControl.value).toEqual(tripInformation.vendorNumber);
  });

  it('should load trip information and use assumedDeliveryDateTime when assumedDeliveryDateTime given', async () => {
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
      deliveryDate: assumedDeliveryDateTime,
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
    component.filteredCarrierModeOptionsPopulatedSubject.next(1);
    component.filteredCarrierModeOptionsPopulatedSubject.complete();
    await component.loadTripInformationData(tripInformation);
    expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
    expect(DateTime.fromISO(component.invoiceDateControl.value)).toEqual(DateTime.fromJSDate(tripInformation.invoiceDate));
    if (tripInformation.pickUpDate) {
      let expPickUpDate = DateTime.fromJSDate(tripInformation.pickUpDate);
      expect(DateTime.fromISO(component.pickUpDateControl.value)).toEqual(expPickUpDate);
    }
    if (tripInformation.assumedDeliveryDateTime) {
      let expDeliveryDate = DateTime.fromJSDate(tripInformation.assumedDeliveryDateTime);
      expect(DateTime.fromISO(component.deliveryDateControl.value)).toEqual(expDeliveryDate);
    }
    expect(component.proTrackingNumberControl.value).toEqual(tripInformation.proTrackingNumber);
    expect(component.bolNumberControl.value).toEqual(tripInformation.bolNumber);
    expect(component.freightPaymentTermsControl.value).toEqual(tripInformation.freightPaymentTerms);
    expect(component.carrierControl.value).toEqual(tripInformation.carrier);
    expect(component.carrierModeControl.value).toEqual(tripInformation.carrierMode);
    expect(component.serviceLevelControl.value).toEqual(tripInformation.serviceLevel);
    expect(component.vendorNumberControl.value).toEqual(tripInformation.vendorNumber);
  });

  it('should load trip information and use overriddenDeliveryDateTime when both overriddenDeliveryDateTime and assumedDeliveryDateTime given',
    async () => {
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
        deliveryDate: overriddenDeliveryDateTime,
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
      component.filteredCarrierModeOptionsPopulatedSubject.next(1);
      component.filteredCarrierModeOptionsPopulatedSubject.complete();
      await component.loadTripInformationData(tripInformation);
      expect(component.tripIdControl.value).toEqual(tripInformation.tripId);
      expect(DateTime.fromISO(component.invoiceDateControl.value)).toEqual(DateTime.fromJSDate(tripInformation.invoiceDate));
      if (tripInformation.pickUpDate) {
        let expPickUpDate = DateTime.fromJSDate(tripInformation.pickUpDate);
        expect(DateTime.fromISO(component.pickUpDateControl.value)).toEqual(expPickUpDate);
      }
      if (tripInformation.overriddenDeliveryDateTime) {
        let expDeliveryDate = DateTime.fromJSDate(tripInformation.overriddenDeliveryDateTime);
        expect(DateTime.fromISO(component.deliveryDateControl.value)).toEqual(expDeliveryDate);
      }
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
      expect(component.compareServiceLevelWith({level: 't1'}, {level: 't1'})).toBeTrue();
    });

    it('should return false', () => {
      fixture.detectChanges();
      expect(component.compareServiceLevelWith({level: 't1'}, {level: 't2'})).toBeFalse();
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
      const control = new UntypedFormControl({id: 'A'});
      const result = component.validateIsOption(options, comparator)(control);
      expect(result).toBeNull();
    });
    it('should return error when match is NOT found', () => {
      const control = new UntypedFormControl({id: 'C'});
      const result = component.validateIsOption(options, comparator)(control);
      expect(result).toEqual({invalidSelectOption: true});
    });
    it('should return null for carriers when comparator is provided', () => {
      const control = new UntypedFormControl({scac: 'SOME'});
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

  describe('#compareServiceLevelWith', () => {
    it('should mark empty objects as equal', () => {
      const a = {};
      const b = {};
      const result = component.compareServiceLevelWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark null objects as equal', () => {
      const a = null;
      const b = null;
      const result = component.compareServiceLevelWith(a, b);
      expect(result).toBeTrue();
    });
    it('should mark equal SelectOptions objects as equal', () => {
      const a = {label: 'Service Level', value: {level: 'SERVICE'}};
      const b = {label: 'Service Level', value: {level: 'SERVICE'}};
      const result = component.compareServiceLevelWith(a, b);
      expect(result).toBeTrue();
    });
    it('should compare and mark equal options as equal', () => {
      const a = {label: 'Service Level', level: 'SERVICE'};
      const b = 'SERVICE';
      const result = component.compareServiceLevelWith(a, b);
      expect(result).toBeTrue();
    });
  });

  describe('update total values', () => {
    it('update the weight, volume, and pallet values', () => {
      const totals = {
        totalVolume: 2,
        totalPalletCount: 3,
      };
      component.updateFreightOrderTotals(totals);
      expect(component.totalVolume.value).toEqual(2);
      expect(component.totalPalletCount.value).toEqual(3);
    });
  });

  describe('refresh master data', () => {
    it('should emit event to edit component', () => {
      spyOn(component.refreshMasterDataEvent, 'emit').and.stub();
      component.refreshMasterData();
      expect(component.refreshMasterDataEvent.emit).toHaveBeenCalled();
    });
  });

  describe('display weight adjustment modal', () => {
    it('should emit event to display modal', () => {
      spyOn(component.openWeightAdjustmentModalEvent, 'emit').and.stub();
      component.openWeightAdjustmentModal();
      expect(component.openWeightAdjustmentModalEvent.emit).toHaveBeenCalled();
    });
  });

  it('should convert WeightAdjustment to FormGroup', () => {
    const weightAdjustment: WeightAdjustment = {
      amount: 50,
      freightClasses: ['55', '110'],
      customerCategory: 'CAH'
    };
    const result = component.toWeightAdjustmentFormGroup(weightAdjustment);
    expect(result.disabled).toBeTrue();
    expect(result.controls.amount.value).toEqual(50);
    expect(result.controls.freightClasses.value).toEqual('55, 110');
    expect(result.controls.customerCategory.value).toEqual('CAH');
  });

  it('should toggle weight adjustment section', () => {
    component.showWeightAdjustmentSection = false;
    component.toggleWeightAdjustmentDetailsSection();
    expect(component.showWeightAdjustmentSection).toBeTrue();
  });

  it('should require BOL Number', () => {
    component.bolNumberControl.setValue(null);
    const messages = component.bolNumberControlErrorMessages;
    expect(messages).toEqual(['BOL Number is missing']);
  });

  it('should require alphanumeric', () => {
    component.bolNumberControl.setValue('#$%');
    const messages = component.bolNumberControlErrorMessages;
    expect(messages).toEqual(['Contains invalid characters']);
  });

  it('should require less than 35 characters', () => {
    component.bolNumberControl.setValue('123456789012345678901234567890123456');
    const messages = component.bolNumberControlErrorMessages;
    expect(messages).toEqual(['Maximum characters 35']);
  });

  it('should test errors is null', () => {
    component.bolNumberControl = {} as UntypedFormControl;
    const messages = component.bolNumberControlErrorMessages;
    expect(messages).toEqual([]);
  });

});
