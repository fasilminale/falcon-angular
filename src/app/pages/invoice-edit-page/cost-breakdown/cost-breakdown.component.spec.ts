import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostBreakdownComponent } from './cost-breakdown.component';
import {FalconTestingModule} from '../../../testing/falcon-testing.module';

describe('CostBreakdownComponent', () => {
  let component: CostBreakdownComponent;
  let fixture: ComponentFixture<CostBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ CostBreakdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
