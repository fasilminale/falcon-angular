import {TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OktaAuthModule, OktaAuthService, OKTA_CONFIG } from '@okta/okta-angular';
import { WebServices } from './web-services';
import { AuthService } from './auth-service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FalHttpInterceptor } from './fal-http-interceptor';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthService Tests', () => {
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
    
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, OktaAuthModule, RouterTestingModule
      ],
      
      providers: [
        OktaAuthService,
        WebServices,
        AuthService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: FalHttpInterceptor,
            multi: true
        },
        {provide: OKTA_CONFIG, useValue: oktaConfig}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    oktaAuth = TestBed.inject(OktaAuthService);
    webServices = TestBed.inject(WebServices);
    authService = TestBed.inject(AuthService);
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

})
;
