import {inject, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OktaAuthModule, OktaAuthService, OKTA_CONFIG } from '@okta/okta-angular';
import { WebServices } from './web-services';
import { AuthService } from './auth-service';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FalHttpInterceptor } from './fal-http-interceptor';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorService } from './error-service';
import { LoadingService } from './loading-service';

describe('HttpInterceptor Tests', () => {
    let oktaAuth: OktaAuthService;
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
        ErrorService,
        LoadingService,
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
  });


  it('test header Authorization', inject([HttpClient, HttpTestingController], (http: HttpClient, httpMock: HttpTestingController) => {
    http.get('/test').subscribe(
        response => {
            expect(response).toBeTruthy();
        }
    );
    httpMock.expectOne(r => r.headers.has('Authorization'));
  }));
  
  it('test header Authorization error', inject([HttpClient, HttpTestingController], (http: HttpClient, httpMock: HttpTestingController) => {
    http.get('/test').subscribe(
        response => {
            expect(response).toBeTruthy();
        }
    );
    const req = httpMock.expectOne(r => r.headers.has('Authorization'));
    req.error(new ErrorEvent('error'));
  }));
  
});
