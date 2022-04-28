import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceOverviewComponent } from './invoice-overview.component';
import { FalconTestingModule } from '../../../testing/falcon-testing.module';
import {Subject, Subscription} from 'rxjs';
import { InvoiceOverviewDetail } from 'src/app/models/invoice/invoice-overview-detail.model';
import { FreightPaymentTerms } from 'src/app/models/invoice/trip-information-model';
import {RemitHistoryItem} from "../../../models/invoice/remit-history-item";

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
    let subscription: Subscription;
    beforeEach(() => {
      loadInvoiceOverviewDetail$ = new Subject();
      component.loadInvoiceOverviewDetail$ = loadInvoiceOverviewDetail$.asObservable();
      subscription = new Subscription();
    });

    afterEach(() => {
      subscription.unsubscribe();
    });

    const prepopulateFields = () => {
      //Make sure old data is cleared
      component.erpInvoiceNumbers = ['zzzz'];
      component.erpRemittanceNumbers =['aaaa']
      component.vendorIds = ['hhhh']
      component.amountOfPayments = ['1111']
      component.dateOfPayments = ['2021-08-09T15:47:34.734+00:00']
    }

    it('(edit mode = true) should enable editable forms', done => {
      subscription.add(loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.invoiceOverviewDetail).toBeDefined();
        done();
      }));
      loadInvoiceOverviewDetail$.next({
        invoiceNetAmount: 6600,
        invoiceDate: new Date(),
        businessUnit: 'GPSC',
        billToAddress: {
          city: 'TestCity',
          address: 'TestAddress',
          address2: 'TestAddress2',
          name: 'TestName',
          state: 'TestState',
          country: 'TestCountry',
          code: 'TestCode',
          zipCode: 'TestZipCode'
        },
        paymentDue: new Date(),
        carrier: 'Fedex',
        carrierMode: 'Air',
        freightPaymentTerms: FreightPaymentTerms.PREPAID,
      });
    });

    it('should properly format remit data when invoiceOverviewDetail with no remit history', done => {

      prepopulateFields();

      subscription.add(loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.erpInvoiceNumbers).toEqual(['N/A']);
        expect(component.erpRemittanceNumbers).toEqual(['N/A']);
        expect(component.vendorIds).toEqual(['N/A']);
        expect(component.amountOfPayments).toEqual(['N/A']);
        expect(component.dateOfPayments).toEqual(['N/A']);
        done();
      }));

      loadInvoiceOverviewDetail$.next({} as InvoiceOverviewDetail);
    });

    it('should properly format remit data when invoiceOverviewDetail with one paid remit history item', done => {

      prepopulateFields();

      subscription.add(loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.erpInvoiceNumbers).toEqual(['1234']);
        expect(component.erpRemittanceNumbers).toEqual(['ABCD']);
        expect(component.vendorIds).toEqual(['qwerty']);
        expect(component.amountOfPayments).toEqual(['123.45']);
        expect(component.dateOfPayments).toEqual(['2022-03-21T15:47:34.734+00:00']);
        done();
      }));

      loadInvoiceOverviewDetail$.next({
        remitHistory: [
          {
            erpInvoiceNumber: '1234',
            erpRemittanceNumber: 'ABCD',
            remitVendorId: 'qwerty',
            amountOfPayment: 123.45,
            dateOfPayment: '2022-03-21T15:47:34.734+00:00',
            remitStatus: 'PAID'
          }
        ]
      } as InvoiceOverviewDetail);
    });

    it('should properly format remit data when invoiceOverviewDetail with one paid and one reversed remit history items', done => {

      prepopulateFields();

      subscription.add(loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.erpInvoiceNumbers).toEqual(['1234', 'N/A']);
        expect(component.erpRemittanceNumbers).toEqual(['ABCD', 'N/A']);
        expect(component.vendorIds).toEqual(['qwerty', 'N/A']);
        expect(component.amountOfPayments).toEqual(['123.45', 'N/A']);
        expect(component.dateOfPayments).toEqual(['2022-03-21T15:47:34.734+00:00', 'N/A']);
        done();
      }));

      loadInvoiceOverviewDetail$.next({
        remitHistory: [
          {
            erpInvoiceNumber: '1234',
            erpRemittanceNumber: 'ABCD',
            remitVendorId: 'qwerty',
            amountOfPayment: 123.45,
            dateOfPayment: '2022-03-21T15:47:34.734+00:00',
            remitStatus: 'PAID'
          },
          {
            erpInvoiceNumber: 'N/A',
            erpRemittanceNumber: 'N/A',
            remitVendorId: 'N/A',
            remitStatus: 'PAID'
          }
        ]
      } as InvoiceOverviewDetail);
    });

    it('should properly format remit data when invoiceOverviewDetail with two paid remit history items', done => {

      prepopulateFields();

      subscription.add(loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.erpInvoiceNumbers).toEqual(['1234', '5678']);
        expect(component.erpRemittanceNumbers).toEqual(['ABCD', 'EFGH']);
        expect(component.vendorIds).toEqual(['qwerty', 'asdfgh']);
        expect(component.amountOfPayments).toEqual(['123.45', '678.9']);
        expect(component.dateOfPayments).toEqual(['2022-03-21T15:47:34.734+00:00', '2022-03-01T15:47:34.734+00:00']);
        done();
      }));

      loadInvoiceOverviewDetail$.next({
        remitHistory: [
          {
            erpInvoiceNumber: '1234',
            erpRemittanceNumber: 'ABCD',
            remitVendorId: 'qwerty',
            amountOfPayment: 123.45,
            dateOfPayment: '2022-03-21T15:47:34.734+00:00',
            remitStatus: 'PAID'
          },
          {
            erpInvoiceNumber: '5678',
            erpRemittanceNumber: 'EFGH',
            remitVendorId: 'asdfgh',
            amountOfPayment: 678.90,
            dateOfPayment: '2022-03-01T15:47:34.734+00:00',
            remitStatus: 'PAID'
          },
        ]
      } as InvoiceOverviewDetail);
    });

    it('should truncate and properly format remit data when invoiceOverviewDetail with three paid remit history items', done => {

      prepopulateFields();

      subscription.add(loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.erpInvoiceNumbers).toEqual(['1234', '5678']);
        expect(component.erpRemittanceNumbers).toEqual(['ABCD', 'EFGH']);
        expect(component.vendorIds).toEqual(['qwerty', 'asdfgh']);
        expect(component.amountOfPayments).toEqual(['123.45', '678.9']);
        expect(component.dateOfPayments).toEqual(['2022-03-21T15:47:34.734+00:00', '2022-03-01T15:47:34.734+00:00']);
        done();
      }));

      loadInvoiceOverviewDetail$.next({
        remitHistory: [
          {
            erpInvoiceNumber: '1234',
            erpRemittanceNumber: 'ABCD',
            remitVendorId: 'qwerty',
            amountOfPayment: 123.45,
            dateOfPayment: '2022-03-21T15:47:34.734+00:00',
            remitStatus: 'PAID'
          },
          {
            erpInvoiceNumber: '5678',
            erpRemittanceNumber: 'EFGH',
            remitVendorId: 'asdfgh',
            amountOfPayment: 678.90,
            dateOfPayment: '2022-03-01T15:47:34.734+00:00',
            remitStatus: 'PAID'
          },
          {
            erpInvoiceNumber: '9012',
            erpRemittanceNumber: 'IJKL',
            remitVendorId: 'zxcvbn',
            amountOfPayment: 44433.92,
            dateOfPayment: '2022-04-17T15:47:34.734+00:00',
            remitStatus: 'PAID'
          },
        ]
      } as InvoiceOverviewDetail);
    });

    it('should truncate and properly format remit data when invoiceOverviewDetail with two paid and one reversed remit history items', done => {

      prepopulateFields();

      subscription.add(loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.erpInvoiceNumbers).toEqual(['1234', '5678']);
        expect(component.erpRemittanceNumbers).toEqual(['ABCD', 'EFGH']);
        expect(component.vendorIds).toEqual(['qwerty', 'asdfgh']);
        expect(component.amountOfPayments).toEqual(['123.45', '678.9']);
        expect(component.dateOfPayments).toEqual(['2022-03-21T15:47:34.734+00:00', '2022-03-01T15:47:34.734+00:00']);
        done();
      }));

      loadInvoiceOverviewDetail$.next({
        remitHistory: [
          {
            erpInvoiceNumber: '1234',
            erpRemittanceNumber: 'ABCD',
            remitVendorId: 'qwerty',
            amountOfPayment: 123.45,
            dateOfPayment: '2022-03-21T15:47:34.734+00:00',
            remitStatus: 'PAID'
          },
          {
            erpInvoiceNumber: '5678',
            erpRemittanceNumber: 'EFGH',
            remitVendorId: 'asdfgh',
            amountOfPayment: 678.90,
            dateOfPayment: '2022-03-01T15:47:34.734+00:00',
            remitStatus: 'PAID'
          },
          {
            erpInvoiceNumber: 'N/A',
            erpRemittanceNumber: 'N/A',
            remitVendorId: 'N/A',
            remitStatus: 'PAID'
          },
        ]
      } as InvoiceOverviewDetail);
    });
  });
});
