import {WebServices} from './web-services';
import {catchError, mergeMap} from 'rxjs/operators';
import {forkJoin, Observable, of} from 'rxjs';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';

@Injectable()
export class ApiService {

  constructor(private web: WebServices) {
  }

  public checkInvoiceIsDuplicate(invoice: any): Observable<boolean> {
    return this.checkInvoiceIsValid(invoice)
      .pipe(
        mergeMap((response: any) =>
          response && invoice.falconInvoiceNumber
            ? of(response.falconInvoiceNumber !== invoice.falconInvoiceNumber)
            : of(true)
        ),
        catchError(() =>
          of(false)
        )
      );
  }

  /**
   * Returns the invoice if it is valid,
   *   a 404 if the invoice is not found,
   *   and an error otherwise.
   */
  public checkInvoiceIsValid(invoice: any): Observable<any> {
    return this.web.httpPost(
      `${environment.baseServiceUrl}/v1/invoice/is-valid`,
      {
        companyCode: invoice.companyCode,
        vendorNumber: invoice.vendorNumber,
        externalInvoiceNumber: invoice.externalInvoiceNumber,
        invoiceDate: invoice.invoiceDate
      }
    );
  }

  /**
   * Calls either updateInvoice(invoice) or createInvoice(invoice) depending.
   */
  public saveInvoice(invoice: any): Observable<any> {
    return invoice.falconInvoiceNumber
      ? this.updateInvoice(invoice)
      : this.createInvoice(invoice);
  }

  public updateInvoice(invoice: any): Observable<any> {
    return this.web.httpPut(
      `${environment.baseServiceUrl}/v1/invoice/${invoice.falconInvoiceNumber}`,
      invoice
    );
  }

  public createInvoice(invoice: any): Observable<any> {
    return this.web.httpPost(`${environment.baseServiceUrl}/v1/invoice`, invoice);
  }

  public saveAllAttachments(invoiceNumber: string, attachments: Array<any>): Observable<Array<any>> {
    if (attachments.length > 0) {
      const attachmentCalls: Array<any> = [];
      const successfulAttachments: Array<any> = [];
      for (const attachment of attachments) {
        const attachmentCall =
          this.saveAttachment(invoiceNumber, attachment)
            .pipe(
              mergeMap(response => {
                if ('ACCEPTED' === response) {
                  successfulAttachments.push(attachment);
                }
                return of(response);
              }),
              catchError(of)
            );
        attachmentCalls.push(attachmentCall);
      }
      return forkJoin(attachmentCalls)
        .pipe(mergeMap(() => of(successfulAttachments)));
    }
    return of([]);
  }

  public saveAttachment(invoiceNumber: string, attachment: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', attachment.file, attachment.file.name);
    formData.append('attachmentType', attachment.type);
    formData.append('fileName', attachment.file.name);
    return this.web.httpPost(
      `${environment.baseServiceUrl}/v1/attachment/${invoiceNumber}`,
      formData
    );
  }

}
