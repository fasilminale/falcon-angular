import {Injectable} from '@angular/core';
import {OktaAuthService} from '@okta/okta-angular';
import {WebServices} from './web-services';
import {environment} from '../../environments/environment';

@Injectable()
export class AuthService {
  isAuthenticated = false;
  userInfo = {
    firstName: 'Rob',
    lastName: 'Hermance-Moore',
    email: ''
  };
  constructor(private oktaAuth: OktaAuthService, private webServices: WebServices) {
    this.oktaAuth.$authenticationState.subscribe((isAuthenticated: boolean) => {
      this.isAuthenticated = isAuthenticated;
      if (this.isAuthenticated) {
        this.webServices.httpGet(`${environment.baseServiceUrl}/v1/user/info`).subscribe((userInfo: any) => {
          this.userInfo = userInfo;
          console.log('userInfo',this.userInfo);
        });
      }
    });
  }
}
