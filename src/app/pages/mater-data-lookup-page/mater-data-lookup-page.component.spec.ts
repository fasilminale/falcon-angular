import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MasterDataLookupPageComponent} from "./master-data-lookup-page.component";
import {StorageService} from '../../services/storage-service/storage-service';
import {MasterDataLookupService, CarrierModelInterface, ShippingPointModelInterface} from "../../services/master-data-lookup-service/master-data-lookup-service";
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {EMPTY, of} from 'rxjs';
import {CarrierModel} from "../../models/master-data-lookup/carrier-model";
import {AppModule} from '../../app.module';
import {UntypedFormBuilder} from "@angular/forms";
import {ShippingPointWarehouseModel} from "../../models/master-data-lookup/shipping-point-warehouse-model";

describe('MasterDataLookupPageComponent', () => {
  let component: MasterDataLookupPageComponent;
  let fixture: ComponentFixture<MasterDataLookupPageComponent>;
  let router: Router;
  let formBuilder: UntypedFormBuilder;

  const masterDataLookupServiceSpy = jasmine.createSpyObj('MasterDataLookupService', ['getCarriersApiCall', 'getShippingPointApiCall']);

  const storageServiceSpy = jasmine.createSpyObj('StorageService', [], {
    shippingPointsUpdatedSubject: EMPTY
  });

  const carrierModel = new CarrierModel();
  carrierModel.scac = 'scac';
  carrierModel.name = 'name';
  const carrierResponse: CarrierModelInterface = { total: 1, carriers: [carrierModel]};
  const carrierObservable = of(carrierResponse);

  const shippingModel = new ShippingPointWarehouseModel();
  shippingModel.shippingPointCode = 'S1';
  shippingModel.warehouse = 'D1';
  const shippingResponse: ShippingPointModelInterface = { total: 1, shippingPoints: [shippingModel]};
  const shippingObservable = of(shippingResponse);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MasterDataLookupPageComponent],
      imports: [
        AppModule,
        RouterTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: MasterDataLookupService, useValue: masterDataLookupServiceSpy }
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    masterDataLookupServiceSpy.getCarriersApiCall.and.returnValue(carrierObservable);
    masterDataLookupServiceSpy.getShippingPointApiCall.and.returnValue(shippingObservable);
    fixture = TestBed.createComponent(MasterDataLookupPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    formBuilder = TestBed.inject(UntypedFormBuilder);
    fixture.detectChanges();
  });


  it('should create', () => {
    console.log('Testing Master Data Lookup Page');
    expect(component).toBeTruthy();
  });

  it('Carriers loaded', () => {
    expect(component.carriers.length).toEqual(1);
    expect(component.carriers[0].scac).toEqual("scac");
    expect(component.carriers[0].name).toEqual("name");
    expect(component.carriers[0].label).toEqual("scac (name)");

  });

  describe('getSelected Carrier', () => {
    it('should get Selected Carrier', () => {
      component.lookupGroup.controls.selectControl.setValue('scac');
      expect(component.lookupGroup.controls.selectControl.value).toEqual("scac");
    });
  });

  describe('get Carrier', () => {
    it('should get Carrier', () => {
      component.lookupGroup.controls.selectControl.setValue('scac');
      component.getCarrier();
      expect(component.selectedCarrier.scac).toEqual("scac");
    });
  });

  describe('get searchShippingValue', () => {
    it('should get searchShippingValue', () => {
      component.lookupGroup.controls.shippingControl.setValue('');
      component.lookupGroup.controls.addressControl.setValue('');
      component.lookupGroup.controls.cityControl.setValue('');
      component.lookupGroup.controls.stateControl.setValue('');
      component.lookupGroup.controls.zipControl.setValue('');
      component.lookupGroup.controls.countryControl.setValue('US');

      expect(component.searchShippingValue).toEqual('US');
    });
  });

  describe('getShippingPointWarehouse with shippingpoint code', () => {
    it('should not refresh when not submittable', () => {
      spyOnProperty(component, 'searchShippingValue').and.returnValue(null);
      component.getShippingPointTableData();
      expect(masterDataLookupServiceSpy.getShippingPointApiCall).not.toHaveBeenCalled();
    });

    it('should call service to get shipping point warehouse', fakeAsync(() => {
      spyOnProperty(component, 'searchShippingValue').and.returnValue('test');
      component.lookupGroup.controls.shippingControl.setValue('S1');
      component.lookupGroup.controls.addressControl.setValue('');
      component.lookupGroup.controls.cityControl.setValue('');
      component.lookupGroup.controls.stateControl.setValue('');
      component.lookupGroup.controls.zipControl.setValue('');
      component.lookupGroup.controls.countryControl.setValue('');
      component.getShippingPointTableData();
      tick(100);
      fixture.detectChanges();
      expect(masterDataLookupServiceSpy.getShippingPointApiCall).toHaveBeenCalledWith(
        'S1','' ,'' ,''  ,'' ,''
      );
      expect(component.shippingPoints).toEqual([shippingModel]);
    }));
  });

  describe('getShippingPointWarehouse with shippingpoint address', () => {
    it('should call service to get shipping point address', fakeAsync(() => {
      spyOnProperty(component, 'searchShippingValue').and.returnValue('test');
      component.lookupGroup.controls.shippingControl.setValue('');
      component.lookupGroup.controls.addressControl.setValue('add');
      component.lookupGroup.controls.cityControl.setValue('');
      component.lookupGroup.controls.stateControl.setValue('');
      component.lookupGroup.controls.zipControl.setValue('');
      component.lookupGroup.controls.countryControl.setValue('');
      component.getShippingPointTableData();
      tick(100);
      fixture.detectChanges();
      expect(masterDataLookupServiceSpy.getShippingPointApiCall).toHaveBeenCalledWith(
        '','add' ,'' ,''  ,'' ,''
      );
      expect(component.shippingPoints).toEqual([shippingModel]);
    }));
  });

});
