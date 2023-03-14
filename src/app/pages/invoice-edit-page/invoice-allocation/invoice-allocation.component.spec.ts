import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { FalconTestingModule } from 'src/app/testing/falcon-testing.module';

import { InvoiceAllocationComponent } from './invoice-allocation.component';
import { InvoiceAllocationDetail } from '../../../models/invoice/trip-information-model';
import {InvoiceOverviewDetail} from '../../../models/invoice/invoice-overview-detail.model';

describe('InvoiceAllocationComponent', () => {
  let component: InvoiceAllocationComponent;
  let fixture: ComponentFixture<InvoiceAllocationComponent>;

  const testAllocationDetails = new UntypedFormGroup( {
    invoiceNetAmount: new UntypedFormControl('1234.56'),
    totalGlAmount: new UntypedFormControl('1234.56'),
    invoiceAllocations: new UntypedFormArray([
      new UntypedFormGroup({
        allocationPercent: new UntypedFormControl(300.00),
        customerCategory: new UntypedFormControl('CAH'),
        shippingPointWarehouse: new UntypedFormControl('Other'),
        glCostCenter: new UntypedFormControl(''),
        glProfitCenter: new UntypedFormControl(''),
        glAccount: new UntypedFormControl('71257000'),
        glCompanyCode: new UntypedFormControl('4323345'),
        glAmount: new UntypedFormControl(300.00)
      })
    ])
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ InvoiceAllocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceAllocationComponent);
    component = fixture.componentInstance;
    component.invoiceNetAmount = new UntypedFormControl(0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form control', () => {
    component.invoiceAllocations = testAllocationDetails.get('invoiceAllocations') as UntypedFormArray;
    component.formGroup = testAllocationDetails;

    expect(component._formGroup.get('invoiceAllocations')).toBeDefined();
    const invoiceAllocation =  component.invoiceAllocationsControls[0];
    expect(invoiceAllocation.get('allocationPercent')).toBeDefined();
    expect(invoiceAllocation.get('glCostCenter')).toBeDefined();
    expect(invoiceAllocation.get('glProfitCenter')).toBeDefined();
    expect(invoiceAllocation.get('customerCategory')).toBeDefined();
    expect(invoiceAllocation.get('glCompanyCode')).toBeDefined();
    expect(invoiceAllocation.get('glAccount')).toBeDefined();
    expect(invoiceAllocation.get('allocationAmount')).toBeDefined();
    expect(invoiceAllocation.get('glAmount')).toBeDefined();
  });

  describe('when invoice overview detail is loaded', () => {
    let loadInvoiceOverviewDetail$: Subject<InvoiceOverviewDetail>;

    beforeEach(() => {
      loadInvoiceOverviewDetail$ = new Subject();
      component.loadInvoiceOverviewDetail$ = loadInvoiceOverviewDetail$.asObservable();
    });

    it('should set isPrepaid to True', done => {
      loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.isPrepaid).toBeTrue();
        done();
      });
      loadInvoiceOverviewDetail$.next({freightPaymentTerms: 'PREPAID'} as InvoiceOverviewDetail);
    });

    it('should set isPrepaid to False', done => {
      loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.isPrepaid).toBeFalse();
        done();
      });
      loadInvoiceOverviewDetail$.next({freightPaymentTerms: 'COLLECT'} as InvoiceOverviewDetail);
    });
  });

  describe('when invoice allocation detail is updated', () => {
    let loadAllocationDetails$: Subject<InvoiceAllocationDetail>;
    beforeEach(() => {
      loadAllocationDetails$ = new Subject();
      component.loadAllocationDetails = loadAllocationDetails$.asObservable();
    });

    it('should load allocation detail form', done => {
      loadAllocationDetails$.subscribe(() => {
        expect(component._formGroup).toBeDefined();
        done();
      });
      loadAllocationDetails$.next({
        invoiceNetAmount: '1234.56',
        totalGlAmount: '1234.56',
        glLineItems: [{
          allocationPercent: 300.00,
          customerCategory: 'CAH',
          shippingPointWarehouse: 'Other',
          glCostCenter: '',
          glProfitCenter: '',
          glAccount: '71257000',
          glCompanyCode: '4323345',
          glAmount: 300.00,
          debitCreditFlag: ''
        }]
      });
    });

    it('should load allocation detail form with missing values', done => {
      loadAllocationDetails$.subscribe(() => {
        expect(component._formGroup).toBeDefined();
        done();
      });
      loadAllocationDetails$.next({
        invoiceNetAmount: '1234.56',
        totalGlAmount: '1234.56',
        glLineItems: [{
          allocationPercent: 300.00,
          customerCategory: 'CAH',
          shippingPointWarehouse: 'Other',
          glCostCenter: '',
          glProfitCenter: '',
          glAccount: '71257000',
          glCompanyCode: '4323345',
          glAmount: undefined,
          debitCreditFlag: ''
        }] as any
      });
    });

    it('should load allocation detail form with glCostCenter', done => {
      loadAllocationDetails$.subscribe(() => {
        expect(component._formGroup).toBeDefined();
        done();
      });
      loadAllocationDetails$.next({
        invoiceNetAmount: '1234.56',
        totalGlAmount: '1234.56',
        glLineItems: [{
          allocationPercent: 300.00,
          customerCategory: 'CAH',
          shippingPointWarehouse: 'Other',
          glCostCenter: '23344',
          glProfitCenter: '',
          glAccount: '71257000',
          glCompanyCode: '4323345',
          glAmount: 300.00,
          debitCreditFlag: ''
        }]
      });
    });

    it('should load allocation detail form with glProfitCenter', done => {
      loadAllocationDetails$.subscribe(() => {
        expect(component._formGroup).toBeDefined();
        done();
      });
      loadAllocationDetails$.next({
        invoiceNetAmount: '1234.56',
        totalGlAmount: '1234.56',
        glLineItems: [{
          allocationPercent: 300.00,
          customerCategory: 'BAX',
          shippingPointWarehouse: 'Other',
          glCostCenter: '',
          glProfitCenter: '23344',
          glAccount: '71257000',
          glCompanyCode: '4323345',
          glAmount: 300.00,
          debitCreditFlag: ''
        }]
      });
    });

    it('should load allocation detail form with both glProfitCenter and glProfitCenter', done => {
      loadAllocationDetails$.subscribe(() => {
        expect(component._formGroup).toBeDefined();
        done();
      });
      loadAllocationDetails$.next({
        invoiceNetAmount: '1234.56',
        totalGlAmount: '1234.56',
        glLineItems: [{
          allocationPercent: 300.00,
          customerCategory: 'CAH',
          shippingPointWarehouse: 'Other',
          glCostCenter: '23344',
          glProfitCenter: '23344',
          glAccount: '71257000',
          glCompanyCode: '4323345',
          glAmount: 300.00,
          debitCreditFlag: ''
        }]
      });
    });

    it('should emit an event to open the edit modal', () => {
      spyOn(component.editGlLineItemEvent, 'emit').and.stub();
      component.onEditGlLineItem({} as any);
      expect(component.editGlLineItemEvent.emit).toHaveBeenCalled();
    });
  });

  describe('when edit mode is updated', () => {
    let isEditMode$: Subject<boolean>;
    beforeEach(() => {
      isEditMode$ = new Subject();
      component.updateIsEditMode$ = isEditMode$.asObservable();
    });

    it('(edit mode = true) should enable editable forms', done => {
      isEditMode$.subscribe(() => {
        expect(component.isEditMode).toBeFalse();
        done();
      });
      isEditMode$.next(true);
    });
    it('(edit mode = false) should disable editable forms', done => {
      isEditMode$.subscribe(() => {
        expect(component.isEditMode).toBeTrue();
        done();
      });
      isEditMode$.next(false);
    });
  });
});
