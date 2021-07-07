import {Component, OnInit} from '@angular/core';
import {LoadingService} from './services/loading-service';
import {Router} from '@angular/router';
import {ErrorModalData, FeedbackCollectorService, MenuItem, NavbarItem} from '@elm/elm-styleguide-ui';
import {ErrorService} from './services/error-service';
import {OktaAuthService} from '@okta/okta-angular';
import {AuthService} from './services/auth-service';
import {UtilService} from './services/util-service';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'elm-falcon-ui';
  dataLoading = true;
  label = '';
  userMenuItems: Array<MenuItem> = [];
  navBarItems = [
    {
      label: 'Create Invoice',
      click: () => this.router.navigate(['/invoice/create'])
    },
    {
      label: 'Invoice List',
      click: () => this.router.navigate(['/invoices'])
    },
    {
      label: 'Manage My Templates',
      click: () => this.router.navigate(['/templates'])
    }
  ];

  public navItemClicked(item: NavbarItem): void {
    if (item.click) {
      item.click();
    }
  }

  constructor(private loadingService: LoadingService,
              private router: Router,
              public authService: AuthService,
              private errorService: ErrorService,
              private oktaService: OktaAuthService,
              private util: UtilService,
              private feedbackCollector: FeedbackCollectorService) {
    this.loadingService.loadingSubject.subscribe((args) => {
      this.dataLoading = args[0] as boolean;
      this.label = args[1] as string;
    });
    this.initializeErrors();
  }

  public async ngOnInit(): Promise<void> {
    await this.feedbackCollector.initLoad(environment.jiraFeedbackCollectorId);
    this.dataLoading = false;
  }

  public initializeErrors(): void {
    this.errorService.getErrors().subscribe(error => {
      const modalData: ErrorModalData = {
        title: 'Error',
        innerHtmlMessage: `<strong>Status:</strong> ${error.status}<br>` +
          `${error.error.message}`
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
}
