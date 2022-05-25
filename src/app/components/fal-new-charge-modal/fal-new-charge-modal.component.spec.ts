import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FalNewChargeModalComponent} from './fal-new-charge-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SubjectValue} from '@elm/elm-styleguide-ui';
import {CalcDetail} from '../../models/rate-engine/rate-engine-request';

describe('FalCommentModalComponent', () => {
  const otherCharge: CalcDetail = {accessorialCode: 'OTHER', name: 'OTHER'};
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

  let component: FalNewChargeModalComponent;
  let fixture: ComponentFixture<FalNewChargeModalComponent>;
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
      declarations: [FalNewChargeModalComponent],
      providers: [
        {provide: MatDialogRef, useValue: MOCK_DIALOG},
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(FalNewChargeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call on charge select when charge value changes', done => {
    spyOn(component, 'onChargeSelect').and.stub();
    component.chargeControl.valueChanges.subscribe(() => {
      expect(component.onChargeSelect).toHaveBeenCalledOnceWith(TEST_CALC_DETAIL);
      done();
    });
    component.chargeControl.setValue(TEST_CALC_DETAIL);
  });

  it('should give empty variable control names', () => {
    const controlNames = component.getVariableControlNames();
    expect(controlNames).toEqual([]);
  });

  it('should give variable control names', () => {
    component.chargeControl.setValue(TEST_CALC_DETAIL);
    const controlNames = component.getVariableControlNames();
    expect(controlNames).toEqual([TEST_VARIABLE_NAME]);
  });

  it('should clear all variable controls', () => {
    spyOn(component.variableControls, 'removeControl').and.callThrough();
    component.chargeControl.setValue(TEST_CALC_DETAIL);
    component.clearAllVariableControls();
    expect(component.variableControls.removeControl).toHaveBeenCalledOnceWith(TEST_VARIABLE_NAME);
  });

  it('should close the dialog WITHOUT a response when a charge type is NOT selected', () => {
    spyOn(MOCK_DIALOG, 'close');
    component.confirm();
    expect(MOCK_DIALOG.close).toHaveBeenCalledOnceWith(undefined);
  });

  it('should close the dialog with a response when a charge type is selected', () => {
    component.chargeControl.setValue(TEST_CALC_DETAIL);
    spyOn(MOCK_DIALOG, 'close');
    component.confirm();
    expect(MOCK_DIALOG.close).toHaveBeenCalledTimes(1);
  });

  it('should close dialog with comment', () => {
    component.chargeControl.setValue(otherCharge);
    spyOn(MOCK_DIALOG, 'close');
    component.confirm();
    expect(MOCK_DIALOG.close).toHaveBeenCalledTimes(1);
  });

  it('should enable comment control for OTHER charge', () => {
    component.onChargeSelect(otherCharge);
    expect(component.commentControl.enabled).toBeTrue();
  });

});
