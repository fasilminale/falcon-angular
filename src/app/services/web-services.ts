import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()

export class WebServices {

  constructor(private http: HttpClient) {
  }

  public httpPost<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  public httpGet<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  public httpPut(url: string, body: any): Observable<any> {
    return this.http.put(url, body);
  }

}
