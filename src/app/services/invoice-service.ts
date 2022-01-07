import {WebServices} from './web-services';
import {mergeMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {InvoiceDataModel} from '../models/invoice/invoice-model';
import { FreightOrder } from '../models/invoice/freight-model';

@Injectable()
export class InvoiceService {

  constructor(private web: WebServices) {
  }

  public checkInvoiceIsDuplicate(invoice: any): Observable<boolean> {
    return this.checkInvoiceIsValid(invoice)
      .pipe(
        mergeMap((response: any) => {
            if (!response) {
              return of(false);
            } else {
              return invoice.falconInvoiceNumber
                ? of(response.falconInvoiceNumber !== invoice.falconInvoiceNumber)
                : of(true);
            }
          }
        )
      );
  }

  /**
   * Returns the invoice if it is valid,
   *   a 404 if the invoice is not found,
   *   and an error otherwise.
   */
  public checkInvoiceIsValid(invoice: any): Observable<boolean> {
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

  public getInvoice(invoiceNumber: string): Observable<InvoiceDataModel> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/invoice/${invoiceNumber}`);
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

  public submitForApproval(invoiceNumber: string): Observable<any> {
    return this.web.httpPost(`${environment.baseServiceUrl}/v1/invoice/${invoiceNumber}/submit-for-approval`);
  }

  public extract(invoiceNumber: string): Observable<any> {
    return this.web.httpPut(`${environment.baseServiceUrl}/v1/invoice/${invoiceNumber}/extract`);
  }

  public getFreightOrderDetails(): Observable<FreightOrder[]> {
    return of([{
      freightOrderNumber: '123456789',
      tmsLoadId: '000000000012',
      warehouse: 'Test warehouse',
      grossWeight: 0,
      volume: 0,
      pallets: 0,
      isDisable: true
    }]);
  }

}
