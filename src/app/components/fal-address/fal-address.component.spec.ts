import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { BillToLocation, EMPTY_LOCATION, ShippingPointLocation, ShippingPointLocationSelectOption } from 'src/app/models/location/location-model';
import { FalconTestingModule } from 'src/app/testing/falcon-testing.module';

import { FalAddressComponent } from './fal-address.component';

describe('FalAddressComponent', () => {
  let component: FalAddressComponent;
  let fixture: ComponentFixture<FalAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [FalAddressComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalAddressComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});

    component.loadAddress$ = new Subject<ShippingPointLocation>().asObservable();
    fixture.detectChanges();
  });

  it('should create and set form group', () => {
    expect(component).toBeTruthy();
  });

  it('should set form group', () => {
    component.formGroup = new FormGroup({});
    expect(component._formGroup.get('name')).toBeDefined();
    expect(component._formGroup.get('country')).toBeDefined();
    expect(component._formGroup.get('city')).toBeDefined();
    expect(component._formGroup.get('zipCode')).toBeDefined();
    expect(component._formGroup.get('state')).toBeDefined();
    expect(component._formGroup.get('streetAddress')).toBeDefined();
    expect(component._formGroup.get('streetAddress2')).toBeDefined();
    expect(component._formGroup.get('shippingPoint')).toBeDefined();
    expect(component._formGroup.get('dummyFormField')).toBeNull();
  });

  describe('should emit', () => {
    let loadFilteredShippingPointLocations$: Subject<ShippingPointLocationSelectOption[]>;
    beforeEach(() => {
      loadFilteredShippingPointLocations$ = new Subject();
      component.loadFilteredShippingPointLocations$ = loadFilteredShippingPointLocations$.asObservable();
    });

    it(' onchange of shipping control when address type is origin', fakeAsync(() => {
      component.addressType = 'origin';
      let shippingPointSelect: ShippingPointLocationSelectOption = {
        label: 'TestShippingPoint',
        value: 'TestShippingPoint',
        businessUnit: 'GSPC',
        location: {
          name: 'TestName',
          address: 'TestAddress',
          address2: 'TestAddress2',
          city: 'TestCity',
          state: 'TestState',
          country: 'TestCountry',
          zipCode: 'TestZipCode'
        }
      };
      loadFilteredShippingPointLocations$.next([shippingPointSelect]);
      component._formGroup.controls.shippingPoint?.setValue(shippingPointSelect);
      component.onShippingPointChange(shippingPointSelect);
      tick();
      expect(component._formGroup.get('name')?.value).toBe(shippingPointSelect.location.name);
      expect(component._formGroup.get('country')?.value).toBe(shippingPointSelect.location.country);
      expect(component._formGroup.get('city')?.value).toBe(shippingPointSelect.location.city);
      expect(component._formGroup.get('zipCode')?.value).toBe(shippingPointSelect.location.zipCode);
      expect(component._formGroup.get('state')?.value).toBe(shippingPointSelect.location.state);
      expect(component._formGroup.get('streetAddress')?.value).toBe(shippingPointSelect.location.address);
      expect(component._formGroup.get('streetAddress2')?.value).toBe(shippingPointSelect.location.address2);
      flush();
    }));

    it(' onchange of shipping control when address type is origin with N/A values', fakeAsync(() => {
      component.addressType = 'origin';
      component.validateField = false;
      let shippingPointSelect: ShippingPointLocationSelectOption = {
        label: 'TestShippingPoint',
        value: 'TestShippingPoint',
        businessUnit: 'GSPC',
        location: EMPTY_LOCATION
      };
      loadFilteredShippingPointLocations$.next([shippingPointSelect]);
      component._formGroup.controls.shippingPoint?.setValue(shippingPointSelect);
      component.onShippingPointChange(shippingPointSelect);
      tick();
      let valueNA = 'N/A';
      expect(component._formGroup.get('name')?.value).toBe(valueNA);
      expect(component._formGroup.get('country')?.value).toBe(valueNA);
      expect(component._formGroup.get('city')?.value).toBe(valueNA);
      expect(component._formGroup.get('zipCode')?.value).toBe(valueNA);
      expect(component._formGroup.get('state')?.value).toBe(valueNA);
      expect(component._formGroup.get('streetAddress')?.value).toBe(valueNA);
      flush();
    }));
  });

  describe('should loadAddress$', () => {
    let updateIsEditMode$: Subject<boolean>;
    let loadAddress$: Subject<any>;
    let loadFilteredShippingPointLocations$: Subject<ShippingPointLocationSelectOption[]>;
    beforeEach(() => {
      loadAddress$ = new Subject();
      component.loadAddress$ = loadAddress$.asObservable();
    });

    it('should set form group when address is loaded', done => {
      loadAddress$.subscribe(address => {
        expect(component._formGroup.get('name')?.value).toBe(address.name);
        expect(component._formGroup.get('country')?.value).toBe(address.country);
        expect(component._formGroup.get('city')?.value).toBe(address.city);
        expect(component._formGroup.get('zipCode')?.value).toBe(address.zipCode);
        expect(component._formGroup.get('state')?.value).toBe(address.state);
        expect(component._formGroup.get('streetAddress')?.value).toBe(address.address);
        expect(component._formGroup.get('streetAddress2')?.value).toBe(address.address2);
        expect(component._formGroup.get('shippingPoint')?.value).toBe(address.shippingPoint);
        done();
      });
      loadAddress$.next({
        city: 'TestCity',
        address: 'TestAddress',
        address2: 'TestAddress2',
        name: 'TestName',
        state: 'TestState',
        country: 'TestCountry',
        code: 'TestCode',
        zipCode: 'TestZipCode',
        shippingPoint: 'TestShippingPoint'
      });
    });

    it('should not set form group when required properties of address are undefined', done => {
      loadAddress$.subscribe(address => {
        expect(component._formGroup.get('country')?.value).toBeUndefined();
        expect(component._formGroup.get('zipCode')?.value).toBeUndefined();
        done();
      });
      loadAddress$.next({} as ShippingPointLocation);
    });

    it('should set form group values to N/A on non-required properties', done => {
      loadAddress$.subscribe(address => {
        expect(component._formGroup.get('name')?.value).toEqual('N/A');
        expect(component._formGroup.get('city')?.value).toEqual('N/A');
        expect(component._formGroup.get('state')?.value).toEqual('N/A');
        expect(component._formGroup.get('streetAddress')?.value).toEqual('N/A');
        expect(component._formGroup.get('streetAddress2')?.value).toEqual('N/A');
        expect(component._formGroup.get('shippingPoint')?.value).toEqual('N/A');
        done();
      });
      loadAddress$.next({} as ShippingPointLocation);
    });

    it('should set shipping point to N/A when address type is destination', done => {
      component.addressType = 'destination';
      loadAddress$.subscribe(address => {
        expect(component._formGroup.get('shippingPoint')?.value).toEqual('N/A');
        done();
      });
      loadAddress$.next({
        city: 'TestCity',
        address: 'TestAddress',
        address2: 'TestAddress2',
        name: 'TestName',
        state: 'TestState',
        country: 'TestCountry',
        code: 'TestCode',
        zipCode: 'TestZipCode',
        shippingPoint: 'TestShippingPoint'
      });
    });

    it('should set shipping point to proper value when address type is origin', done => {
      component.addressType = 'origin';
      loadAddress$.subscribe(address => {
        expect(component._formGroup.get('shippingPoint')?.value).toEqual('TestShippingPoint');
        done();
      });
      loadAddress$.next({
        city: 'TestCity',
        address: 'TestAddress',
        address2: 'TestAddress2',
        name: 'TestName',
        state: 'TestState',
        country: 'TestCountry',
        code: 'TestCode',
        zipCode: 'TestZipCode',
        shippingPoint: 'TestShippingPoint'
      });
    });

    it('should set shipping point to N/A when address type is origin and shipping point is undefined', done => {
      component.addressType = 'origin';
      loadAddress$.subscribe(address => {
        expect(component._formGroup.get('shippingPoint')?.value).toEqual('N/A');
        done();
      });
      loadAddress$.next({
        city: 'TestCity',
        address: 'TestAddress',
        address2: 'TestAddress2',
        name: 'TestName',
        state: 'TestState',
        country: 'TestCountry',
        code: 'TestCode',
        zipCode: 'TestZipCode',
        shippingPoint: undefined
      });
    });
    
    it('should set BillTo when address type is not defined', done => {
      loadAddress$.subscribe(address => {
        expect(component._formGroup.get('idCode')?.value).toEqual('TestCode');
        expect(component._formGroup.get('name2')?.value).toEqual('TestName2');
        done();
      });
      loadAddress$.next({
        city: 'TestCity',
        address: 'TestAddress',
        address2: 'TestAddress2',
        name: 'TestName',
        state: 'TestState',
        country: 'TestCountry',
        idCode: 'TestCode',
        zipCode: 'TestZipCode',
        name2: 'TestName2'
      });
    });
  });


});
