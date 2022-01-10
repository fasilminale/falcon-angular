import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Subject } from 'rxjs';
import { InvoiceOverviewDetail } from 'src/app/models/invoice/invoice-overview-detail.model';
import { FreightPaymentTerms } from 'src/app/models/invoice/trip-information-model';
import { FalconTestingModule } from 'src/app/testing/falcon-testing.module';
import { InfoIconTooltipComponent } from './info-icon-tooltip.component';

describe('InvoiceOverviewComponent', () => {
  let component: InfoIconTooltipComponent;
  let fixture: ComponentFixture<InfoIconTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [InfoIconTooltipComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoIconTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
