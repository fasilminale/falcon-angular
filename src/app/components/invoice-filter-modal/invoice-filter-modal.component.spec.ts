import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {InvoiceFilterModalComponent} from './invoice-filter-modal.component';
import {AppModule} from '../../app.module';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormArray, FormControl} from '@angular/forms';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {FilterService} from '../../services/filter-service';
import {environment} from '../../../environments/environment';

describe('LoadsFilterModalComponent', () => {
  let component: InvoiceFilterModalComponent;
  let fixture: ComponentFixture<InvoiceFilterModalComponent>;
  let injectedMatDialogRef: MatDialogRef<any>;
  let http: HttpTestingController;

  const dialogMock = {
    close: () => {
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule, HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [FilterService,
        {provide: MatDialogRef, useValue: dialogMock}
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    injectedMatDialogRef = TestBed.inject(MatDialogRef);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(InvoiceFilterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoiceStatuses`).flush([]);
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('resetForm', () => {
    it('should reset the form to the global', () => {
      const invoiceStatuses = component.filterService.invoiceFilterModel.form.get('invoiceStatuses') as FormArray;
      invoiceStatuses.push(new FormControl('CREATED'));
      fixture.detectChanges();
      expect(component.localFilterModel.form.get('invoiceStatuses')?.value).toEqual([]);
      component.resetForm();
      fixture.detectChanges();
      expect(component.localFilterModel.form.get('invoiceStatuses')?.value).toEqual(['CREATED']);
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', fakeAsync(() => {
      const invoiceStatuses = component.localFilterModel.form.get('invoiceStatuses') as FormArray;
      invoiceStatuses.push(new FormControl('TEST'));
      expect(component.localFilterModel.form.get('invoiceStatuses')?.value).toEqual(['TEST']);
      component.clearFilters();
      fixture.detectChanges();
      expect(component.localFilterModel.form.get('invoiceStatuses')?.value).toEqual([]);
    }));
  });

  describe('onSubmit', () => {
    it('should close the modal', () => {
      spyOn(injectedMatDialogRef, 'close').and.callThrough();
      component.onSubmit();
      fixture.detectChanges();
      expect(injectedMatDialogRef.close).toHaveBeenCalled();
    });
  });
});
