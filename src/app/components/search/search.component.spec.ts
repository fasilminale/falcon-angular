import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SearchComponent} from './search.component';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {InputsModule} from '@elm/elm-styleguide-ui';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        ReactiveFormsModule,
        FormsModule,
        InputsModule
      ],
      declarations: [SearchComponent],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    component.controlGroup = new FormBuilder().group({
      control: [null, [Validators.pattern('^[a-zA-Z0-9_-]*$'), Validators.required]]
    }, {updateOn: 'submit'});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('submit', () => {
    describe('when type invoiceID,', () => {
      it('Should error when field contains values other than alpha numeric and - and  _', () => {
        component.controlGroup.controls['control'].setValue('D@560000001');
        document.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();
        expect(component.controlGroup.controls['control'].hasError('pattern')).toBeTrue();
        expect(component.getErrorMessage()).toEqual(component.patternMessage);
      });

      it('Should not error when field contains only alpha numeric values', () => {
        component.controlGroup.controls['control'].setValue('D560000001');
        document.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();
        expect(component.controlGroup.controls['control'].hasError('pattern')).toBeFalse();
      });

      it('Should not error when field contains only alpha numeric values and -', () => {
        component.controlGroup.controls['control'].setValue('D-560000001');
        document.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();
        expect(component.controlGroup.controls['control'].hasError('pattern')).toBeFalse();
      });

      it('Should not error when field contains only alpha numeric values and _', () => {
        component.controlGroup.controls['control'].setValue('D_560000001');
        document.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();
        expect(component.controlGroup.controls['control'].hasError('pattern')).toBeFalse();
      });
    });

    describe('when not invoice found,', () => {
      it('Should error when no invoice found', () => {
        component.totalResults = 0;
        component.submitted = true;
        component.ngOnChanges();
        expect(component.controlGroup.controls['control'].hasError('badID')).toBeTrue();
        expect(component.getErrorMessage()).toEqual(component.invalidIdMessage);
      });

      it('Should show no error when invoice found', () => {
        component.totalResults = 10;
        component.submitted = true;
        component.ngOnChanges();
        expect(component.controlGroup.controls['control'].hasError('badID')).toBeFalsy();
      });

    });

    describe('Emit event', () => {
      it('should emit an event with the search value', () => {
        const emit = spyOn(component.submitEvent, 'emit');
        component.controlGroup.controls['control'].setValue(' F0000000001  ');
        component.controlGroup.markAsDirty();
        fixture.detectChanges();
        component.submit();
        expect(emit).toHaveBeenCalledWith('F0000000001' as any);
      });

      it('should still emit when missing control', () => {
        const emit = spyOn(component.submitEvent, 'emit');
        // force control to be null
        component.controlGroup.addControl('control', null as any);
        component.submit();
        expect(emit).toHaveBeenCalledWith(null as any);
      });

      it('should still emit when missing control value', () => {
        const emit = spyOn(component.submitEvent, 'emit');
        component.controlGroup.controls['control'].setValue(null);
        component.controlGroup.markAsDirty();
        fixture.detectChanges();
        component.submit();
        expect(emit).toHaveBeenCalledWith(null as any);
      });
    });


  });

  describe('helper text', () => {
    it('Should show when first loaded', () => {
      expect(component.showHelperText()).toBeTrue();
    });

    it('Should not show when there is an error', () => {
      component.controlGroup.controls['control'].setValue(null);
      component.submitted = true;
      component.showHelperText();
      expect(component.showHelperText()).toBeFalse();
    });
  });

  describe('clear method', () => {

    it('should set submitted to false and clear control', () => {
      component.controlGroup.controls['control'].setValue('qwerty');
      component.submitted = true;
      expect(component.submitted).toBeTrue();
      expect(component.controlGroup.controls['control'].value).toEqual('qwerty');

      component.clear();

      expect(component.submitted).toBeFalse();
      expect(component.controlGroup.controls['control'].value).toEqual('');

    });
  });

  describe('clear method', () => {

    it('should set submitted to false and emit clear search', () => {
      const emit = spyOn(component.clearSearch, 'emit');
      component.clearSearchFilter();
      expect(emit).toHaveBeenCalled();
    });
  });

});
