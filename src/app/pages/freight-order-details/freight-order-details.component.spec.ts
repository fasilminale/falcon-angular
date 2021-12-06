import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FalconTestingModule } from 'src/app/testing/falcon-testing.module';

import { FreightOrderDetailsComponent } from './freight-order-details.component';

describe('FreightOrderDetailsComponent', () => {
  let component: FreightOrderDetailsComponent;
  let fixture: ComponentFixture<FreightOrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ FreightOrderDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreightOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set freight order title', () => {
   expect(component.freightOrderTitle).toBe('Freight Orders in Trip (0)');
  });
});
