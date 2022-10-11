import {TestBed} from '@angular/core/testing';
import {UtilService} from './util-service';
import {MatDialog} from '@angular/material/dialog';
import {of, throwError} from 'rxjs';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {FormControl} from '@angular/forms';
import {InvoiceDataModel} from '../models/invoice/invoice-model';
import * as saveAsFunctions from 'file-saver';
import {WebServices} from './web-services';
import {ModalService, ToastService} from '@elm/elm-styleguide-ui';

describe('UtilService', () => {

  let util: UtilService;
  let webService: WebServices;
  let toastService: ToastService;
  let modalService: ModalService;
  let dialog: MatDialog;

  const testModalData = {
    title: 'Test Modal',
    innerHtmlMessage: 'I\'m a test modal',
    primaryButtonText: 'Close',
  };

  const testNewChargeData = {
    title: 'Test New Charge Modal',
    innerHtmlMessage: 'I\'m a test new charge modal',
    costBreakdownOptions: []
  };

  const testEditChargeData = {
    title: 'Test Edit Charge Modal',
    innerHtmlMessage: 'I\'m a test edit charge modal',
    costLineItem: new FormControl()
  };

  const weightAdjustmentTestModalData = {
    currentWeight: 1.0
  };

  const testEditGlLineItemModalData = {
    glLineItem: {},
    glLineItems: {}
  };

  const MOCK_CONFIRM_DIALOG = jasmine.createSpyObj({
    afterClosed: of(true),
    close: null
  });

  const MOCK_CLOSE_DIALOG = jasmine.createSpyObj({
    afterClosed: of(false),
    close: null
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
    dialog = TestBed.inject(MatDialog);
    webService = TestBed.inject(WebServices);
    modalService = TestBed.inject(ModalService);
    toastService = TestBed.inject(ToastService);
    util = new UtilService(dialog, webService, toastService, modalService);
  });

  it('should create', () => {
    expect(util).toBeTruthy();
  });

  it('toNumber should remove comma', () => {
    const actual = util.toNumber('1,000');
    expect(actual).toEqual(1000);
  });

  it('toNumber should remove all commas', () => {
    const actual = util.toNumber('1,000,,,000,,');
    expect(actual).toEqual(1000000);
  });

  it('toNumber should accept number', () => {
    const actual = util.toNumber(1234);
    expect(actual).toEqual(1234);
  });

  it('openConfirmationModal should confirm', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    const result = await util.openConfirmationModal(testModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('openConfirmationModal should cancel', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_DIALOG);
    const result = await util.openConfirmationModal(testModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

  it('openNewChargeModal should confirm', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    const result = await util.openNewChargeModal(testNewChargeData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('openNewChargeModal should cancel', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_DIALOG);
    const result = await util.openNewChargeModal(testNewChargeData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

  it('openEditChargeModal should confirm', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    const result = await util.openEditChargeModal(testEditChargeData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('openEditChargeModal should cancel', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_DIALOG);
    const result = await util.openEditChargeModal(testEditChargeData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

  it('openNewChargeModal should confirm', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    const result = await util.openWeightAdjustmentModal(weightAdjustmentTestModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('openNewChargeModal should cancel', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_DIALOG);
    const result = await util.openWeightAdjustmentModal(weightAdjustmentTestModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

  it('openEditGlLineItemModal should confirm', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    const result = await util.openGlLineItemModal(testEditGlLineItemModalData as any).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('openHistoryLog should confirm', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    util.openHistoryLog(InvoiceDataModel as any);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('openEditGlLineItemModal should cancel', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_DIALOG);
    const result = await util.openGlLineItemModal(testEditGlLineItemModalData as any).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

  it('openGenericModal should close', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_DIALOG);
    const result = await util.openGenericModal(testModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

  it('should download a list of history logs', () => {
    spyOn(webService, 'httpPost').and.returnValue(of('csvData'));
    spyOn(util, 'downloadCsv').and.callThrough();
    util.downloadCsv('filename', 'url', {});
    expect(util.downloadCsv).toHaveBeenCalled();
  });

  it('should display an error if downloading csv fails', () => {
    spyOn(webService, 'httpPost').and.callFake(() => {
      return throwError({error: JSON.stringify({error: { error: 'Test Exception', message: 'Test Exception'}})});
    });
    spyOn(modalService, 'openSystemErrorModal').and.returnValue(of());
    util.downloadCsv('filename', 'url', {});
    expect(modalService.openSystemErrorModal).toHaveBeenCalled();
  });

  it('should call saveAs', () => {
    const saveAsSpy = spyOn(saveAsFunctions, 'saveAs').and.callFake(saveAs);
    util.saveCSVFile('test data', 'test filename');
    expect(saveAsSpy).toHaveBeenCalled();
  });

});
