import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { GlLineItem } from 'src/app/models/line-item/line-item-model';
import { FalconTestingModule } from 'src/app/testing/falcon-testing.module';

import { InvoiceAllocationComponent } from './invoice-allocation.component';

describe('InvoiceAllocationComponent', () => {
  let component: InvoiceAllocationComponent;
  let fixture: ComponentFixture<InvoiceAllocationComponent>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form control', () => {
    component.formGroup = new FormGroup({});
    expect(component._formGroup.get('invoiceAllocations')).toBeDefined();
    const invoiceAllocation =  component.invoiceAllocationsControls[0];
    expect(invoiceAllocation.get('allocationPercentage')).toBeDefined();
    expect(invoiceAllocation.get('glCostCenter')).toBeDefined();
    expect(invoiceAllocation.get('warehouse')).toBeDefined();
    expect(invoiceAllocation.get('glCompanyCode')).toBeDefined();
    expect(invoiceAllocation.get('glAccount')).toBeDefined();
    expect(invoiceAllocation.get('allocationAmount')).toBeDefined();

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

  describe('when invoice net amount is updated', () => {
    let invoiceNetAmount$: Subject<number>;
    beforeEach(() => {
      invoiceNetAmount$ = new Subject<number>();
      component.updateInvoiceNetAmount$ = invoiceNetAmount$.asObservable();
    });

    it('should update the invoice net amount', done => {
      invoiceNetAmount$.subscribe(() => {
        expect(component.invoiceNetAmount).toBe(10);
        done();
      });
      invoiceNetAmount$.next(10);
    });
  });


  describe('should return total allocations', () => {
    it('should return total allocations count', () => {
      const _formArray = new FormArray([]);
      _formArray.controls.push(new FormGroup({
        allocationAmount: new FormControl(10)
      }));
      component._formGroup.setControl('invoiceAllocations', _formArray);
      expect(component.getTotalAllocationAmount()).toBe(10);
    });
    it('should return total allocations count to 0', () => {
      component._formGroup.setControl('invoiceAllocations', new FormArray([]));
      expect(component.getTotalAllocationAmount()).toBe(0);
    });
  });


  describe('when glLineItems are loaded', () => {
    let loadGlLineItems$: Subject<GlLineItem[]>;
    beforeEach(() => {
      loadGlLineItems$ = new Subject<GlLineItem[]>();
      component.loadGlLineItems$ = loadGlLineItems$.asObservable();
    });

    it('should update the invoice net amount', done => {
      loadGlLineItems$.subscribe(() => {
        const formGroup = component._formArray.controls[0];
        expect(formGroup.get('allocationPercentage')?.value).toBe('10%');
        expect(formGroup.get('warehouse')?.value).toBe('TestWareHouse');
        expect(formGroup.get('glCostCenter')?.value).toBe('TestCostCenter');
        expect(formGroup.get('allocationAmount')?.value).toBe(10);
        expect(formGroup.get('glCompanyCode')?.value).toBe('TestCode');
        expect(formGroup.get('glAccount')?.value).toBe('TestAccount');
        done();
      });
      loadGlLineItems$.next([{
        glAccount: 'TestAccount',
        glCompanyCode: 'TestCode',
        glCostCenter: 'TestCostCenter',
        glAmount: 10,
        allocationPercent: 10,
        shippingPointWarehouse: 'TestWareHouse',
        debitCreditFlag: 'Y'
      }]);
    });
  });

});
