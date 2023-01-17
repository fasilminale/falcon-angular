import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import { environment } from 'src/environments/environment';
import { WebServices } from './web-services';
import { UserInfoModel } from '../models/user-info/user-info-model';
import {map, share} from 'rxjs/operators';
import {PaginationModel} from '../models/PaginationModel';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private observableCache: Observable<UserInfoModel> | undefined;
  private userInfoCache: UserInfoModel | undefined;
  private paginationModel: PaginationModel | undefined;
  private controlGroup: FormGroup | undefined;

  constructor(private http: HttpClient, private web: WebServices, private fb: FormBuilder) {

  }

  get searchState(): PaginationModel {
    return this.paginationModel ?? new PaginationModel();
  }

  set searchState(lastSearch: PaginationModel) {
    this.paginationModel = lastSearch;
  }

  get controlGroupState(): FormGroup {
    return this.controlGroup ?? this.fb.group({
        control: [null, [Validators.pattern('^[a-zA-Z0-9_, -]*$'), Validators.required]]
      }, {updateOn: 'submit'}
    );
  }

  set controlGroupState(formGroup: FormGroup) {
    this.controlGroup = formGroup;
  }

  private userInfoUrl = `${environment.baseServiceUrl}/v1/user/info`;

  public getUserInfo(): Observable<UserInfoModel> {
    if (this.userInfoCache) {
      return of(this.userInfoCache);
    } else if (this.observableCache) {
      return this.observableCache;
    } else {
      this.observableCache = this.callUserInfo();
    }
    return this.observableCache;
  }

  private callUserInfo(): Observable<UserInfoModel> {
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
