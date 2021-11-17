import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceOverviewComponent } from './invoice-overview.component';
import {FalconTestingModule} from '../../../testing/falcon-testing.module';

describe('InvoiceOverviewComponent', () => {
  let component: InvoiceOverviewComponent;
  let fixture: ComponentFixture<InvoiceOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ InvoiceOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
