import {WebServices} from './web-services';
import {map, mergeMap, tap} from 'rxjs/operators';
import {Observable, of, Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {Invoice, InvoiceDataModel} from '../models/invoice/invoice-model';
import { FreightOrder } from '../models/invoice/freight-model';
import {EditAutoInvoiceModel} from '../models/invoice/edit-auto-invoice.model';

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

  public getOriginDestinationCities(): Observable<Array<any>> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/originDestinationCities`);
  }

  public getMasterDataScacs(): Observable<Array<any>> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/carriers`);
  }

  public getMasterDataModes(): Observable<Array<any>> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/carrierModeCodes`);
  }

  public getMasterDataShippingPoints(): Observable<Array<any>> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/carrierShippingPoints`);
  }

  public getMasterDataShippingPointWarehouses(): Observable<Array<any>> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/carrierShippingPointWarehouses`);
  }

  public getInvoice(invoiceNumber: string): Observable<InvoiceDataModel> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/invoice/${invoiceNumber}`).pipe(
      map(invoice => (
        {
          ...invoice,
          // @ts-ignore
          costLineItems: invoice.costLineItems?.map((item) => {
            const container = {...item};

            container.persisted = true;

            return container;
          })
        }
      ))
    );
  }

  public updateInvoice(invoice: any): Observable<any> {
    debugger;
    return this.web.httpPut(
      `${environment.baseServiceUrl}/v1/invoice/${invoice.falconInvoiceNumber}`,
      invoice
    );
  }

  public updateInvoiceStatus(falconInvoiceNumber: any, status: any): Observable<any> {
    debugger;
    return this.web.httpPut(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}/status`, status);
  }

  public updateAutoInvoice(body: EditAutoInvoiceModel, falconInvoiceNumber: string): Observable<InvoiceDataModel> {
    return this.web.httpPut<InvoiceDataModel>(
      `${environment.baseServiceUrl}/v1/invoice/auto/${falconInvoiceNumber}`,
      body
    );
  }

  public validateGlLineItem(body: any): Observable<any> {
    return this.web.httpPost(
      `${environment.baseServiceUrl}/v1/invoice/auto/validate`,
      body
    );
  }

  public createInvoice(invoice: any): Observable<any> {
    return this.web.httpPost(`${environment.baseServiceUrl}/v1/invoice`, invoice);
  }

  public deleteInvoice(invoiceNumber: string): Observable<any> {
    return this.web.httpDelete(`${environment.baseServiceUrl}/v1/invoice/${invoiceNumber}`);
  }

  public deleteInvoiceWithReason(invoiceNumber: string, deleteReason: any): Observable<any> {
    return this.web.httpPut(`${environment.baseServiceUrl}/v1/invoice/${invoiceNumber}/delete`, deleteReason);
  }

  public submitForApproval(invoiceNumber: string): Observable<any> {
    return this.web.httpPost(`${environment.baseServiceUrl}/v1/invoice/${invoiceNumber}/submit-for-approval`);
  }

  public extract(invoiceNumber: string): Observable<any> {
    return this.web.httpPut(`${environment.baseServiceUrl}/v1/invoice/${invoiceNumber}/extract`);
  }

  public resolveDispute(invoiceNumber: string, disputeParameters: any): Observable<any> {
    return this.web.httpPut(`${environment.baseServiceUrl}/v1/invoice/${invoiceNumber}/resolveDispute`, disputeParameters);
  }

  public refreshMasterData(invoice: any): Observable<any> {
    return this.web.httpPost(`${environment.baseServiceUrl}/v1/refreshMasterData`, invoice);
  }

  public getFreightOrderDetails(): Observable<FreightOrder[]> {
    return of([{
      freightOrderNumber: '123456789',
      tmsLoadId: '000000000012',
      warehouse: 'Test warehouse',
      sequence: '0290',
      stopId: '403567',
      destination: 'Customer 2125 Chestnut St San Fransisco, CA',
      grossWeight: 0,
      volume: 0,
      pallets: 0,
      isDisable: true
    }]);
  }

}
