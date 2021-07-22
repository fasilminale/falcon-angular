import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {AppModule} from './app.module';
import {Router} from '@angular/router';
import {OktaAuthService} from '@okta/okta-angular';
import {ErrorService} from './services/error-service';
import {UtilService} from './services/util-service';
import {of} from 'rxjs';
import {FalconTestingModule} from './testing/falcon-testing.module';

describe('AppComponent', () => {
  let router: Router;
  let component: AppComponent;
  let oktaService: OktaAuthService;
  let errorService: ErrorService;
  let util: UtilService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        AppModule,
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
  });

  describe('without initialization errors', () => {
    beforeEach(() => {
      // Create Component
      const fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      component.ngOnInit();
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
        click: () => {
        }
      };
      spyOn(navItem, 'click');
      component.navItemClicked(navItem);
      expect(navItem.click).toHaveBeenCalled();
    });

    it('should route from nav buttons', () => {
      spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
      component.navBarItems.forEach(item => item.click());
      expect(router.navigate).toHaveBeenCalledTimes(component.navBarItems.length);
    });

    it('should logout', () => {
      spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
      spyOn(oktaService, 'signOut').and.returnValue(Promise.resolve());
      component.logout();
      expect(oktaService.signOut).toHaveBeenCalled();
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
        error: {message: 'test message'}
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
});
