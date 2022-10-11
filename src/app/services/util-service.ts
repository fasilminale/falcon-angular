import {Injectable} from '@angular/core';
import {
  ConfirmationModalComponent,
  ConfirmationModalData,
  ElmGenericModalData,
  GenericModalComponent, ModalService, ToastService,
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
import {EditGlLineItemModal, FalEditGlModalComponent} from '../components/fal-edit-gl-modal/fal-edit-gl-modal.component';
import {GlLineItem, GlLineItemError} from '../models/line-item/line-item-model';
import {FalHistoryLogModalComponent} from '../components/fal-history-log-modal/fal-history-log-modal.component';
import {InvoiceDataModel} from '../models/invoice/invoice-model';
import {saveAs} from 'file-saver';
import {WebServices} from './web-services';

@Injectable()
export class UtilService {

  constructor(private dialog: MatDialog,
              private webService: WebServices,
              private toastService: ToastService,
              private modalService: ModalService) {
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

  public openGlLineItemModal(data: EditGlLineItemModal): Observable<Array<GlLineItem>> {
    return this.dialog.open(FalEditGlModalComponent, {minWidth: '1000px', autoFocus: false, data})
      .afterClosed()
      .pipe(mergeMap<any, Observable<Array<GlLineItem>>>(result => of(result)));
  }

  public openHistoryLog(data: InvoiceDataModel): void {
    this.dialog.open(FalHistoryLogModalComponent, {minWidth: '80%', autoFocus: false, data});
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

  public openGenericModal(data: ElmGenericModalData): Observable<any> {
    return this.dialog.open(
      GenericModalComponent,
      {autoFocus: false, data})
      .afterClosed();
  }

  public downloadCsv(filename: string, url: string, body: any): void {
    console.log(url);
    this.webService.httpPost(url, body, {responseType: 'text'}).subscribe(
      (data: any) => {
        this.saveCSVFile(data, filename);
        this.toastService.openSuccessToast('<strong>File Generated:</strong> CSV has been successfully downloaded.', 5 * 1000);
      }, () => {
        this.modalService.openSystemErrorModal({
          title: 'Error', innerHtmlMessage:
            `An error has occurred generating the CSV.`
        }).subscribe();
      }
    );
  }

  saveCSVFile(data: any, filename: string): void {
    const blob = new Blob([data], {type: 'application/csv'});
    saveAs(blob, filename);
  }

}

export type CommentModalData = ConfirmationModalData & {
  commentSectionFieldName: string;
  requireField: boolean;
  confirmButtonStyle: string;
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


