import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TripInformationComponent} from './trip-information.component';
import {FalconTestingModule} from '../../../testing/falcon-testing.module';
import {MasterDataService} from '../../../services/master-data-service';
import {of, Subject} from 'rxjs';
import {Carrier, TenderMethod} from '../../../models/master-data-models/carrier-model';
import {YesNo} from '../../../models/master-data-models/yes-no-model';
import {CarrierModeCode, TripType} from '../../../models/master-data-models/carrier-mode-code-model';
import {ServiceLevel} from '../../../models/master-data-models/service-level-model';
import {FormGroup} from '@angular/forms';
import {FreightPaymentTerms, TripInformation} from '../../../models/invoice/trip-information-model';
import {asSpy} from '../../../testing/test-utils.spec';

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
    spyOn(masterDataService, 'getCarriers').and.returnValue(of([]));
    spyOn(masterDataService, 'getCarrierModeCodes').and.returnValue(of([]));
    spyOn(masterDataService, 'getServiceLevels').and.returnValue(of([]));

    // Create Component
    fixture = TestBed.createComponent(TripInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('after component creation', () => {
    it('should have component', () => {
      expect(component).toBeTruthy();
    });
    it('formGroup should be disabled', () => {
      expect(component.formGroup.disabled).toBeTrue();
    });
    it('should have zero carrier options', () => {
      expect(component.carrierOptions).toEqual([]);
    });
    it('should have zero carrier mode options', () => {
      expect(component.carrierModeOptions).toEqual([]);
    });
    it('should have zero service level options', () => {
      expect(component.serviceLevelOptions).toEqual([]);
    });
    it('should have controls in formGroup', () => {
      expect(Object.keys(component.formGroup.controls).length).toBe(13);
    });
  });

  describe('#carrierOptions', () => {
    describe('given a carrier', () => {
      const CARRIER: Carrier = {
        name: 'Test Carrier',
        scac: 'TCS',
        tenderAutoAccept: YesNo.NO,
        tenderMethod: TenderMethod.NONE
      };
      beforeEach(() => {
        asSpy(masterDataService.getCarriers).and.returnValue(of([CARRIER]));
        component.ngOnInit();
      });
      it('should have carrier option', () => {
        expect(component.carrierOptions).toEqual([{
          label: 'TCS (Test Carrier)',
          value: CARRIER
        }]);
      });
    });
  });

  describe('#carrierModeOptions', () => {
    describe('given a carrier mode code', () => {
      const CARRIER_MODE: CarrierModeCode = {
        mode: 'LTL',
        reportKeyMode: 'TLTL',
        reportModeDescription: 'Test Mode Description',
        tripType: TripType.NONE
      };
      beforeEach(() => {
        asSpy(masterDataService.getCarrierModeCodes).and.returnValue(of([CARRIER_MODE]));
        component.ngOnInit();
      });
      it('should have carrier mode option', () => {
        expect(component.carrierModeOptions).toEqual([{
          label: 'TLTL (Test Mode Description)',
          value: CARRIER_MODE
        }]);
      });
    });
  });

  describe('#serviceLevelOptions', () => {
    describe('given a service level', () => {
      const SERVICE_LEVEL: ServiceLevel = {
        level: 't1',
        name: 'Test Service Level'
      };
      beforeEach(() => {
        asSpy(masterDataService.getServiceLevels).and.returnValue(of([SERVICE_LEVEL]));
        component.ngOnInit();
      });
      it('should have carrier mode option', () => {
        expect(component.serviceLevelOptions).toEqual([{
          label: 't1 (Test Service Level)',
          value: SERVICE_LEVEL
        }]);
      });
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
      expect(component.formGroup).toBeTruthy();
      expect(component.formGroup).not.toBe(parentFormGroup);
    });
    describe('given a new form group', () => {
      beforeEach(() => {
        component.formGroup = parentFormGroup;
      });
      it('should accept input from parent', () => {
        expect(component.formGroup).toBe(parentFormGroup);
      });
      it('should inject tripId control', () => {
        expect(component.tripIdControl).toBeTruthy();
      });
      it('should inject invoiceDate control', () => {
        expect(component.invoiceDateControl).toBeTruthy();
      });
      it('should inject pickUpDate control', () => {
        expect(component.pickUpDateControl).toBeTruthy();
      });
      it('should inject deliveryDate control', () => {
        expect(component.deliveryDateControl).toBeTruthy();
      });
      it('should inject proTrackingNumber control', () => {
        expect(component.proTrackingNumberControl).toBeTruthy();
      });
      it('should inject bolNumber control', () => {
        expect(component.bolNumberControl).toBeTruthy();
      });
      it('should inject freightPaymentTerms control', () => {
        expect(component.freightPaymentTermsControl).toBeTruthy();
      });
      it('should inject carrier control', () => {
        expect(component.carrierControl).toBeTruthy();
      });
      it('should inject carrierMode control', () => {
        expect(component.carrierModeControl).toBeTruthy();
      });
      it('should inject serviceLevel control', () => {
        expect(component.serviceLevelControl).toBeTruthy();
      });
    });
  });

  describe('when edit mode is updated', () => {
    let isEditMode$: Subject<boolean>;
    beforeEach(() => {
      isEditMode$ = new Subject();
      component.updateIsEditMode$ = isEditMode$.asObservable();
    });

    it('(edit mode = true) should enable editable forms', done => {
      isEditMode$.subscribe(() => {
        expect(component.tripIdControl.enabled).toBeFalse();
        expect(component.invoiceDateControl.enabled).toBeTrue();
        expect(component.pickUpDateControl.enabled).toBeTrue();
        expect(component.deliveryDateControl.enabled).toBeTrue();
        expect(component.proTrackingNumberControl.enabled).toBeTrue();
        expect(component.bolNumberControl.enabled).toBeTrue();
        expect(component.freightPaymentTermsControl.enabled).toBeTrue();
        expect(component.carrierControl.enabled).toBeTrue();
        expect(component.carrierModeControl.enabled).toBeTrue();
        expect(component.serviceLevelControl.enabled).toBeTrue();
        done();
      });
      isEditMode$.next(true);
    });
    it('(edit mode = false) should disable editable forms', done => {
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

  it('should load trip information', done => {
    const tripInformation: TripInformation = {
      bolNumber: 'TestBolNumber',
      carrier: {
       scac: 'TestScac',
       name: 'TestCarrierName'

      },
      carrierMode: {
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
      freightOrders: []
    };
    const tripInformation$ = new Subject<TripInformation>();
    component.loadTripInformation$ = tripInformation$.asObservable();
    tripInformation$.subscribe(() => {
      expect(component.tripIdControl.value).toBe(tripInformation.tripId);
      expect(component.invoiceDateControl.value).toBe(tripInformation.invoiceDate);
      expect(component.pickUpDateControl.value).toBe(tripInformation.pickUpDate);
      expect(component.deliveryDateControl.value).toBe(tripInformation.deliveryDate);
      expect(component.proTrackingNumberControl.value).toBe(tripInformation.proTrackingNumber);
      expect(component.bolNumberControl.value).toBe(tripInformation.bolNumber);
      expect(component.freightPaymentTermsControl.value).toBe(tripInformation.freightPaymentTerms);
      expect(component.carrierControl.value).toBe(tripInformation.carrier);
      expect(component.carrierModeControl.value).toBe(tripInformation.carrierMode);
      expect(component.serviceLevelControl.value).toBe(tripInformation.serviceLevel);
      done();
    });
    tripInformation$.next(tripInformation);
  });

  describe('should toggle freight orders section', () => {
    it('toggles freight order section', () => {
      component.showFreightOrderSection = false;
      component.toggleFreightOrderDetailsSection();
      expect(component.showFreightOrderSection).toBe(true);
    });

  });

  describe('should compare with carrier scac', () => {
    it('should return true', () => {
      expect(component.compareCarrierWith({value: {scac:'TL'}}, {scac: 'TL'})).toBeTrue();
    });

    it('should return false', () => {
      expect(component.compareCarrierWith({value: {scac: 'TLT'}}, {scac: 'TL'})).toBeFalse();
    });

  });

  fdescribe('should compare with carrier mode scac', () => {
    it('should return true', () => {
      expect(component.compareCarrierModeWith(
        {value: {reportKeyMode: 'TL_IM', reportModeDescription: 'TRUCKLOAD'}},
        {reportKeyMode: 'TL_IM', reportModeDescription: 'TRUCKLOAD'}
      )).toBeTrue();
    });

    it('should return false', () => {
      expect(component.compareCarrierModeWith(
        {value: {reportKeyMode: 'TL_IM', reportModeDescription: 'TRUCKLOAD'}},
        {reportKeyMode: 'TL_IM', reportModeDescription: 'BROKER'}
      )).toBeFalse();
    });

    it('should return false', () => {
      expect(component.compareCarrierModeWith({value: {reportKeyMode: 'TLB'}}, {reportKeyMode: 'TL'})).toBeFalse();
    });

  });

});
