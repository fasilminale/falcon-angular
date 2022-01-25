import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
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

});
