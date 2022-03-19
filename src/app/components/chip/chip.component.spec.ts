import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ChipComponent, FilterChip} from './chip.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FiltersModel} from '../../models/filters/filters-model';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {StatusModel} from '../../models/invoice/status-model';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {environment} from '../../../environments/environment';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;
  let http: HttpTestingController;

  const invoiceStatuses: Array<StatusModel> = [
    {label: 'Created', key: 'CREATED'},
    {label: 'Submitted', key: 'SUBMITTED'},
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ChipComponent ],
      imports: [ HttpClientTestingModule, FalconTestingModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ChipComponent);
    http = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    component.filtersModel = new FiltersModel();
    fixture.detectChanges();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoiceStatuses`).flush(invoiceStatuses);
  });

  afterEach(() => {
    http.verify();
  });

  function addFilter(value?: string): void {
    const loadStatusArray = component.filtersModel.form.get('invoiceStatuses') as FormArray;
    loadStatusArray.push(new FormControl(value ? value : 'CREATED'));
    component.filtersModel.form.get('originCity')?.setValue('TestOriginCity')
    component.filtersModel.form.get('destinationCity')?.setValue('TestDestinationCity')
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
      expect(component.chips.length).toBe(3);
    });
  });

  describe('formatArrayChip', () => {
    it('properly format a chip with a single value', () => {
      const loadStatusArray = component.filtersModel.form.get('invoiceStatuses') as FormArray;
      loadStatusArray.push(new FormControl('CREATED'));
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
      const loadStatusArray = component.filtersModel.form.get('invoiceStatuses') as FormArray;
      loadStatusArray.push(new FormControl('CREATED'));
      loadStatusArray.push(new FormControl('SUBMITTED'));
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
      expect(component.chips.length).toBe(3);
      component.removeChip('invoiceStatuses');
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual([]);
      expect(component.chips.length).toBe(2);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });

    it('should properly remove origin city, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('originCity')?.value).toEqual('TestOriginCity');
      expect(component.chips.length).toBe(3);
      component.removeChip('originCity');
      expect(component.filtersModel.form.get('originCity')?.value).toBeNull();
      expect(component.chips.length).toBe(2);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });

    it('should properly remove destination city, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('destinationCity')?.value).toEqual('TestDestinationCity');
      expect(component.chips.length).toBe(3);
      component.removeChip('destinationCity');
      expect(component.filtersModel.form.get('destinationCity')?.value).toBeNull();
      expect(component.chips.length).toBe(2);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });

  });

  describe('clearFilters', () => {
    it('should remove all filters, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual(['CREATED']);
      expect(component.chips.length).toBe(3);
      component.clearFilters();
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual([]);
      expect(component.chips.length).toBe(0);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });
  });
});
