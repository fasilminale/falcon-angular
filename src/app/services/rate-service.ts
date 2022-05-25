import {WebServices} from './web-services';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {RateEngineRequest, RateDetailResponse, RatesResponse} from '../models/rate-engine/rate-engine-request';
import {InvoiceDataModel} from '../models/invoice/invoice-model';

@Injectable()
export class RateService {

  constructor(private web: WebServices) {
  }

  public getAccessorialDetails(request: RateEngineRequest): Observable<RateDetailResponse> {
    return this.web.httpPost(`${environment.baseServiceUrl}/v1/rates/getAccessorialDetails`, request);
  }

  public getRates(request: RateEngineRequest): Observable<RatesResponse> {
    return this.web.httpPost(`${environment.baseServiceUrl}/v1/rates/getRates`, request);
  }

  public rateInvoice(invoice: InvoiceDataModel): Observable<InvoiceDataModel> {
    return this.web.httpPost(`${environment.baseServiceUrl}/v1/rates/invoice`, invoice);
  }

}
