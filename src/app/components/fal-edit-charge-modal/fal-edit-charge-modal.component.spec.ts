import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FalEditChargeModalComponent, EditChargeModalInput, VariableFormControl} from './fal-edit-charge-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CalcDetail} from '../../models/rate-engine/rate-engine-request';
import {FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';

describe('FalEditChargeModalComponent', () => {

  /* TEST CONSTANTS */

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

  /* TEST FIELDS */

  let component: FalEditChargeModalComponent;
  let fixture: ComponentFixture<FalEditChargeModalComponent>;
  let afterClosed$: Subject<any>;
  let MOCK_DIALOG: any;

  /* BEGIN TESTS */

  beforeEach(async () => {
    afterClosed$ = new Subject();
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
    const controlNames = component.variableControlNames();
    expect(controlNames).toEqual([]);
  });

  it('should give variable control names', () => {
    component.variableControls.addControl(VARIABLE_FORM_CONTROL.displayName, VARIABLE_FORM_CONTROL);
    const controlNames = component.variableControlNames();
    expect(controlNames).toEqual([TEST_DISPLAY_NAME]);
  });

  it('should close the dialog WITHOUT a response when a charge type is NOT selected', () => {
    spyOn(MOCK_DIALOG, 'close');
    component.onConfirmButtonClick();
    expect(MOCK_DIALOG.close).toHaveBeenCalledOnceWith(undefined);
  });

  it('should close the dialog with a response when a charge type is selected', () => {
    component.variableControls.addControl(VARIABLE_FORM_CONTROL.displayName, VARIABLE_FORM_CONTROL);
    component.chargeControl.setValue(TEST_CALC_DETAIL);
    spyOn(MOCK_DIALOG, 'close');
    component.onConfirmButtonClick();
    expect(MOCK_DIALOG.close).toHaveBeenCalledTimes(1);
  });

  it('should set variables controls correctly', () => {
    const costLine = new FormControl();
    costLine.patchValue({
      variables: [VARIABLE_FORM_CONTROL],
    });
    const data: EditChargeModalInput = {
      title: 'title',
      innerHtmlMessage: 'innerHtmlMessage',
      confirmButtonStyle: 'dark-primary',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      costLineItem: costLine
    };
    const testComponent = new FalEditChargeModalComponent(data, MOCK_DIALOG);
    expect(testComponent.variableControls.get(VARIABLE_FORM_CONTROL.displayName)).not.toBeNull();
  });
});
