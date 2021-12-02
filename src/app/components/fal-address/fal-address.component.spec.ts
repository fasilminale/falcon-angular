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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
