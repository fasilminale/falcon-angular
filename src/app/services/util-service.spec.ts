import {TestBed} from '@angular/core/testing';
import {UtilService} from './util-service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {of} from 'rxjs';
import {FalconTestingModule} from '../testing/falcon-testing.module';

describe('UtilService', () => {

  let snackbar: MatSnackBar;
  let util: UtilService;
  let dialog: MatDialog;

  const testModalData = {
    title: 'Test Modal',
    innerHtmlMessage: 'I\'m a test modal'
  };

  const MOCK_CONFIRM_DIALOG = jasmine.createSpyObj({
    afterClosed: of(true),
    close: null
  });

  const MOCK_CANCEL_DIALOG = jasmine.createSpyObj({
    afterClosed: of(false),
    close: null
  });

  const MOCK_CLOSE_ERROR_DIALOG = jasmine.createSpyObj({
    afterClosed: of(false),
    close: null
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
    snackbar = TestBed.inject(MatSnackBar);
    dialog = TestBed.inject(MatDialog);
    util = new UtilService(snackbar, dialog);
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
    spyOn(dialog, 'open').and.returnValue(MOCK_CANCEL_DIALOG);
    const result = await util.openConfirmationModal(testModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

  it('openErrorModal should close', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_ERROR_DIALOG);
    const result = await util.openErrorModal(testModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

});
