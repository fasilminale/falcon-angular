import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

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
import {CarrierSCAC} from '../../../models/master-data-models/carrier-scac';

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
    spyOn(masterDataService, 'getCarrierSCACs').and.returnValue(of([]));
    spyOn(masterDataService, 'getCarriers').and.returnValue(of([]));
    spyOn(masterDataService, 'getCarrierModeCodes').and.returnValue(of([]));
    spyOn(masterDataService, 'getServiceLevels').and.returnValue(of([]));

    // Create Component
    fixture = TestBed.createComponent(TripInformationComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  describe('after component creation', () => {
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
      expect(Object.keys(component.formGroup.controls).length).toBe(14);
    });
  });

  describe('#carrierSCACs', () => {
    describe('given a carrier scac', () => {
      const CARRIER_SCAC: CarrierSCAC = {
        scac: 'TCS',
        mode: 'LTL',
        serviceLevel: 't1'
      };
      beforeEach(() => {
        asSpy(masterDataService.getCarrierSCACs).and.returnValue(of([CARRIER_SCAC]));
        component.ngOnInit();
      });
      it('should have carrier option', () => {
        fixture.detectChanges();
        expect(component.carrierSCACs).toEqual([{
          scac: 'TCS',
          mode: 'LTL',
          serviceLevel: 't1'
        }]);
      });
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
        fixture.detectChanges();
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
        fixture.detectChanges();
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
        fixture.detectChanges();
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
    tripInformation$.next(tripInformation);
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
      expect(component.compareCarrierWith({value: {scac:'TL'}}, {scac: 'TL'})).toBeTrue();
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
      expect(component.compareServiceLevelWith({value: {level:'t1'}}, {level: 't1'})).toBeTrue();
    });

    it('should return false', () => {
      fixture.detectChanges();
      expect(component.compareServiceLevelWith({value: {level: 't1'}}, {level: 't2'})).toBeFalse();
    });

  });

  describe('should refresh carrier data', () => {
    it('should call filter methods', () => {
      fixture.detectChanges();
      spyOn(component, 'filterServiceLevels').and.callThrough();
      spyOn(component, 'filterCarrierModes').and.callThrough();
      component.carrierControl.setValue({ scac: 'TestScac' });
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
          value: { mode: 'LTL', reportKeyMode: 'LTL', reportModeDescription: 'LTL.' }
        },
        {
          label: 'TL (Test TL Mode Description)',
          value: { mode: 'TL', reportKeyMode: 'TL', reportModeDescription: 'TL.' }
        }
      ];

      component.serviceLevelOptions = [
        {
          label: 't1',
          value: { level: 't1', name: 'T1' }
        },
        {
          label: 't2',
          value: { level: 't2', name: 'T2' }
        }
      ];
      component.refreshCarrierData();
      expect(component.filterCarrierModes).toHaveBeenCalled();
      expect(component.filterServiceLevels).toHaveBeenCalled();
    });
  });

});
