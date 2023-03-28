import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormArray, UntypedFormGroup } from '@angular/forms';
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
    component.formGroup = new UntypedFormGroup({});

    component.loadAddress$ = new Subject<ShippingPointLocation>().asObservable();
    component.loadFilteredShippingPointLocations$ = new Subject<ShippingPointLocationSelectOption[]>().asObservable();
    component.updateIsEditMode$ = new Subject<boolean>().asObservable();
    fixture.detectChanges();
  });

  it('should create and set form group', () => {
    expect(component).toBeTruthy();
  });

  it('should set form group', () => {
    component.formGroup = new UntypedFormGroup({});
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

    it(' onchange of shipping control with empty shippingPoint select value', fakeAsync(() => {
      component.addressType = 'origin';
      let shippingPointSelect = {} as ShippingPointLocationSelectOption;
      component.onShippingPointChange(shippingPointSelect);
      tick();
      expect(component._formGroup.get('name')?.value).toEqual('N/A');
      expect(component._formGroup.get('country')?.value).toEqual('N/A');
      expect(component._formGroup.get('city')?.value).toEqual('N/A');
      expect(component._formGroup.get('zipCode')?.value).toEqual('N/A');
      expect(component._formGroup.get('state')?.value).toEqual('N/A');
      expect(component._formGroup.get('streetAddress')?.value).toEqual('N/A');
      expect(component._formGroup.get('streetAddress2')?.value).toEqual('N/A');
      flush();
    }));

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
      loadFilteredShippingPointLocations$ = new Subject();
      component.loadAddress$ = loadAddress$.asObservable();
      component.loadFilteredShippingPointLocations$ = loadFilteredShippingPointLocations$.asObservable();
      updateIsEditMode$ = new Subject();
      component.updateIsEditMode$ = updateIsEditMode$.asObservable();
    });
    
    it('should enable shipping control when address type is origin', done => {
      component.addressType = 'origin';
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
      updateIsEditMode$.subscribe(isEditMode => {
        expect(component._formGroup.get('shippingPoint')?.enabled).toBe(true);
        done();
      });
      updateIsEditMode$.next(true);
    });

    it('should disable shipping control when address type is origin', done => {
      component.addressType = 'origin';
      component.destinationType = 'CUST';
      updateIsEditMode$.subscribe(isEditMode => {
        expect(component._formGroup.get('shippingPoint')?.disabled).toBe(true);
        done();
      });
      updateIsEditMode$.next(false);
    });

    it('should enable address fields when address type is destination and destination type is CUST', done => {
      component.addressType = 'destination';
      component.destinationType = 'CUST';
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
      updateIsEditMode$.subscribe(isEditMode => {
        expect(component._formGroup.get('name')?.enabled).toBe(true);
        expect(component._formGroup.get('country')?.enabled).toBe(true);
        expect(component._formGroup.get('city')?.enabled).toBe(true);
        expect(component._formGroup.get('zipCode')?.enabled).toBe(true);
        expect(component._formGroup.get('state')?.enabled).toBe(true);
        expect(component._formGroup.get('streetAddress')?.enabled).toBe(true);
        expect(component._formGroup.get('streetAddress2')?.enabled).toBe(true);
        done();
      });
      updateIsEditMode$.next(true);
    });

    it('should disable address fields when address type is destination and destination type is CUST', done => {
      component.addressType = 'destination';
      component.destinationType = 'CUST';
      updateIsEditMode$.subscribe(isEditMode => {
        expect(component._formGroup.get('name')?.disabled).toBe(true);
        expect(component._formGroup.get('country')?.disabled).toBe(true);
        expect(component._formGroup.get('city')?.disabled).toBe(true);
        expect(component._formGroup.get('zipCode')?.disabled).toBe(true);
        expect(component._formGroup.get('state')?.disabled).toBe(true);
        expect(component._formGroup.get('streetAddress')?.disabled).toBe(true);
        expect(component._formGroup.get('streetAddress2')?.disabled).toBe(true);
        done();
      });
      updateIsEditMode$.next(false);
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
      loadFilteredShippingPointLocations$.next([{
        label: 'TestShippingPoint',
        value: 'TestShippingPoint',
        businessUnit: 'GSPC',
        location: {
          name: 'TestName',
          address: 'TestAddress',
          city: 'TestCity',
          state: 'TestState',
          country: 'TestCountry',
          zipCode: 'TestZipCode'
        }
      }]);
    });

    // it('should not set form group when required properties of address are undefined', done => {
    //   loadAddress$.subscribe(address => {
    //     expect(component._formGroup.get('country')?.value).toBeUndefined();
    //     expect(component._formGroup.get('zipCode')?.value).toBeUndefined();
    //     done();
    //   });
    //   loadAddress$.next({} as ShippingPointLocation);
    //   loadFilteredShippingPointLocations$.next([] as ShippingPointLocationSelectOption[]);
    // });

    it('should set form group values to N/A on non-required properties', done => {
      loadAddress$.subscribe(address => {
        expect(component._formGroup.get('name')?.value).toEqual('N/A');
        expect(component._formGroup.get('city')?.value).toEqual('N/A');
        expect(component._formGroup.get('state')?.value).toEqual('N/A');
        expect(component._formGroup.get('streetAddress')?.value).toEqual('N/A');
        expect(component._formGroup.get('streetAddress2')?.value).toEqual('N/A');
        expect(component._formGroup.get('shippingPoint')?.value).toEqual('N/A');
        expect(component._formGroup.get('country')?.value).toEqual('N/A');
        expect(component._formGroup.get('zipCode')?.value).toEqual('N/A');
        done();
      });
      loadAddress$.next({} as ShippingPointLocation);
      loadFilteredShippingPointLocations$.next([] as ShippingPointLocationSelectOption[]);
    });

    it('should set shipping point to N/A when address type is destination and destination type is CUST', done => {
      component.addressType = 'destination';
      component.destinationType = 'CUST';
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
      loadFilteredShippingPointLocations$.next([{
        label: 'TestShippingPoint',
        value: 'TestShippingPoint',
        businessUnit: 'GSPC',
        location: {
          name: 'TestName',
          address: 'TestAddress',
          city: 'TestCity',
          state: 'TestState',
          country: 'TestCountry',
          zipCode: 'TestZipCode'
        }
      }]);
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
      loadFilteredShippingPointLocations$.next([{
        label: 'TestShippingPoint',
        value: 'TestShippingPoint',
        businessUnit: 'GSPC',
        location: {
          name: 'TestName',
          address: 'TestAddress',
          city: 'TestCity',
          state: 'TestState',
          country: 'TestCountry',
          zipCode: 'TestZipCode'
        }
      }]);
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
      loadFilteredShippingPointLocations$.next([{
        label: 'TestShippingPoint',
        value: 'TestShippingPoint',
        businessUnit: 'GSPC',
        location: {
          name: 'TestName',
          address: 'TestAddress',
          city: 'TestCity',
          state: 'TestState',
          country: 'TestCountry',
          zipCode: 'TestZipCode'
        }
      }]);
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
