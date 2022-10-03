import {TestBed} from '@angular/core/testing';
import {OktaAuthService, OKTA_CONFIG} from '@okta/okta-angular';
import {WebServices} from './web-services';
import {AuthService, FakeAuthService, RealAuthService} from './auth-service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {FalHttpInterceptor} from './fal-http-interceptor';
import {of} from 'rxjs';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {NeedSpyError} from '../testing/test-utils';
import {EnvironmentService} from './environment-service/environment-service';

describe('AuthService', () => {
  const TEST_USER_INFO = {
    firstName: 'Rob',
    lastName: 'Hermance-Moore',
    email: ''
  };
  const FAKE_OKTA_CONFIG = {
    issuer: 'https://not-real.okta.com',
    clientId: 'fake-client-id',
    redirectUri: 'http://localhost:4200'
  };

  let authService: AuthService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      providers: [
        {provide: HTTP_INTERCEPTORS, useClass: FalHttpInterceptor, multi: true},
        {provide: OKTA_CONFIG, useValue: FAKE_OKTA_CONFIG}
      ],
    });
  });

  // FAKE AUTH SERVICE TESTS
  describe('> FAKE > ', () => {
    beforeEach(() => {
      authService = new FakeAuthService();
    });
    it('should create', () => {
      expect(authService).toBeTruthy();
    });
    it('should throw error on isAuthenticated', () => {
      expect(() => authService.isAuthenticated())
        .toThrow(new NeedSpyError('AuthService', 'isAuthenticated'));
    });
    it('should throw error on getUserInfo', () => {
      expect(() => authService.getUserInfo())
        .toThrow(new NeedSpyError('AuthService', 'getUserInfo'));
    });
  });

  // REAL AUTH SERVICE TESTS
  describe('> REAL >', () => {
    let oktaAuth: OktaAuthService;
    let webServices: WebServices;
    let environmentService: EnvironmentService;
    beforeEach(() => {
      oktaAuth = TestBed.inject(OktaAuthService);
      webServices = TestBed.inject(WebServices);
      environmentService = TestBed.inject(EnvironmentService);
      authService = new RealAuthService(oktaAuth, webServices, environmentService);
    });
    it('should create', () => {
      expect(authService).toBeTruthy();
    });
    it('openConfirmationModal should confirm', async () => {
      oktaAuth.$authenticationState = of(true);
      spyOn(webServices, 'httpGet').and.returnValue(of(TEST_USER_INFO));
      authService = new RealAuthService(oktaAuth, webServices, environmentService);
      expect(authService.isAuthenticated()).toBeTrue();
    });
  });
});
