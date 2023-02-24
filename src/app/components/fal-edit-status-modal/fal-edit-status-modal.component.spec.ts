import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EditStatusModalInput, FalEditStatusModalComponent} from './fal-edit-status-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';
import {of, Subject} from 'rxjs';
import {InvoiceService} from '../../services/invoice-service';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';


describe('FalEditStatusModalComponent', () => {

  let MOCK_DIALOG: any;
  let afterClosed$: Subject<any>;
  let MOCK_MODAL_INPUT: EditStatusModalInput;
  let fixture: ComponentFixture<FalEditStatusModalComponent>;
  let component: FalEditStatusModalComponent;
  let invoiceService: InvoiceService;

  const testInvoice: InvoiceDataModel = new InvoiceDataModel();


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

    invoiceService = TestBed.inject(InvoiceService);
    testInvoice.status = {key: 'APPROVED', label: 'Approved'},
    spyOn(invoiceService, 'getInvoice').and.returnValue(of(testInvoice));
    let allowedInvoices = [{"label":"Error","key":"ERROR"},{"label":"Deleted","key":"DELETED"}];
    //const allowedInvoices = new Subject<any>();
    spyOn(invoiceService, 'getAllowedStatuses').and.returnValue(of(allowedInvoices));


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
      createComponent();
    });

    it('should have current status', () => {
      expect(component.currentStatus).toEqual('Approved');
    });

    it('should have allowed statuses', () => {
      expect(component.allowStatuses.length).toEqual(2);
    });

    it('should have title', () => {
      expect(component.title).toEqual('Edit Status');
    });

    it('should have confirmButtonText', () => {
      expect(component.confirmButtonText).toEqual('Update Status');
    });

    it('should have cancelButtonText', () => {
      expect(component.cancelButtonText).toEqual('Cancel');
    });

    it('should have confirmButtonStyle', () => {
      expect(component.confirmButtonStyle).toEqual('primary');
    });

  });

  describe('#onConfirmButtonClick', () => {
    beforeEach(() => {
      spyOn(invoiceService, 'updateInvoiceStatus').and.returnValue(of(testInvoice));
      createComponent();
    });

    it('should close modal', () => {
      spyOn(MOCK_DIALOG, 'close').and.callThrough();
      component.onConfirmButtonClick();
      expect(MOCK_DIALOG.close).toHaveBeenCalledTimes(1);
      expect(invoiceService.updateInvoiceStatus).toHaveBeenCalledTimes(1)
    });

  });









});
