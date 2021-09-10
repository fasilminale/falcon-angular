import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class WebServices {

  constructor(private http: HttpClient) {
  }

  public httpPost<T>(url: string, body?: any): Observable<T> {
    return this.http.post<T>(url, body ?? '');
  }

  public httpGet<T>(url: string, options?: any): Observable<any> {
    return this.http.get<T>(url, options ?? undefined);
  }

  public httpPut<T>(url: string, body?: any): Observable<T> {
    return this.http.put<T>(url, body ?? '');
  }

  public httpDelete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
