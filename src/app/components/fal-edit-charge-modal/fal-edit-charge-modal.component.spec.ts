import {ComponentFixture, TestBed, tick} from '@angular/core/testing';
import {FalEditChargeModalComponent, EditChargeModalInput} from './fal-edit-charge-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SubjectValue} from '@elm/elm-styleguide-ui';
import {CalcDetail} from '../../models/rate-engine/rate-engine-request';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {VariableFormControl } from '../fal-new-charge-modal/fal-new-charge-modal.component';

describe('FalEditChargeModalComponent', () => {
  const TEST_VARIABLE_NAME = 'Test Variable';
  const TEST_DISPLAY_NAME = 'Test Display';
  const TEST_CALC_DETAIL: CalcDetail = {
    accessorialCode: 'TEST',
    name: 'Test Calc Detail',
    variables: [
      {
        variable: TEST_VARIABLE_NAME,
        quantity: 0,
        displayName: TEST_DISPLAY_NAME
      }
    ]
  };
  const VARIABLE_FORM_CONTROL = new VariableFormControl(
    TEST_VARIABLE_NAME,
    TEST_DISPLAY_NAME,
    1,
    Validators.required
  );

  let component: FalEditChargeModalComponent;
  let fixture: ComponentFixture<FalEditChargeModalComponent>;
  let afterClosed$: SubjectValue<any>;
  let MOCK_DIALOG: any;

  beforeEach(async () => {
    afterClosed$ = new SubjectValue<any>(false);
    MOCK_DIALOG = {
      close: () => {
      },
      afterClosed: () => afterClosed$.asObservable(),
    };
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [FalEditChargeModalComponent],
      providers: [
        {provide: MatDialogRef, useValue: MOCK_DIALOG},
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(FalEditChargeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should give empty variable control names', () => {
    const controlNames = component.getVariableControlNames();
    expect(controlNames).toEqual([]);
  });

  it('should give variable control names', () => {
    component.variableControls.addControl(VARIABLE_FORM_CONTROL.displayName, VARIABLE_FORM_CONTROL);
    const controlNames = component.getVariableControlNames();
    expect(controlNames).toEqual([TEST_DISPLAY_NAME]);
  });

  it('should close the dialog WITHOUT a response when a charge type is NOT selected', () => {
    spyOn(MOCK_DIALOG, 'close');
    component.confirm();
    expect(MOCK_DIALOG.close).toHaveBeenCalledOnceWith(undefined);
  });

  it('should close the dialog with a response when a charge type is selected', () => {
    component.variableControls.addControl(VARIABLE_FORM_CONTROL.displayName, VARIABLE_FORM_CONTROL);
    component.chargeControl.setValue(TEST_CALC_DETAIL);
    spyOn(MOCK_DIALOG, 'close');
    component.confirm();
    expect(MOCK_DIALOG.close).toHaveBeenCalledTimes(1);
  });

  it('should set variables controls correctly', () => {
    let costLine = new FormControl();
    costLine.patchValue({
      variables: [VARIABLE_FORM_CONTROL],
    });

    let data: EditChargeModalInput = {
      title: 'title',
      innerHtmlMessage: 'innerHtmlMessage',
      confirmButtonStyle: 'dark-primary',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      costLineItem: costLine
    };
    
    component.setVariablesControl(data);
    
    expect(component.variableControls.get(VARIABLE_FORM_CONTROL.displayName) !== null);
  });
});
