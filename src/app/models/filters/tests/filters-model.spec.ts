import {TestBed} from '@angular/core/testing';
import {AppModule} from '../../../app.module';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FiltersModel} from '../filters-model';
import {AbstractControl, FormArray, FormControl} from '@angular/forms';

let testingFiltersModel: FiltersModel;

describe('Models: Filter |', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
    testingFiltersModel = new FiltersModel();
  });

  it('should format empty for search', () => {
    testingFiltersModel.form.removeControl('invoiceStatuses');
    testingFiltersModel.form.removeControl('originCity');
    testingFiltersModel.form.removeControl('destinationCity');
    testingFiltersModel.form.removeControl('scac');
    testingFiltersModel.form.removeControl('shippingPoints');
    testingFiltersModel.form.removeControl('mode');
    testingFiltersModel.form.removeControl('filterBySpotQuote');
    const result = testingFiltersModel.formatForSearch();
    expect(result).toEqual({
      invoiceStatuses: undefined,
      originCity: undefined,
      destinationCity: undefined,
      carrierSCAC: [],
      shippingPoints: [],
      mode: [],
      filterBySpotQuote: undefined
    });
  });

  it('should format arrays for search', () => {
    testingFiltersModel.form.removeControl('invoiceStatuses');
    testingFiltersModel.form.removeControl('originCity');
    testingFiltersModel.form.removeControl('destinationCity');
    testingFiltersModel.form.get('scac')?.setValue(['ODFL']);
    testingFiltersModel.form.get('shippingPoints')?.setValue('D46');
    testingFiltersModel.form.get('mode')?.setValue('LTL');
    testingFiltersModel.form.get('filterBySpotQuote')?.setValue(true);
    const result = testingFiltersModel.formatForSearch();
    expect(result).toEqual({
      invoiceStatuses: undefined,
      originCity: undefined,
      destinationCity: undefined,
      carrierSCAC: ['ODFL'],
      shippingPoints: ['D46'],
      mode: 'LTL',
      filterBySpotQuote: true
    });
  });

  it('non-control should throw error', () => {
    let error = null;
    try {
      testingFiltersModel.cloneAbstractControl({} as AbstractControl);
    } catch (e) {
      error = e;
    }
    expect(error).toBeTruthy();
  });

  it('should disable clone', () => {
    const control = new FormControl('');
    control.disable();
    const clone = testingFiltersModel.cloneAbstractControl(control);
    expect(clone.disabled).toBeTrue();
  });

  describe('onCheckChanged', () => {
    it('should add value to array when checked', () => {
      testingFiltersModel.onCheckChange('invoiceStatuses', {target: {checked: true, value: 'test'}});
      expect(testingFiltersModel.form.controls.invoiceStatuses.value).toEqual(['test']);
    });

    it('should remove value to array when checked', () => {
      const invoiceStatuses = testingFiltersModel.form.controls.invoiceStatuses as FormArray;
      invoiceStatuses.push(new FormControl('test a'));
      invoiceStatuses.push(new FormControl('test b'));
      expect(testingFiltersModel.form.get('invoiceStatuses')?.value).toEqual(['test a', 'test b']);
      testingFiltersModel.onCheckChange('invoiceStatuses', {target: {checked: false, value: 'test b'}});
      expect(testingFiltersModel.form.get('invoiceStatuses')?.value).toEqual(['test a']);
    });
  });

  describe('isChecked', () => {
    it('should return true when checked', () => {
      const invoiceStatuses = testingFiltersModel.form.controls.invoiceStatuses as FormArray;
      invoiceStatuses.push(new FormControl('test a'));
      expect(testingFiltersModel.isChecked('invoiceStatuses', 'test a')).toBeTrue();
    });

    it('should return false when not checked', () => {
      const invoiceStatuses = testingFiltersModel.form.controls.invoiceStatuses as FormArray;
      invoiceStatuses.push(new FormControl('test a'));
      expect(testingFiltersModel.isChecked('invoiceStatuses', 'test b')).toBeFalse();
    });

    it('should return false when given a bad array', () => {
      const invoiceStatuses = testingFiltersModel.form.controls.invoiceStatuses as FormArray;
      invoiceStatuses.push(new FormControl('test a'));
      expect(testingFiltersModel.isChecked('testArray', 'test a')).toBeFalse();
    });
  });

  it('should be able to clear with missing status control', () => {
    testingFiltersModel.form.removeControl('invoiceStatuses');
    testingFiltersModel.resetForm();
    expect(testingFiltersModel.form.get('invoiceStatuses')?.value).toBeFalsy();
  });
});
