import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {InvoiceFilterModalComponent} from './invoice-filter-modal.component';
import {AppModule} from '../../app.module';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
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

  const dialogDataMock = {
    originCities: ['New York'],
    destinationCities: ['Chicago']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule, HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [FilterService,
        {provide: MatDialogRef, useValue: dialogMock}, 
        { provide: MAT_DIALOG_DATA, useValue: dialogDataMock}
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
      component.filterService.invoiceFilterModel.form?.get('originCity')?.setValue('TestOriginCity');
      component.filterService.invoiceFilterModel.form?.get('destinationCity')?.setValue('TestDestinationCity');
      expect(component.localFilterModel.form.get('invoiceStatuses')?.value).toEqual([]);
      expect(component.localFilterModel.form.get('originCity')?.value).toBeNull();
      expect(component.localFilterModel.form.get('destinationCity')?.value).toBeNull();
      component.resetForm();
      expect(component.localFilterModel.form.get('invoiceStatuses')?.value).toEqual(['CREATED']);
      expect(component.localFilterModel.form.get('originCity')?.value).toEqual('TestOriginCity');
      expect(component.localFilterModel.form.get('destinationCity')?.value).toEqual('TestDestinationCity');

    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', fakeAsync(() => {
      const invoiceStatuses = component.localFilterModel.form.get('invoiceStatuses') as FormArray;
      invoiceStatuses.push(new FormControl('TEST'));
      component.filterService.invoiceFilterModel.form?.get('originCity')?.setValue('TestOriginCity');
      component.filterService.invoiceFilterModel.form?.get('destinationCity')?.setValue('TestDestinationCity');
      expect(component.localFilterModel.form.get('invoiceStatuses')?.value).toEqual(['TEST']);
      component.clearFilters();
      expect(component.localFilterModel.form.get('invoiceStatuses')?.value).toEqual([]);
      expect(component.localFilterModel.form.get('originCity')?.value).toBeNull();
      expect(component.localFilterModel.form.get('destinationCity')?.value).toBeNull();

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

  describe('should compare with city', () => {
    it('should return true', () => {
      expect(component.compareCitiesWith({value: 'New York'}, 'New York')).toBeTrue();
    });

    it('should return false', () => {
      expect(component.compareCitiesWith({value: 'New York'}, 'Chicago')).toBeFalse();
    });

  });
});
