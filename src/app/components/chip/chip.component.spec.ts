import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ChipComponent, FilterChip} from './chip.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FiltersModel} from '../../models/filters/filters-model';
import {UntypedFormArray, UntypedFormControl} from '@angular/forms';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {StatusModel} from '../../models/invoice/status-model';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {environment} from '../../../environments/environment';
import {FilterService} from 'src/app/services/filter-service';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;
  let http: HttpTestingController;
  let filterService: FilterService;

  const invoiceStatuses: Array<StatusModel> = [
    {label: 'Created', key: 'CREATED'},
    {label: 'Submitted', key: 'SUBMITTED'},
  ];

  const scacs: Array<any> = [
    {scac: 'C007', name: 'RENAL FLEET'},
    {scac: 'PYLE', name: 'A DUIE'}
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChipComponent],
      imports: [HttpClientTestingModule, FalconTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
    fixture = TestBed.createComponent(ChipComponent);
    http = TestBed.inject(HttpTestingController);
    filterService = TestBed.inject(FilterService);
    component = fixture.componentInstance;
    component.filtersModel = new FiltersModel();
    fixture.detectChanges();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoiceStatuses`).flush(invoiceStatuses);
    http.expectOne(`${environment.baseServiceUrl}/v1/carriers`).flush(scacs);
  });

  afterEach(() => {
    http.verify();
  });

  function addFilter(value?: string): void {
    const loadStatusArray = component.filtersModel.form.get('invoiceStatuses') as UntypedFormArray;
    loadStatusArray.push(new UntypedFormControl(value ? value : 'CREATED'));
    component.filtersModel.form.get('originCity')?.setValue('TestOriginCity');
    component.filtersModel.form.get('destinationCity')?.setValue('TestDestinationCity');
    component.filtersModel.form.get('scac')?.setValue('ABCD');
    component.filtersModel.form.get('shippingPoints')?.setValue('D36');
    component.filtersModel.form.get('mode')?.setValue(['D36']);
    component.filtersModel.form.get('filterBySpotQuote')?.setValue(true);
    component.filtersModel.form.get('minPickupDateTime')?.setValue('2022-12-09T00:00:48.699+0000');
    component.filtersModel.form.get('maxPickupDateTime')?.setValue('2022-12-09T00:00:48.699+0000');
    component.filtersModel.form.get('minDeliveryDateTime')?.setValue('2022-12-09T00:00:48.699+0000');
    component.filtersModel.form.get('maxDeliveryDateTime')?.setValue('2022-12-09T00:00:48.699+0000');
    component.filtersModel.form.get('minInvoiceDateTime')?.setValue('2022-12-09T00:00:48.699+0000');
    component.filtersModel.form.get('maxInvoiceDateTime')?.setValue('2022-12-09T00:00:48.699+0000');
    component.filtersModel.form.get('minPaidDateTime')?.setValue('2022-12-09T00:00:48.699+0000');
    component.filtersModel.form.get('maxPaidDateTime')?.setValue('2022-12-09T00:00:48.699+0000');
  }

  it('should create', () => {
    console.log('Testing chip component');
    expect(component).toBeTruthy();
  });

  it('should call updateChipFIlter in ngOnChange', () => {
    spyOn(component, 'updateChipFilters').and.callThrough();
    component.ngOnChanges();
    expect(component.updateChipFilters).toHaveBeenCalled();
  });

  describe('updateChipFilters', () => {
    it('should update the chips', () => {
      expect(component.chips.length).toBe(0);
      addFilter();
      addFilter('SUBMITTED');
      component.updateChipFilters();
      fixture.detectChanges();
      expect(component.chips.length).toBe(11);
    });

    it('should ignore empty chip lists', () => {
      setupEmptyChips();
      component.updateChipFilters();
      expect(component.chips.length).toBe(0);
    });

    it('should ignore missing controls', () => {
      component.filtersModel.form.removeControl('invoiceStatuses');
      component.filtersModel.form.removeControl('originCity');
      component.filtersModel.form.removeControl('destinationCity');
      component.filtersModel.form.removeControl('shippingPoints');
      component.filtersModel.form.removeControl('mode');
      component.filtersModel.form.removeControl('scac');
      component.filtersModel.form.removeControl('filterBySpotQuote');
      component.filtersModel.form.removeControl('minPickupDateTime');
      component.filtersModel.form.removeControl('maxPickupDateTime');
      component.filtersModel.form.removeControl('minDeliveryDateTime');
      component.filtersModel.form.removeControl('maxDeliveryDateTime');
      component.updateChipFilters();
      expect(component.chips.length).toBe(0);
    });
  });

  describe('formatArrayChip', () => {
    it('properly format a chip with a single value', () => {
      const loadStatusArray = component.filtersModel.form.get('invoiceStatuses') as UntypedFormArray;
      loadStatusArray.push(new UntypedFormControl('CREATED'));
      const statusChip: FilterChip =
        component.formatArrayChip('Status:&nbsp', loadStatusArray, invoiceStatuses, 'invoiceStatuses'
        );
      expect(statusChip).toEqual(
        {type: 'Status:&nbsp', label: 'Created', group: 'invoiceStatuses'}
      );
    });

  });

  describe('getTooltips', () => {
    it('should properly return tooltips', () => {
      const loadStatusArray = component.filtersModel.form.get('invoiceStatuses') as UntypedFormArray;
      loadStatusArray.push(new UntypedFormControl('CREATED'));
      loadStatusArray.push(new UntypedFormControl('SUBMITTED'));
      const tooltips = component.getTooltips(loadStatusArray, invoiceStatuses);
      expect(tooltips).toBe('Created<br>Submitted');
    });
  });

  describe('removeChip', () => {
    it('should properly remove a formGroup, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual(['CREATED']);
      expect(component.chips.length).toBe(11);
      component.removeChip('invoiceStatuses');
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual([]);
      expect(component.chips.length).toBe(10);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });

    it('should properly remove origin city, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('originCity')?.value).toEqual('TestOriginCity');
      expect(component.chips.length).toBe(11);
      component.removeChip('originCity');
      expect(component.filtersModel.form.get('originCity')?.value).toBeNull();
      expect(component.chips.length).toBe(10);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });

    it('should properly remove destination city, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('destinationCity')?.value).toEqual('TestDestinationCity');
      expect(component.chips.length).toBe(11);
      component.removeChip('destinationCity');
      expect(component.filtersModel.form.get('destinationCity')?.value).toBeNull();
      expect(component.chips.length).toBe(10);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });

    it('should properly remove scac, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('scac')?.value).toEqual('ABCD');
      expect(component.chips.length).toBe(11);
      component.removeChip('scac');
      expect(component.filtersModel.form.get('scac')?.value).toBeNull();
      expect(component.chips.length).toBe(10);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });

    it('should properly remove filterBySpotQuote, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('filterBySpotQuote')?.value).toEqual(true);
      expect(component.chips.length).toBe(11);
      component.removeChip('filterBySpotQuote');
      expect(component.filtersModel.form.get('filterBySpotQuote')?.value).toBeNull();
      expect(component.chips.length).toBe(10);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });

    describe('Date Ranges:', () => {
      testDateRangeChip('Pickup Date:', 'minPickupDateTime', 'maxPickupDateTime');
      testDateRangeChip('Delivery Date:', 'minDeliveryDateTime', 'maxDeliveryDateTime');
      testDateRangeChip('Invoice Date:', 'minInvoiceDateTime', 'maxInvoiceDateTime');
      testDateRangeChip('Paid Date:', 'minPaidDateTime', 'maxPaidDateTime');

      function testDateRangeChip(title: string, minControl: string, maxControl: string) {
        describe(title, () => {
          it(`should properly remove ${minControl} and ${maxControl} update the chips, and emit`, () => {
            addFilter();
            component.updateChipFilters();
            spyOn(component.chipRemovedEvent, 'emit');
            expect(component.filtersModel.form.get(minControl)?.value).toEqual('2022-12-09T00:00:48.699+0000');
            expect(component.filtersModel.form.get(maxControl)?.value).toEqual('2022-12-09T00:00:48.699+0000');
            expect(component.chips.length).toBe(11);
            component.removeChip(minControl);
            expect(component.filtersModel.form.get(minControl)?.value).toBeNull();
            expect(component.filtersModel.form.get(maxControl)?.value).toBeNull();
            expect(component.chips.length).toBe(10);
            expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
          });

          it(`should properly format ${minControl} and null ${maxControl}`, () => {
            setupEmptyChips();
            component.filtersModel.form.get(minControl)?.setValue('2022-12-09T00:00:48.699+0000');
            component.filtersModel.form.get(maxControl)?.setValue(null);
            component.updateChipFilters();
            expect(component.chips.length).toBe(1);
            expect(component.chips[0].label).toEqual('2022-12-09 - No end date');
          });

          it(`should properly format null ${minControl} and ${maxControl}`, () => {
            setupEmptyChips();
            component.filtersModel.form.get(minControl)?.setValue(null);
            component.filtersModel.form.get(maxControl)?.setValue('2022-12-09T00:00:48.699+0000');
            component.updateChipFilters();
            expect(component.chips.length).toBe(1);
            expect(component.chips[0].label).toEqual('No start date - 2022-12-09');
          });

          it(`should properly format ${minControl} and ${maxControl}`, () => {
            setupEmptyChips();
            component.filtersModel.form.get(minControl)?.setValue('2022-12-08T00:00:48.699+0000');
            component.filtersModel.form.get(maxControl)?.setValue('2022-12-09T00:00:48.699+0000');
            component.updateChipFilters();
            expect(component.chips.length).toBe(1);
            expect(component.chips[0].label).toEqual('2022-12-08 - 2022-12-09');
          });
        });
      }
    });

  });

  describe('clearFilters', () => {
    it('should remove all filters, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual(['CREATED']);
      expect(component.chips.length).toBe(11);
      component.clearFilters();
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual([]);
      expect(component.chips.length).toBe(0);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });
  });

  function setupEmptyChips() {
    component.filtersModel.form.get('invoiceStatuses')?.setValue([]);
    component.filtersModel.form.get('originCity')?.setValue([]);
    component.filtersModel.form.get('destinationCity')?.setValue([]);
    component.filtersModel.form.get('shippingPoints')?.setValue([]);
    component.filtersModel.form.get('mode')?.setValue([]);
    component.filtersModel.form.get('scac')?.setValue([]);
    component.filtersModel.form.get('filterBySpotQuote')?.setValue(false);
    component.filtersModel.form.get('minPickupDateTime')?.setValue(null);
    component.filtersModel.form.get('maxPickupDateTime')?.setValue(null);
    component.filtersModel.form.get('minDeliveryDateTime')?.setValue(null);
    component.filtersModel.form.get('maxDeliveryDateTime')?.setValue(null);
  }
});

