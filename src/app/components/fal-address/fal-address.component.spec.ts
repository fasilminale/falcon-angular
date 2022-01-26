import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { ShippingPointLocation } from 'src/app/models/location/location-model';
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

  describe('should loadAddress$', () => {
    let loadAddress$: Subject<ShippingPointLocation>;
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

    it('should not set form group when properties of address are undefined', done => {
      loadAddress$.subscribe(address => {
        expect(component._formGroup.get('name')?.value).toBeUndefined();
        expect(component._formGroup.get('country')?.value).toBeUndefined();
        expect(component._formGroup.get('city')?.value).toBeUndefined();
        expect(component._formGroup.get('zipCode')?.value).toBeUndefined();
        expect(component._formGroup.get('state')?.value).toBeUndefined();
        expect(component._formGroup.get('streetAddress')?.value).toBeUndefined();
        expect(component._formGroup.get('streetAddress2')?.value).toBeUndefined();
        expect(component._formGroup.get('shippingPoint')?.value).toBeUndefined();
        done();
      });
      loadAddress$.next({} as ShippingPointLocation);
    });


  })
  

});
