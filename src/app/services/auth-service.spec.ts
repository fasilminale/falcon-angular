import {TestBed} from '@angular/core/testing';
import {OktaAuthService, OKTA_CONFIG} from '@okta/okta-angular';
import {WebServices} from './web-services';
import {AuthService} from './auth-service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {FalHttpInterceptor} from './fal-http-interceptor';
import {of} from 'rxjs';
import {FalconTestingModule} from '../testing/falcon-testing.module';

describe('AuthService', () => {

  let oktaAuth: OktaAuthService;
  let webServices: WebServices;
  let authService: AuthService;

  const userInfo = {
    firstName: 'Rob',
    lastName: 'Hermance-Moore',
    email: ''
  };
  const oktaConfig = {
    issuer: 'https://not-real.okta.com',
    clientId: 'fake-client-id',
    redirectUri: 'http://localhost:4200'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      providers: [
        {provide: HTTP_INTERCEPTORS, useClass: FalHttpInterceptor, multi: true},
        {provide: OKTA_CONFIG, useValue: oktaConfig}
      ],
    });
    oktaAuth = TestBed.inject(OktaAuthService);
    webServices = TestBed.inject(WebServices);
    authService = new AuthService(oktaAuth, webServices);
  });

  it('should create', () => {
    expect(authService).toBeTruthy();
  });

  it('openConfirmationModal should confirm', async () => {
    oktaAuth.$authenticationState = of(true);
    spyOn(webServices, 'httpGet').and.returnValue(of(userInfo));
    authService = new AuthService(oktaAuth, webServices);
    expect(authService.isAuthenticated).toBeTruthy();
  });

});
