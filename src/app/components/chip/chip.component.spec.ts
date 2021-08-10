import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ChipComponent, FilterChip} from './chip.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FiltersModel} from '../../models/filters/filters-model';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChipComponent ],
      imports: [ HttpClientTestingModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipComponent);
    http = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    component.filtersModel = new FiltersModel();
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  function addFilter(value?: string): void {
    const loadStatusArray = component.filtersModel.form.get('invoiceStatuses') as FormArray;
    loadStatusArray.push(new FormControl(value ? value: 'CREATED'));
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
      expect(component.chips.length).toBe(1);
    });
  });

  describe('formatArrayChip', () => {
    it('properly format a chip with a single value', () => {
      const loadStatusArray = component.filtersModel.form.get('invoiceStatuses') as FormArray;
      loadStatusArray.push(new FormControl('CREATED'));
      const statusChip: FilterChip =
        component.formatArrayChip('Status:&nbsp', loadStatusArray, component.filtersModel.invoiceStatusOptions, 'invoiceStatuses'
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
      const tooltips = component.getTooltips(loadStatusArray, component.filtersModel.invoiceStatusOptions);
      expect(tooltips).toBe('Created<br>Submitted');
    });
  });

  describe('removeChip', () => {
    it('should properly remove a formGroup, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual(['CREATED']);
      expect(component.chips.length).toBe(1);
      component.removeChip('invoiceStatuses');
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual([]);
      expect(component.chips.length).toBe(0);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });
  });

  describe('clearFilters', () => {
    it('should remove all filters, update the chips, and emit', () => {
      addFilter();
      component.updateChipFilters();
      spyOn(component.chipRemovedEvent, 'emit');
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual(['CREATED']);
      expect(component.chips.length).toBe(1);
      component.clearFilters();
      expect(component.filtersModel.form.get('invoiceStatuses')?.value).toEqual([]);
      expect(component.chips.length).toBe(0);
      expect(component.chipRemovedEvent.emit).toHaveBeenCalled();
    });
  });
});
