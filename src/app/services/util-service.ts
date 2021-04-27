import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfirmationModalComponent, ErrorModalComponent} from '@elm/elm-styleguide-ui';
import {MatDialog} from '@angular/material/dialog';
import {mergeMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {TemplateInputModalComponent} from '../components/template-input-modal/template-input-modal.component';

@Injectable()
export class UtilService {

  constructor(private snackBar: MatSnackBar,
              private dialog: MatDialog) {
  }

  public toNumber(value: any): number {
    if (isNaN(value)) {
      const stringValue = value as string;
      return Number(stringValue.split(',').join(''));
    } else {
      return Number(value);
    }
  }

  public openSnackBar(message: string): void {
    this.snackBar.open(message, 'close', {duration: 5 * 1000});
  }

  public openConfirmationModal(data: ConfirmationModalData): Observable<ConfirmationResult> {
    return this.dialog.open(
      ConfirmationModalComponent,
      {autoFocus: false, data}
    )
      .afterClosed()
      .pipe(mergeMap<any, Observable<ConfirmationResult>>(
        result => result
          ? of('confirm')
          : of('cancel')
      ));
  }

  public openTemplateInputModal(): Observable<Template> {
    return this.dialog.open(
      TemplateInputModalComponent,
      {autoFocus: false}
    )
      .afterClosed()
      .pipe(mergeMap<any, Observable<Template>>(
        result => of(result)
      ));
  }

  public openErrorModal(data: ErrorModalData): Observable<any> {
    return this.dialog.open(
      ErrorModalComponent,
      {autoFocus: false, data})
      .afterClosed();
  }

}

export type ConfirmationResult = 'confirm' | 'cancel';

export type ConfirmationModalData = {
  title: string,
  innerHtmlMessage: string,
  confirmButtonText?: string,
  cancelButtonText?: string
};

export type ErrorModalData = {
  title: string,
  innerHtmlMessage: string
};

type Template = {
  name: string;
  description: string;
};
