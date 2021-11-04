import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WebServices } from './web-services';
import { UserInfoModel } from '../models/user-info/user-info-model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private web: WebServices) {

  }

  private userInfoUrl = `${environment.baseServiceUrl}/v1/user/info`;

  public getUserInfo(): Observable<any> {
    return this.web.httpGet<UserInfoModel[]>(this.userInfoUrl);
  }
}
