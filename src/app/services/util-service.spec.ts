import {TestBed} from '@angular/core/testing';
import {UtilService} from './util-service';
import {MatDialog} from '@angular/material/dialog';
import {of} from 'rxjs';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {FormControl} from '@angular/forms';

describe('UtilService', () => {

  let util: UtilService;
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
    glLineItem: new FormControl(),
    invoiceFormGroup: new FormControl()
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
    util = new UtilService(dialog);
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
    const result = await util.openGlLineItemModal(testEditGlLineItemModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('openEditGlLineItemModal should cancel', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_DIALOG);
    const result = await util.openGlLineItemModal(testEditGlLineItemModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

  it('openErrorModal should close', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_DIALOG);
    const result = await util.openErrorModal(testModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

  it('openGenericModal should close', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_DIALOG);
    const result = await util.openGenericModal(testModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

});
