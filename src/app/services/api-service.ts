import {WebServices} from './web-services';
import {catchError, mergeMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {Template} from '../components/invoice-form/invoice-form.component';

@Injectable()
export class ApiService {

  constructor(private web: WebServices) {
  }

  public checkInvoiceIsDuplicate(invoice: any): Observable<boolean> {
    return this.checkInvoiceIsValid(invoice)
      .pipe(
        mergeMap((response: any) => {
            return response && invoice.falconInvoiceNumber
              ? of(response.falconInvoiceNumber !== invoice.falconInvoiceNumber)
              : of(true);
          }
        ),
        catchError(() =>
          of(false)
        )
      );
  }

  public checkTemplateIsDuplicate(templateName: any): Observable<boolean> {
    return this.checkTemplateExists(templateName)
      .pipe(
        mergeMap((response: any) => {
            return response
              ? of(response.name === templateName)
              : of(true);
          }
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

  public checkTemplateExists(templateName: any): Observable<any> {
    return this.web.httpGet(
      `${environment.baseServiceUrl}/v1/template/${templateName}`
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

  public saveAttachments(invoiceNumber: string, attachments: Array<any>): Observable<boolean> {
    const files: Array<File> = [];
    const instructions: Array<any> = [];
    attachments
      .filter(a => a.action !== 'NONE')
      .forEach(a => {
        files.push(a.file);
        instructions.push({
          fileName: a.file.name,
          attachmentType: a.type,
          action: a.action
        });
      });
    if (files.length <= 0 || instructions.length <= 0) {
      return of(true);
    }
    const formData = new FormData();
    files.forEach(f => formData.append('files', f, f.name));
    formData.append('instructionsJson', JSON.stringify(instructions));
    return this.web.httpPost(
      `${environment.baseServiceUrl}/v1/attachment/${invoiceNumber}/batch`,
      formData
    ).pipe(
      mergeMap(result => of(result === 'ACCEPTED')),
      catchError(() => of(false))
    );
  }

  public createTemplate(template: Template): Observable<any> {
    return this.web.httpPost(`${environment.baseServiceUrl}/v1/template`, template);
  }

  public getTemplates(): Observable<any> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/templates`);
  }

  public updateTemplate(templateId: number, template: Template): Observable<any> {
    return this.web.httpPut(`${environment.baseServiceUrl}/v1/template/${templateId}`, template);
  }
}
