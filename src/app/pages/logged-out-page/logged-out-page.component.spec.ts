import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {LoggedOutPageComponent} from './logged-out-page.component';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {WebServices} from '../../services/web-services';
import {OKTA_CONFIG, OktaAuthService} from '@okta/okta-angular';
import {AuthService} from '../../services/auth-service';

describe('LoggedOutPageComponent', () => {
  let component: LoggedOutPageComponent;
  let fixture: ComponentFixture<LoggedOutPageComponent>;
  let http: HttpTestingController;
  let oktaAuth: OktaAuthService;
  let auth: AuthService;
  const oktaConfig = {
    clientId: '00j-LmDhCXi__QRysgMm_VC1DbM-eZsYDvnYncKVaG',
    issuer: 'https://identity.dev.cardinalhealth.net/',
    redirectUri: window.location.origin + '/login/callback',
    logoutUrl: window.location.origin + '/logged-out',
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoggedOutPageComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [WebServices, AuthService, OktaAuthService,
        {provide: OKTA_CONFIG, useValue: oktaConfig}
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggedOutPageComponent);
    http = TestBed.inject(HttpTestingController);
    oktaAuth = TestBed.inject(OktaAuthService);
    auth = TestBed.inject(AuthService);
    auth.isAuthenticated = true;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('login button pressed', () => {
    spyOn(oktaAuth, 'signInWithRedirect').and.returnValue(new Promise((resolve) => {
      resolve();
    }));
    spyOn(component, 'login').and.callThrough();
    component.login();
    expect(component.login).toHaveBeenCalled();
  });
});
