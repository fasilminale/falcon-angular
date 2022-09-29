import {Injectable, InjectionToken} from '@angular/core';
import {OktaAuthService} from '@okta/okta-angular';
import {WebServices} from './web-services';
import {environment} from '../../environments/environment';
import {UserInfo} from '@elm/elm-styleguide-ui';
import {NeedSpyError} from '../testing/test-utils';
import {EnvironmentService} from './environment-service/environment-service';

// INTERFACE
export const AUTH_SERVICE = new InjectionToken<AuthService>('AuthService');

export interface AuthService {
  isAuthenticated(): boolean;

  getUserInfo(): UserInfo;
}


// FAKE IMPLEMENTATION
@Injectable()
export class FakeAuthService implements AuthService {
  static PROVIDER = {provide: AUTH_SERVICE, useClass: FakeAuthService};

  isAuthenticated(): boolean {
    throw new NeedSpyError('AuthService', 'isAuthenticated');
  }

  getUserInfo(): UserInfo {
    throw new NeedSpyError('AuthService', 'getUserInfo');
  }
}


// REAL IMPLEMENTATION
export const DEFAULT_USER_INFO = {
  firstName: 'Rob',
  lastName: 'Hermance-Moore',
  email: ''
};

@Injectable()
export class RealAuthService implements AuthService {
  static PROVIDER = {provide: AUTH_SERVICE, useClass: RealAuthService};

  private _isAuthenticated = false;
  private _userInfo = DEFAULT_USER_INFO;

  constructor(private oktaAuth: OktaAuthService,
              private webServices: WebServices,
              private environmentService: EnvironmentService) {
    this.init();
  }

  private init(): void {
    this.oktaAuth.$authenticationState
      .subscribe((isAuthenticated: boolean) => {
        this._isAuthenticated = isAuthenticated;
        if (this._isAuthenticated) {
          this.webServices.httpGet(`${environment.baseServiceUrl}/v1/user/info`)
            .subscribe((userInfo: any) => {
              this._userInfo = userInfo;
            });
          this.environmentService.getFeatures();
        }
      });
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  getUserInfo(): UserInfo {
    return this._userInfo;
  }

}
