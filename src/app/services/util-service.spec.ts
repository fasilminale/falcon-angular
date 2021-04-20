import {TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {UtilService} from './util-service';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {of} from 'rxjs';

describe('UtilService Tests', () => {
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        MatDialogModule
      ],
      providers: [
        UtilService,
        MatSnackBar,
        MatDialog,
        MatSnackBar,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    util = TestBed.inject(UtilService);
    dialog = TestBed.inject(MatDialog);
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
    expect(result).toEqual('confirm');
  });

  it('openConfirmationModal should cancel', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CANCEL_DIALOG);
    const result = await util.openConfirmationModal(testModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toEqual('cancel');
  });

  it('openErrorModal should close', async () => {
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_ERROR_DIALOG);
    const result = await util.openErrorModal(testModalData).toPromise();
    expect(dialog.open).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

})
;
