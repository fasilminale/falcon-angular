import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SearchComponent} from './search.component';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        ReactiveFormsModule,
        FormsModule
      ],
      declarations: [SearchComponent],
      providers: [FormBuilder]
    }).compileComponents();
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('submit', () => {
    it( 'Should get the correct error message when required field not provided', () => {
    component.submitted = true;
    document.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(component.controlGroup.controls.control.hasError('required')).toBeTrue();
    expect(component.getErrorMessage()).toEqual(component.requiredMessage);
    });

    it( 'Should get the correct error message when field too short', () => {
      component.controlGroup.controls.control.setValue('949');
      document.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      expect(component.controlGroup.controls.control.hasError('minlength')).toBeTrue();
      expect(component.getErrorMessage()).toEqual(component.minLengthMessage);
    });

    describe('when type invoiceID,', () => {
      it( 'Should error when field contains values other than alpha numeric', () => {
        component.controlGroup.controls.control.setValue('D-560000001');
        document.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();
        expect(component.controlGroup.controls.control.hasError('pattern')).toBeTrue();
        expect(component.getErrorMessage()).toEqual(component.patternMessage);
      });

      it( 'Should not error when field contains only alpha numeric values', () => {
        component.controlGroup.controls.control.setValue('D560000001');
        document.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();
        expect(component.controlGroup.controls.control.hasError('pattern')).toBeFalse();
      });
    });

    describe('when not invoice found,', () => {
      it( 'Should error when no invoice found', () => {
        component.totalResults = 0;
        component.submitted = true;
        component.ngOnChanges();
        expect(component.controlGroup.controls.control.hasError('badID')).toBeTrue();
        expect(component.getErrorMessage()).toEqual(component.invalidIdMessage);
      });

      it( 'Should show no error when invoice found', () => {
        component.totalResults = 10;
        component.submitted = true;
        component.ngOnChanges();
        expect(component.controlGroup.controls.control.hasError('badID')).toBeFalsy();
      });

    });

    describe('Emit event', () => {
      it('should emit an event with the search value', () => {
        const emit = spyOn(component.submitEvent, 'emit');
        component.controlGroup.controls.control.setValue('F0000000001');
        component.controlGroup.markAsDirty();
        fixture.detectChanges();
        component.submit();
        expect(emit).toHaveBeenCalledWith('F0000000001');
      });
    })

  });

  describe('helper text', () => {
    it( 'Should show when first loaded', () => {
      expect(component.showHelperText()).toBeTrue();
    });

    it( 'Should not show when there is an error', () => {
      component.controlGroup.controls.control.setValue('949');
      document.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      expect(component.showHelperText()).toBeFalse();
    });
  });

});
