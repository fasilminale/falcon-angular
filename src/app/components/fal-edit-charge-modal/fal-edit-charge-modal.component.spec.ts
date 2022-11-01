import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FalEditChargeModalComponent, EditChargeModalInput, VariableFormControl} from './fal-edit-charge-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
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
  let MOCK_MODAL_INPUT: EditChargeModalInput;

  /* BEGIN TESTS */

  beforeEach(async () => {
    // reset injected test data between each test
    afterClosed$ = new Subject();
    MOCK_DIALOG = {
      close: () => {
      },
      afterClosed: () => afterClosed$.asObservable(),
    };
    MOCK_MODAL_INPUT = {};
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [FalEditChargeModalComponent],
      providers: [
        {provide: MatDialogRef, useValue: MOCK_DIALOG},
        {provide: MAT_DIALOG_DATA, useValue: MOCK_MODAL_INPUT}
      ]
    }).compileComponents();
  });

  /**
   * Used to trigger the constructor for the modal after
   * the MOCK_MODAL_INPUT values have been set by the test
   * scenarios.
   */
  function createComponent(): void {
    fixture = TestBed.createComponent(FalEditChargeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('#Set File Name for Display', () => {
    beforeEach(() => {
      // set mock data for edit scenario
      MOCK_MODAL_INPUT.costLineItem = new FormControl({
        accessorialCode: 'TEST',
        charge: 'TEST CHARGE NAME',
        variables: TEST_CALC_DETAIL.variables
      });
      MOCK_MODAL_INPUT.costBreakdownOptions = undefined;
      createComponent();
    });

    it('should parse uuid off of name', () => {
      MOCK_MODAL_INPUT.costLineItem?.setValue({attachment: {fileName: '07fefbca-8659-44c1-a9f2-32b90974c3ed~test2.pdf'}});
      const fileName = component.parseAttachmentFileName(MOCK_MODAL_INPUT);
      expect(fileName).toEqual('test2.pdf');
    });

    it('should return name if no uuid', () => {
      MOCK_MODAL_INPUT.costLineItem?.setValue({attachment: {fileName: 'test3.pdf'}});
      const fileName = component.parseAttachmentFileName(MOCK_MODAL_INPUT);
      expect(fileName).toEqual('test3.pdf');
    });

    it('should return empty if not name passed', () => {
      const fileName = component.parseAttachmentFileName(MOCK_MODAL_INPUT);
      expect(fileName).toEqual('');
    });
  });


  describe('#EditCharge', () => {
    beforeEach(() => {
      // set mock data for edit scenario
      MOCK_MODAL_INPUT.costLineItem = new FormControl({
        accessorialCode: 'TEST',
        charge: 'TEST CHARGE NAME',
        variables: TEST_CALC_DETAIL.variables
      });
      MOCK_MODAL_INPUT.costBreakdownOptions = undefined;
      createComponent();
    });
    it('should have default edit title', () => {
      expect(component.title).toEqual('Update Charge Details');
    });
    it('should have default edit html', () => {
      expect(component.innerHtmlMessage).toEqual('');
    });
    it('should have default edit confirmation style', () => {
      expect(component.confirmButtonStyle).toEqual('primary');
    });
    it('should have default edit confirmation text', () => {
      expect(component.confirmButtonText).toEqual('Accept Charge Update');
    });
    it('should have default edit cancel text', () => {
      expect(component.cancelButtonText).toEqual('Close');
    });
    it('should NOT have cost breakdown options', () => {
      expect(component.costBreakdownOptions).toEqual([]);
    });
    it('should create variable form using quantity', () => {
      const vfc = component.createFormControlForVariable({
        variable: TEST_VARIABLE_NAME,
        quantity: 10,
      });
      expect(vfc.value).toEqual(10);
    });
    it('should confirm edit values', () => {
      spyOn(MOCK_DIALOG, 'close').and.callThrough();
      component.onConfirmButtonClick();
      expect(MOCK_DIALOG.close).toHaveBeenCalledOnceWith({
        uid: 'TEST',
        charge: 'TEST CHARGE NAME',
        variables: TEST_CALC_DETAIL.variables,
        file: ''
      });
    });
  });

  describe('#AddCharge', () => {
    beforeEach(() => {
      // set mock data for add scenario
      createComponent();
    });
    it('should have default add title', () => {
      expect(component.title).toEqual('Add New Charge');
    });
    it('should have default add html', () => {
      expect(component.innerHtmlMessage).toEqual('');
    });
    it('should have default add confirmation style', () => {
      expect(component.confirmButtonStyle).toEqual('primary');
    });
    it('should have default add confirmation text', () => {
      expect(component.confirmButtonText).toEqual('Add New Charge');
    });
    it('should have default add cancel text', () => {
      expect(component.cancelButtonText).toEqual('Close');
    });
    it('should create variable form IGNORING quantity', () => {
      const vfc = component.createFormControlForVariable({
        variable: TEST_VARIABLE_NAME,
        quantity: 10,
      });
      expect(vfc.value).toEqual('');
    });
  });

  describe('#Misc', () => {
    beforeEach(() => {
      // set mock data for misc scenario
      MOCK_MODAL_INPUT.title = 'TEST TITLE';
      MOCK_MODAL_INPUT.innerHtmlMessage = 'TEST HTML';
      MOCK_MODAL_INPUT.confirmButtonStyle = 'secondary';
      MOCK_MODAL_INPUT.confirmButtonText = 'TEST CONFIRM TEXT';
      MOCK_MODAL_INPUT.cancelButtonText = 'TEST CANCEL TEXT';
      createComponent();
    });
    it('should create', () => {
      expect(component).toBeTruthy();
    });
    it('should give empty variable control names', () => {
      const controlNames = component.variableControlNames;
      expect(controlNames).toEqual([]);
    });
    it('should have test title', () => {
      expect(component.title).toEqual('TEST TITLE');
    });
    it('should have test html', () => {
      expect(component.innerHtmlMessage).toEqual('TEST HTML');
    });
    it('should have secondary confirmation style', () => {
      expect(component.confirmButtonStyle).toEqual('secondary');
    });
    it('should have test confirmation text', () => {
      expect(component.confirmButtonText).toEqual('TEST CONFIRM TEXT');
    });
    it('should have test cancel text', () => {
      expect(component.cancelButtonText).toEqual('TEST CANCEL TEXT');
    });
    it('should unsubscribe from all subscriptions after close', () => {
      spyOn(component.subscriptions, 'unsubscribe').and.callThrough();
      afterClosed$.next(true);
      expect(component.subscriptions.unsubscribe).toHaveBeenCalled();
    });
    it('should give variable control names', () => {
      component.variableControls.addControl(VARIABLE_FORM_CONTROL.displayName, VARIABLE_FORM_CONTROL);
      const controlNames = component.variableControlNames;
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
    it('should do nothing when null charge is selected', () => {
      component.onChargeSelect(null as any);
      // this test passes as long as there are no errors
    });
    it('should handle selecting OTHER charge type', () => {
      component.onChargeSelect({
        name: 'OTHER', accessorialCode: ''
      });
      expect(component.commentControl.enabled).toBeTrue();
      expect(component.commentControl.validator).toBeTruthy();
    });
    it('should NOT be able to read disabled comment', () => {
      component.commentControl.setValue('TEST COMMENT');
      component.commentControl.disable();
      expect(component.commentValue).toBeUndefined();
    });
    it('should be able to read enabled comment', () => {
      component.commentControl.setValue('TEST COMMENT');
      component.commentControl.enable();
      expect(component.commentValue).toEqual('TEST COMMENT');
    });
  });
});
