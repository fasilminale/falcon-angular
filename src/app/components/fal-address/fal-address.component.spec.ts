import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { FalconTestingModule } from 'src/app/testing/falcon-testing.module';

import { FalAddressComponent } from './fal-address.component';

describe('FalAddressComponent', () => {
  let component: FalAddressComponent;
  let fixture: ComponentFixture<FalAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ FalAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalAddressComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create and set form group', () => {
    expect(component).toBeTruthy();
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
});
