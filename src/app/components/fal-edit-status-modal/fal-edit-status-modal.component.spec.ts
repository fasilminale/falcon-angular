import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EditStatusModalInput, FalEditStatusModalComponent} from './fal-edit-status-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';


describe('FalEditStatusModalComponent', () => {

  let MOCK_DIALOG: any;
  let afterClosed$: Subject<any>;
  let MOCK_MODAL_INPUT: EditStatusModalInput;

  let fixture: ComponentFixture<FalEditStatusModalComponent>;
  let component: FalEditStatusModalComponent;


  /* BEGIN TESTS */

  beforeEach(async () => {
    // reset injected test data between each test
    afterClosed$ = new Subject();
    MOCK_DIALOG = {
      close: () => {
      },
      afterClosed: () => afterClosed$.asObservable(),
    };
    MOCK_MODAL_INPUT = {falconInvoiceNumber: "F000001"};
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [FalEditStatusModalComponent],
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
    fixture = TestBed.createComponent(FalEditStatusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('#EditStatus', () => {
    beforeEach(() => {
      // set mock data for add scenario
      createComponent();
    });

    fit('should have current status', () => {
      expect(component.currentStatus).toEqual('Add New Charge  bbb');
    });

  });









});
