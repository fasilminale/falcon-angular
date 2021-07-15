import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {OktaCallbackComponent} from './okta-callback.component';
import {OKTA_CONFIG, OktaAuthService} from '@okta/okta-angular';
import {RouterTestingModule} from '@angular/router/testing';
import {Injector} from '@angular/core';
import {Router} from '@angular/router';
import {LoadingService} from '../../services/loading-service';
import {ErrorService} from '../../services/error-service';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('OktaCallbackComponent', () => {
  const REAL_TOKENS = {
    tokens: {
      accessToken: {
        value: 'eyJraWQiOiJWbzV6a2lSMmFaN3NEUDBDODV2Szc5a2x2bm9SNDdqdFdaeWZqaWFyeTBvIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULmFPblpqay1SaFFTS2FvTHliN29EaWtBeEVLSENsSUxzVzhrX1J0RUZGVXMiLCJpc3MiOiJodHRwczovL2lkZW50aXR5LmRldi5jYXJkaW5hbGhlYWx0aC5uZXQiLCJhdWQiOiJodHRwczovL2lkZW50aXR5LmRldi5jYXJkaW5hbGhlYWx0aC5uZXQiLCJzdWIiOiJqb3NlcGgubXV6aW9AY2FyZGluYWxoZWFsdGguY29tIiwiaWF0IjoxNjIwMjM4MjYxLCJleHAiOjE2MjAyNDE4NjEsImNpZCI6IjBvYXhxMWs2OG8wTkQxUzBuMGg3IiwidWlkIjoiMDB1eTcxemVoNEc2cEp4Y0swaDciLCJzY3AiOlsib3BlbmlkIiwiZW1haWwiLCJwcm9maWxlIl19.IxY_3aIFCxglImVnc7pJ1sYPoe9DLmUgZyFtmDW6jr5ntU3JdIEeswjYMZ0Z6AgYy44bSqqFEHaRRzADVIbglMcwQHaP5__jCcVWj_CAg9GNpBDl6TLX__03YAAP4bmd0FF22DaORzKGVTw1T7Nsq2QIMbISSIDwUcPOYh_hxaM3tKMkVE0bFC961PauDFOLVIbxs5V3Q1oqpuFnAcCyR2PqX8VsRs_7zh640aflHjVb7B9Se7Pf_hbJl9OS_Fg7J2UrSC0bJt5uTuOvDmoTEaUCOWn03_0ZtJibbNzrg7pKG5prMqj7w4hJTlhfqMuwHFnkryrMutq6Gnrvn52_sg',
        accessToken: 'eyJraWQiOiJWbzV6a2lSMmFaN3NEUDBDODV2Szc5a2x2bm9SNDdqdFdaeWZqaWFyeTBvIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULmFPblpqay1SaFFTS2FvTHliN29EaWtBeEVLSENsSUxzVzhrX1J0RUZGVXMiLCJpc3MiOiJodHRwczovL2lkZW50aXR5LmRldi5jYXJkaW5hbGhlYWx0aC5uZXQiLCJhdWQiOiJodHRwczovL2lkZW50aXR5LmRldi5jYXJkaW5hbGhlYWx0aC5uZXQiLCJzdWIiOiJqb3NlcGgubXV6aW9AY2FyZGluYWxoZWFsdGguY29tIiwiaWF0IjoxNjIwMjM4MjYxLCJleHAiOjE2MjAyNDE4NjEsImNpZCI6IjBvYXhxMWs2OG8wTkQxUzBuMGg3IiwidWlkIjoiMDB1eTcxemVoNEc2cEp4Y0swaDciLCJzY3AiOlsib3BlbmlkIiwiZW1haWwiLCJwcm9maWxlIl19.IxY_3aIFCxglImVnc7pJ1sYPoe9DLmUgZyFtmDW6jr5ntU3JdIEeswjYMZ0Z6AgYy44bSqqFEHaRRzADVIbglMcwQHaP5__jCcVWj_CAg9GNpBDl6TLX__03YAAP4bmd0FF22DaORzKGVTw1T7Nsq2QIMbISSIDwUcPOYh_hxaM3tKMkVE0bFC961PauDFOLVIbxs5V3Q1oqpuFnAcCyR2PqX8VsRs_7zh640aflHjVb7B9Se7Pf_hbJl9OS_Fg7J2UrSC0bJt5uTuOvDmoTEaUCOWn03_0ZtJibbNzrg7pKG5prMqj7w4hJTlhfqMuwHFnkryrMutq6Gnrvn52_sg',
        claims: {
          ver: 1,
          jti: 'AT.aOnZjk-RhQSKaoLyb7oDikAxEKHClILsW8k_RtEFFUs',
          iss: 'https://identity.dev.cardinalhealth.net',
          aud: 'https://identity.dev.cardinalhealth.net',
          sub: 'joseph.muzio@cardinalhealth.com',
          iat: 1620238261,
          exp: 1620241861,
          cid: '00j-LmDhCXi__QRysgMm_VC1DbM-eZsYDvnYncKVaG',
          uid: '00uy71zeh4G6pJxcK0h7',
          scp: ['openid', 'email', 'profile']
        },
        expiresAt: 1620241861,
        tokenType: 'Bearer',
        scopes: ['openid', 'email', 'profile'],
        authorizeUrl: 'https://identity.dev.cardinalhealth.net/oauth2/v1/authorize',
        userinfoUrl: 'https://identity.dev.cardinalhealth.net/oauth2/v1/userinfo'
      }, idToken: {
        value: 'eyJraWQiOiIzT0ZNeW5mbktPRlNEUzhmbktvWEEwUEphWU1KdGM0WTVPZF80N0k5Q0NZIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHV5NzF6ZWg0RzZwSnhjSzBoNyIsIm5hbWUiOiJKb2VzcGggbXV6aW8iLCJlbWFpbCI6Impvc2VwaC5tdXppb0BjYXJkaW5hbGhlYWx0aC5jb20iLCJ2ZXIiOjEsImlzcyI6Imh0dHBzOi8vaWRlbnRpdHkuZGV2LmNhcmRpbmFsaGVhbHRoLm5ldCIsImF1ZCI6IjBvYXhxMWs2OG8wTkQxUzBuMGg3IiwiaWF0IjoxNjIwMjM4MjYxLCJleHAiOjE2MjAyNDE4NjEsImp0aSI6IklELlpnQWFzQ1B0N2UtM2lOS1FkX3pfQzhVODFyY2paa0lMRzRpc0U4amdRa1EiLCJhbXIiOlsicHdkIl0sImlkcCI6IjAwbzhtdGgzNXhuUElSUzVlMGg3Iiwibm9uY2UiOiJvZ1dkRjhzeW5FMWZxeHRucnlWV09CQk9BZ1Nia082Z2JLNmRrREx1bjFaYlFuRkRYeVZoWjB2dWNyOXRFQzVsIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiam9zZXBoLm11emlvQGNhcmRpbmFsaGVhbHRoLmNvbSIsImF1dGhfdGltZSI6MTYyMDIzODI1OSwiYXRfaGFzaCI6ImVYRVlhMjdjcGpvTXNGZFZRUkhnamcifQ.UOttxIfdgU2Og4P5qqmcQTLQL3yCzBCsZcGCLxKCAG3jR9SqAwboX1uw_OPRjeipWuwme2enF0D-KIkKRHtqkBMb65ROOr-t931BEa3-Y8WaUrA8pbcK88ElzgcBVYaBdMrNkobwqMYPTlAYIa5PVAUCfzjR6cbI2SRW0XEmPvhfwgk1V1ZOlS9MBedaYXO8Nevc_cZ7B7ogEdLTWBQ1JEbFJRoCoO7rttnagAllIYRmaUdfTcrDhvbv9Ljol0UieDrHpihBt1pK4XvDo3CEQpsMKED8bjTILSDBMxWkrAqh5AI2S_6Auhlu3yObOlMuBXLNGrJraTcxOW_5MEQwew',
        idToken: 'eyJraWQiOiIzT0ZNeW5mbktPRlNEUzhmbktvWEEwUEphWU1KdGM0WTVPZF80N0k5Q0NZIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHV5NzF6ZWg0RzZwSnhjSzBoNyIsIm5hbWUiOiJKb2VzcGggbXV6aW8iLCJlbWFpbCI6Impvc2VwaC5tdXppb0BjYXJkaW5hbGhlYWx0aC5jb20iLCJ2ZXIiOjEsImlzcyI6Imh0dHBzOi8vaWRlbnRpdHkuZGV2LmNhcmRpbmFsaGVhbHRoLm5ldCIsImF1ZCI6IjBvYXhxMWs2OG8wTkQxUzBuMGg3IiwiaWF0IjoxNjIwMjM4MjYxLCJleHAiOjE2MjAyNDE4NjEsImp0aSI6IklELlpnQWFzQ1B0N2UtM2lOS1FkX3pfQzhVODFyY2paa0lMRzRpc0U4amdRa1EiLCJhbXIiOlsicHdkIl0sImlkcCI6IjAwbzhtdGgzNXhuUElSUzVlMGg3Iiwibm9uY2UiOiJvZ1dkRjhzeW5FMWZxeHRucnlWV09CQk9BZ1Nia082Z2JLNmRrREx1bjFaYlFuRkRYeVZoWjB2dWNyOXRFQzVsIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiam9zZXBoLm11emlvQGNhcmRpbmFsaGVhbHRoLmNvbSIsImF1dGhfdGltZSI6MTYyMDIzODI1OSwiYXRfaGFzaCI6ImVYRVlhMjdjcGpvTXNGZFZRUkhnamcifQ.UOttxIfdgU2Og4P5qqmcQTLQL3yCzBCsZcGCLxKCAG3jR9SqAwboX1uw_OPRjeipWuwme2enF0D-KIkKRHtqkBMb65ROOr-t931BEa3-Y8WaUrA8pbcK88ElzgcBVYaBdMrNkobwqMYPTlAYIa5PVAUCfzjR6cbI2SRW0XEmPvhfwgk1V1ZOlS9MBedaYXO8Nevc_cZ7B7ogEdLTWBQ1JEbFJRoCoO7rttnagAllIYRmaUdfTcrDhvbv9Ljol0UieDrHpihBt1pK4XvDo3CEQpsMKED8bjTILSDBMxWkrAqh5AI2S_6Auhlu3yObOlMuBXLNGrJraTcxOW_5MEQwew',
        claims: {
          sub: '00uy71zeh4G6pJxcK0h7',
          name: 'Joesph muzio',
          email: 'joseph.muzio@cardinalhealth.com',
          ver: 1,
          iss: 'https://identity.dev.cardinalhealth.net',
          aud: '00j-LmDhCXi__QRysgMm_VC1DbM-eZsYDvnYncKVaG',
          iat: 1620238261,
          exp: 1620241861,
          jti: 'ID.ZgAasCPt7e-3iNKQd_z_C8U81rcjZkILG4isE8jgQkQ',
          amr: ['pwd'],
          idp: '00o8mth35xnPIRS5e0h7',
          nonce: 'ogWdF8synE1fqxtnryVWOBBOAgSbkO6gbK6dkDLun1ZbQnFDXyVhZ0vucr9tEC5l',
          preferred_username: 'joseph.muzio@cardinalhealth.com',
          auth_time: 1620238259,
          at_hash: 'eXEYa27cpjoMsFdVQRHgjg'
        },
        expiresAt: 1620241861,
        scopes: ['openid', 'email', 'profile'],
        authorizeUrl: 'https://identity.dev.cardinalhealth.net/oauth2/v1/authorize',
        issuer: 'https://identity.dev.cardinalhealth.net',
        clientId: '00j-LmDhCXi__QRysgMm_VC1DbM-eZsYDvnYncKVaG'
      }
    }, code: '4Rz5tzM4yzKgZn2S4baX3QbWCRsbWsXSRz5IAXgx8xQ'
  };
  const REAL_OKTA_CONFIG = {
    clientId: '00j-LmDhCXi__QRysgMm_VC1DbM-eZsYDvnYncKVaG',
    issuer: 'https://identity.dev.cardinalhealth.net/',
    redirectUri: window.location.origin + '/login/callback',
    logoutUrl: window.location.origin + '/logged-out',
  };

  let component: OktaCallbackComponent;
  let fixture: ComponentFixture<OktaCallbackComponent>;
  let auth: OktaAuthService;
  let router: Router;
  let errorService: ErrorService;
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      declarations: [OktaCallbackComponent],
      providers: [
        OktaAuthService,
        Injector,
        {provide: OKTA_CONFIG, useValue: REAL_OKTA_CONFIG}
      ]
    }).compileComponents();
    // Get Injectables
    auth = TestBed.inject(OktaAuthService);
    injector = TestBed.inject(Injector);
    router = TestBed.inject(Router);
    errorService = TestBed.inject(ErrorService);
    // Common Spies
    spyOn(errorService, 'addError').and.callThrough();
    // Create Component
    fixture = TestBed.createComponent(OktaCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('redirect handleLoginRedirect called', fakeAsync(() => {
    // @ts-ignore
    spyOn(auth.token, 'parseFromUrl').and.returnValue(Promise.resolve(REAL_TOKENS));
    spyOn(auth.tokenManager, 'setTokens').and.callThrough();
    spyOn(auth, 'isAuthenticated').and.returnValue(Promise.resolve(true));
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.ngOnInit();
    tick(1);
    expect(auth.token.parseFromUrl).toHaveBeenCalled();
    expect(auth.tokenManager.setTokens).toHaveBeenCalled();
    tick(1000);
    expect(auth.isAuthenticated).toHaveBeenCalled();
    tick(1);
    expect(navigateSpy).toHaveBeenCalled();
    expect(errorService.addError).not.toHaveBeenCalled();
  }));

  it('redirect handle error during authentication', fakeAsync(() => {
    // @ts-ignore
    spyOn(auth.token, 'parseFromUrl').and.returnValue(Promise.resolve(REAL_TOKENS));
    spyOn(auth.tokenManager, 'setTokens').and.callThrough();
    spyOn(auth, 'isAuthenticated').and.returnValue(Promise.resolve(false));
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.ngOnInit();
    tick(1);
    expect(auth.tokenManager.setTokens).toHaveBeenCalled();
    tick(1000);
    expect(auth.isAuthenticated).toHaveBeenCalled();
    tick(1);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(errorService.addError).toHaveBeenCalled();
  }));

  it('catch error onInit', fakeAsync(() => {
    spyOn(auth.token, 'parseFromUrl').and.throwError('error');
    component.ngOnInit();
    expect(auth.token.parseFromUrl).toThrowError('error');
  }));

});
