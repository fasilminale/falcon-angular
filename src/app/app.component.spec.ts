import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {AppModule} from './app.module';
import {Router} from '@angular/router';
import {OktaAuthService} from '@okta/okta-angular';
import {ErrorService} from './services/error-service';
import {UtilService} from './services/util-service';
import {of} from 'rxjs';
import {FalconTestingModule} from './testing/falcon-testing.module';
import {UserService} from './services/user-service';
import {UserInfoModel} from './models/user-info/user-info-model';
import {FeedbackCollectorService} from '@elm/elm-styleguide-ui';
import {BuildInfoService} from './services/build-info-service';

describe('AppComponent', () => {


  const writeUser = new UserInfoModel({
    uid: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'FAL_INTERNAL_WRITE',
    permissions: ['falAllowInvoiceWrite']
  });

  const techAdminUser = new UserInfoModel({
    uid: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'FAL_INTERNAL_TECH_ADMIN',
    permissions: ['falRestrictInvoiceWrite']
  });

  const MOCK_FEEDBACK_COLLECTOR_SERVICE = {
    initLoad: () => of(true).toPromise(),
    allScriptsLoaded: true,
  };

  let router: Router;
  let component: AppComponent;
  let oktaService: OktaAuthService;
  let errorService: ErrorService;
  let util: UtilService;
  let userService: UserService;
  let buildInfoService: BuildInfoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        AppModule,
      ],
      providers: [
        {
          provide: FeedbackCollectorService,
          useValue: MOCK_FEEDBACK_COLLECTOR_SERVICE
        }
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
    // Get Injectables
    router = TestBed.inject(Router);
    oktaService = TestBed.inject(OktaAuthService);
    errorService = TestBed.inject(ErrorService);
    util = TestBed.inject(UtilService);
    userService = TestBed.inject(UserService);
    buildInfoService = TestBed.inject(BuildInfoService);
    spyOn(buildInfoService, 'openBuildInfoModal').and.returnValue(of(false));
  });

  describe('tech admin user view', () => {
    beforeEach(() => {
      // Create Component
      const fixture = TestBed.createComponent(AppComponent);
      oktaService.$authenticationState = of(true);
      spyOn(userService, 'getUserInfo').and.returnValue(of(techAdminUser));
      component = fixture.componentInstance;
      component.ngOnInit();
    });

    afterEach(() => {
      TestBed.resetTestingModule();
    });

    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should have as title "elm-falcon-ui"', () => {
      expect(component.title).toEqual('elm-falcon-ui');
    });

    it('should not be loading after init', () => {
      expect(component.dataLoading).toEqual(false);
    });

    it('should click provided nav item', () => {
      const navItem = {
        label: 'test',
        action: () => {
        }
      };
      spyOn(navItem, 'action');
      component.navItemClicked(navItem.action);
      expect(navItem.action).toHaveBeenCalled();
    });

    it('display correct number of nav buttons', () => {
      expect(component.navBarItems.length).toEqual(2);
    });

    it('should route from nav buttons', () => {
      spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
      component.navBarItems.forEach(item => item.action ? item.action() : null);
      expect(router.navigate).toHaveBeenCalledTimes(component.navBarItems.length);
    });

    it('should be able to run user action items', () => {
      component.userMenuItems.forEach(item => item.action ? item.action() : null);
      expect(buildInfoService.openBuildInfoModal).toHaveBeenCalled();
    });

    it('should logout', () => {
      spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
      spyOn(oktaService, 'signOut').and.returnValue(Promise.resolve());
      component.logout();
      expect(oktaService.signOut).toHaveBeenCalled();
    });

    it('should return true', () => {
      spyOnProperty(router, 'url').and.returnValue('/invoices');
      expect(component.showNavBar).toBeTrue();
    });

    it('should return false', () => {
      spyOnProperty(router, 'url').and.returnValue('/newUserForbidden');
      expect(component.showNavBar).toBeFalse();
    });
  });

  describe('write user view', () => {
    beforeEach(() => {
      // Create Component
      const fixture = TestBed.createComponent(AppComponent);
      oktaService.$authenticationState = of(true);
      spyOn(userService, 'getUserInfo').and.returnValue(of(writeUser));
      component = fixture.componentInstance;
      component.ngOnInit();
    });

    afterEach(() => {
      TestBed.resetTestingModule();
    });

    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('display correct number of nav buttons', () => {
      expect(component.navBarItems.length).toEqual(4);
    });

    it('should route from nav buttons', () => {
      spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
      component.navBarItems.forEach(item => item.action ? item.action() : null);
      expect(router.navigate).toHaveBeenCalledTimes(component.navBarItems.length);
    });
  });

  describe('with initialization errors', () => {
    beforeEach(() => {
      // Common Spies
      spyOn(util, 'openErrorModal').and.returnValue(of(true));
      spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
      // Create Component
      const fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      component.ngOnInit();
      // Trigger Error
      errorService.addError({
        status: '401',
        message: 'test message'
      });
    });

    it('should show error modal', () => {
      expect(util.openErrorModal).toHaveBeenCalledOnceWith({
        title: 'Error',
        innerHtmlMessage: '<strong>Status:</strong> 401<br>test message'
      });
    });

    it('should navigate to logout', () => {
      expect(router.navigate).toHaveBeenCalledOnceWith(['/logged-out']);
    });
  });

  describe('with forbidden errors', () => {
    beforeEach(() => {
      // Common Spies
      spyOn(util, 'openErrorModal').and.stub();
      spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
      // Create Component
      const fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      component.ngOnInit();
      // Trigger Error
      errorService.addError({
        status: '403',
        message: 'User not Found'
      });
    });

    it('should not show error modal', () => {
      expect(util.openErrorModal).not.toHaveBeenCalled();
    });

    it('should navigate to newUserForbidden', () => {
      expect(router.navigate).toHaveBeenCalledOnceWith(['/newUserForbidden']);
    });
  });
});
