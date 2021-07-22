import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {LoggedOutPageComponent} from './logged-out-page.component';
import {HttpTestingController} from '@angular/common/http/testing';
import {OKTA_CONFIG, OktaAuthService} from '@okta/okta-angular';
import {AUTH_SERVICE, AuthService, RealAuthService} from '../../services/auth-service';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('LoggedOutPageComponent', () => {
  const REAL_OKTA_CONFIG = {
    clientId: '00j-LmDhCXi__QRysgMm_VC1DbM-eZsYDvnYncKVaG',
    issuer: 'https://identity.dev.cardinalhealth.net/',
    redirectUri: window.location.origin + '/login/callback',
    logoutUrl: window.location.origin + '/logged-out',
  };

  let component: LoggedOutPageComponent;
  let fixture: ComponentFixture<LoggedOutPageComponent>;
  let http: HttpTestingController;
  let oktaAuth: OktaAuthService;
  let auth: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule,
      ],
      declarations: [LoggedOutPageComponent],
      providers: [
        RealAuthService.PROVIDER,
        OktaAuthService,
        {provide: OKTA_CONFIG, useValue: REAL_OKTA_CONFIG}
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggedOutPageComponent);
    http = TestBed.inject(HttpTestingController);
    oktaAuth = TestBed.inject(OktaAuthService);
    auth = TestBed.inject(AUTH_SERVICE);
    spyOn(auth, 'isAuthenticated').and.returnValue(true);
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
