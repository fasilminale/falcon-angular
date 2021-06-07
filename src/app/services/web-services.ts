import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class WebServices {

  constructor(private http: HttpClient) {
  }

  public httpPost<T>(url: string, body?: any): Observable<T> {
    return this.http.post<T>(url, body ?? '');
  }

  public httpGet<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  public httpPut<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  public httpDelete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
