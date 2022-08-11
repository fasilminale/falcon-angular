import {Injectable} from '@angular/core';
import {
  ConfirmationModalComponent,
  ConfirmationModalData,
  ElmGenericModalData,
  ErrorModalComponent,
  GenericModalComponent,
} from '@elm/elm-styleguide-ui';
import {MatDialog} from '@angular/material/dialog';
import {mergeMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {TemplateInputModalComponent} from '../components/template-input-modal/template-input-modal.component';
import {Milestone} from '../models/milestone/milestone-model';
import {FalCommentModalComponent} from '../components/fal-comment-modal/fal-comment-modal.component';
import {
  EditChargeModalInput,
  EditChargeModalOutput,
  FalEditChargeModalComponent, NewChargeModalOutput
} from '../components/fal-edit-charge-modal/fal-edit-charge-modal.component';
import {
  FalAdjustWeightModalComponent, WeightAdjustmentModalInput,
  WeightAdjustmentModalOutput
} from '../components/fal-adjust-weight-modal/fal-adjust-weight-modal.component';

@Injectable()
export class UtilService {

  constructor(private dialog: MatDialog) {
  }

  public toNumber(value: any): number {
    if (isNaN(value)) {
      const stringValue = value as string;
      return Number(stringValue.split(',').join(''));
    } else {
      return Number(value);
    }
  }

  public getCommentLabelPrefix(milestone: Milestone): string {
    const type = milestone?.type;
    if (type?.key && type.key === 'SUBMITTED') {
      return 'Creator';
    }
    if (type?.key && type.key === 'REJECTED') {
      return 'Rejection';
    }
    return 'General';
  }

  public openConfirmationModal(data: ConfirmationModalData): Observable<boolean> {
    return this.dialog.open(
      ConfirmationModalComponent,
      {autoFocus: false, data}
    )
      .afterClosed()
      .pipe(mergeMap<any, Observable<boolean>>(
        result => result
          ? of(true)
          : of(false)
      ));
  }

  public openCommentModal(data: CommentModalData): Observable<CommentModel> {
    return this.dialog.open(FalCommentModalComponent, {autoFocus: false, data})
      .afterClosed()
      .pipe(mergeMap<any, Observable<CommentModel>>(result => of(result)));
  }

  public openNewChargeModal(data: EditChargeModalInput): Observable<NewChargeModalOutput> {
    return this.dialog.open(FalEditChargeModalComponent, {autoFocus: false, data})
      .afterClosed()
      .pipe(mergeMap<any, Observable<NewChargeModalOutput>>(result => of(result)));
  }

  public openEditChargeModal(data: EditChargeModalInput): Observable<EditChargeModalOutput> {
    return this.dialog.open(FalEditChargeModalComponent, {autoFocus: false, data})
      .afterClosed()
      .pipe(mergeMap<any, Observable<EditChargeModalOutput>>(result => of(result)));
  }

  public openWeightAdjustmentModal(data: WeightAdjustmentModalInput): Observable<WeightAdjustmentModalOutput> {
    return this.dialog.open(FalAdjustWeightModalComponent, {minWidth: '1000px', autoFocus: false, data})
      .afterClosed()
      .pipe(mergeMap<any, Observable<WeightAdjustmentModalOutput>>(result => of(result)));
  }

  public openTemplateInputModal(isPaymentOverrideSelected?: boolean): Observable<Template> {
    return this.dialog.open(
      TemplateInputModalComponent,
      {
        autoFocus: false,
        data: {isPaymentOverrideSelected: !!isPaymentOverrideSelected}
      }
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

  public openGenericModal(data: ElmGenericModalData): Observable<any> {
    return this.dialog.open(
      GenericModalComponent,
      {autoFocus: false, data})
      .afterClosed();
  }

}

export type CommentModalData = ConfirmationModalData & {
  commentSectionFieldName: string;
  requireField: boolean;
};

export type CommentModel = {
  comment: string;
};

export type ErrorModalData = {
  title: string,
  innerHtmlMessage: string
};

type Template = {
  name: string;
  description: string;
};


