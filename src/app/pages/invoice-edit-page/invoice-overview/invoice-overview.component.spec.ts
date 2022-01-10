import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceOverviewComponent } from './invoice-overview.component';
import { FalconTestingModule } from '../../../testing/falcon-testing.module';
import { Subject } from 'rxjs';
import { InvoiceOverviewDetail } from 'src/app/models/invoice/invoice-overview-detail.model';
import { FreightPaymentTerms } from 'src/app/models/invoice/trip-information-model';

describe('InvoiceOverviewComponent', () => {
  let component: InvoiceOverviewComponent;
  let fixture: ComponentFixture<InvoiceOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [InvoiceOverviewComponent]
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

  describe('when invoice overview detail is updated', () => {
    let loadInvoiceOverviewDetail$: Subject<InvoiceOverviewDetail>;
    beforeEach(() => {
      loadInvoiceOverviewDetail$ = new Subject();
      component.loadInvoiceOverviewDetail$ = loadInvoiceOverviewDetail$.asObservable();
    });

    it('(edit mode = true) should enable editable forms', done => {
      loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.invoiceOverviewDetail).toBeDefined();
        done();
      });
      loadInvoiceOverviewDetail$.next({
        invoiceNetAmount: 6600,
        invoiceDate: new Date(),
        businessUnit: 'GPSC',
        billToAddress: 'NY, USA',
        paymentDue: new Date(),
        carrier: 'Fedex',
        carrierMode: 'Air',
        freightPaymentTerms: FreightPaymentTerms.PREPAID,
        remittanceInformation: {
          erpInvoiceNumber: 'ERP1000',
          erpRemittanceNumber: 'ERP2000',
          vendorId: 'FED100',
          amountOfPayment: 600
        }
      });
    });
  });

});
