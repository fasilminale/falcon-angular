import {Injectable} from '@angular/core';
import {OktaAuthService} from '@okta/okta-angular';

@Injectable()
export class AuthService {
  isAuthenticated = false;
  constructor(private oktaAuth: OktaAuthService) {
    this.oktaAuth.$authenticationState.subscribe((isAuthenticated: boolean) => {
      this.isAuthenticated = isAuthenticated;
    });
  }
}
