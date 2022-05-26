import {ComponentFixture, TestBed, tick} from '@angular/core/testing';
import {FalEditChargeModalComponent} from './fal-edit-charge-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SubjectValue} from '@elm/elm-styleguide-ui';
import {CalcDetail} from '../../models/rate-engine/rate-engine-request';
import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';

describe('FalEditChargeModalComponent', () => {
  const TEST_VARIABLE_NAME = 'Test Variable';
  const TEST_CALC_DETAIL: CalcDetail = {
    accessorialCode: 'TEST',
    name: 'Test Calc Detail',
    variables: [
      {
        variable: TEST_VARIABLE_NAME,
        quantity: 0
      }
    ]
  };

  const TEST_VARIABLE: AbstractControl = new FormControl({
    variable: TEST_VARIABLE_NAME,
    quantity: 0
  });

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
    component.variableControls.addControl('Test Variable', TEST_VARIABLE);
    const controlNames = component.getVariableControlNames();
    expect(controlNames).toEqual([TEST_VARIABLE_NAME]);
  });

  it('should close the dialog WITHOUT a response when a charge type is NOT selected', () => {
    spyOn(MOCK_DIALOG, 'close');
    component.confirm();
    expect(MOCK_DIALOG.close).toHaveBeenCalledOnceWith(undefined);
  });

  it('should close the dialog with a response when a charge type is selected', () => {
    component.chargeControl.setValue(TEST_CALC_DETAIL);
    component.variableControls.addControl('Test Variable', TEST_VARIABLE);
    spyOn(MOCK_DIALOG, 'close');
    component.confirm();
    expect(MOCK_DIALOG.close).toHaveBeenCalledTimes(1);
  });
});
