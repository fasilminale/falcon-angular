import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()

export class WebServices {

  constructor(private http: HttpClient) {
  }

  public httpPost(url: string, body: any): Observable<any> {
    return this.http.post(url, body);
  }

  public httpGet(url: string): Observable<any> {
    return this.http.get(url);
  }

  public httpPut(url: string, body: any): Observable<any> {
    return this.http.put(url, body);
  }

}
