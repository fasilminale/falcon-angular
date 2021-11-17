import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import { environment } from 'src/environments/environment';
import { WebServices } from './web-services';
import { UserInfoModel } from '../models/user-info/user-info-model';
import {map, share} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private observableCache: Observable<UserInfoModel> | undefined;
  private userInfoCache: UserInfoModel | undefined;

  constructor(private http: HttpClient, private web: WebServices) {

  }

  private userInfoUrl = `${environment.baseServiceUrl}/v1/user/info`;

  public getUserInfo(): Observable<any> {
    if (this.userInfoCache) {
      return of(this.userInfoCache);
    } else if (this.observableCache) {
      return this.observableCache;
    } else {
      this.observableCache = this.callUserInfo();
    }
    return this.observableCache;
  }

  private callUserInfo(): Observable<any> {
    return this.web.httpGet<UserInfoModel[]>(this.userInfoUrl).pipe(
        map(data => this.storeUser(data)),
        share()
      );
  }

  private storeUser(data: UserInfoModel): UserInfoModel {
    this.observableCache = undefined;
    this.userInfoCache = new UserInfoModel(data);
    return data;
  }
}
