import {Component, Inject, OnInit} from '@angular/core';
import {LoadingService} from './services/loading-service';
import {Router} from '@angular/router';
import {ErrorModalData, NavbarItem} from '@elm/elm-styleguide-ui';
import {ErrorService} from './services/error-service';
import {OktaAuthService} from '@okta/okta-angular';
import {AUTH_SERVICE, AuthService} from './services/auth-service';
import {UtilService} from './services/util-service';
import {filter, mergeMap, repeatWhen, take, tap} from 'rxjs/operators';
import {UserInfoModel} from './models/user-info/user-info-model';
import {UserService} from './services/user-service';
import {ElmUamRoles} from './utils/elm-uam-roles';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  logoUrl = '../../../assets/Cardinal_Health_logo.svg';
  logoAlt = 'Cardinal Health Logo';
  userInfo: UserInfoModel = new UserInfoModel();
  title = 'elm-falcon-ui';
  dataLoading = true;
  label = '';
  userMenuItems: Array<NavbarItem> = [];
  navBarItems: Array<NavbarItem> = [];

  public navItemClicked(event: () => any): void {
    event();
  }

  constructor(private loadingService: LoadingService,
              private router: Router,
              @Inject(AUTH_SERVICE) public authService: AuthService,
              private errorService: ErrorService,
              private oktaService: OktaAuthService,
              private util: UtilService,
              private userService: UserService) {
    this.loadingService.loadingSubject.subscribe((args) => {
      this.dataLoading = args[0] as boolean;
      this.label = args[1] as string;
    });
    this.initializeErrors();
  }

  public async ngOnInit(): Promise<void> {
    this.dataLoading = false;

    const authReq = this.oktaService.$authenticationState;
    authReq.pipe(
      repeatWhen(isAuthenticated => isAuthenticated),
      filter(data => data),
      take(1),
      mergeMap( () => {
        return this.userService.getUserInfo();
      }),
      tap( userInfo => {
        this.userInfo = new UserInfoModel(userInfo);
        this.buildNavBar();
      })
    ).subscribe();
  }

  public initializeErrors(): void {
    this.errorService.getErrors().subscribe(error => {
      const modalData: ErrorModalData = {
        title: 'Error',
        innerHtmlMessage: `<strong>Status:</strong> ${error.status}<br>` +
          `${error.message}`
      };
      this.util.openErrorModal(modalData)
        .subscribe(() => {
          if (error.status === '401') {
            this.router.navigate(['/logged-out']).then();
          }
        });
    });
  }

  public logout(): void {
    this.oktaService.signOut().then(() => {
      this.router.navigate(['/logged-out']).then();
    });
  }

  public buildNavBar(): void {
    const requiredPermissions = [ElmUamRoles.ALLOW_INVOICE_WRITE];

    // Create Invoice Header
    if (requiredPermissions.some(permission => this.userInfo?.permissions.includes(permission))) {
      this.navBarItems.push({label: 'Create Invoice', action: () => this.router.navigate(['/invoice/create'])});
    }

    // Invoice List Header
    this.navBarItems.push({label: 'Invoice List', action: () => this.router.navigate(['/invoices'])});

    // Manage Templates Header
    if (requiredPermissions.some(permission => this.userInfo?.permissions.includes(permission))) {
      this.navBarItems.push({label: 'Manage My Templates', action: () => this.router.navigate(['/templates'])});
    }

    // Master Data Header
    this.navBarItems.push({label: 'Master Data', action: () => this.router.navigate(['/master-data'])});
  }
}
