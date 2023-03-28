import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import { environment } from 'src/environments/environment';
import { WebServices } from './web-services';
import { UserInfoModel } from '../models/user-info/user-info-model';
import {map, share} from 'rxjs/operators';
import {PaginationModel} from '../models/PaginationModel';
import {UntypedFormBuilder, FormGroup, Validators} from '@angular/forms';
import {InvoiceLockModel} from '../models/invoice/invoice-lock-model';
import {InvoiceService} from './invoice-service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceLockService {
  private invoiceLockCache: InvoiceLockModel | null;

  constructor(private http: HttpClient, private web: WebServices, private fb: UntypedFormBuilder) {
    this.invoiceLockCache = null;
  }

  public getInvoiceLock(): InvoiceLockModel | null {
    return this.invoiceLockCache;
  }

  public retrieveInvoiceLock(falconInvoiceNumber: string): Observable<any> {
    if (this.invoiceLockCache !== null) {
      return of(this.invoiceLockCache);
    }
    return this.web.httpGet<HttpClient>(`${environment.baseServiceUrl}/v1/invoice/lock/${falconInvoiceNumber}`).pipe(
      map(data => this.invoiceLock = data),
      share()
    );
  }

  public releaseInvoiceLock(): void {
    if (this.invoiceLockCache !== null) {
      this.web.httpPost<HttpClient>(`${environment.baseServiceUrl}/v1/invoice/lock/${this.invoiceLockCache.falconInvoiceNumber}/delete`)
        .subscribe(() => {
          this.invoiceLockCache = null;
        });
    }
  }

  public createInvoiceLock(falconInvoiceNumber: string): void {
    if (this.invoiceLockCache === null) {
      this.web.httpPost<HttpClient>(`${environment.baseServiceUrl}/v1/invoice/lock/${falconInvoiceNumber}/create`).subscribe(data => {
        this.invoiceLockCache = new InvoiceLockModel(data);
      });
    }
  }

  set invoiceLock(data: InvoiceLockModel | null) {
    this.invoiceLockCache = null;
    if (data !== null) {
      this.invoiceLockCache = new InvoiceLockModel(data);
    }
  }
}
