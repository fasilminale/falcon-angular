import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {NewUserLogoutPageComponent} from './new-user-logout-page.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {OktaAuthService, OKTA_CONFIG} from '@okta/okta-angular';
import {Router} from '@angular/router';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('NewUserLogoutPageComponent', () => {
  let component: NewUserLogoutPageComponent;
  let fixture: ComponentFixture<NewUserLogoutPageComponent>;
  let http: HttpTestingController;
  let oktaAuth: OktaAuthService;
  let router: Router;
  const oktaConfig = {
    issuer: 'https://not-real.okta.com',
    clientId: 'fake-client-id',
    redirectUri: 'http://localhost:4200'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewUserLogoutPageComponent],
      imports: [RouterTestingModule, FalconTestingModule],
      providers: [
        {provide: OKTA_CONFIG, useValue: oktaConfig}
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUserLogoutPageComponent);
    console.log('Created component');
    http = TestBed.inject(HttpTestingController);
    oktaAuth = TestBed.inject(OktaAuthService);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('Testing new-user-logout-page component');
    expect(component).toBeTruthy();
  });
  it('logout button pressed', fakeAsync(() => {
    spyOn(router, 'navigate').and.returnValue(new Promise<boolean>(resolve => resolve(false)));
    spyOn(oktaAuth, 'signOut').and.returnValue(new Promise<void>(resolve => resolve()));
    component.logout();
    tick(150);
    expect(router.navigate).toHaveBeenCalledWith(['/logged-out']);
    expect(oktaAuth.signOut).toHaveBeenCalled();
  }));
});
