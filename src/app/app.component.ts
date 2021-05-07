import {Component, OnInit} from '@angular/core';
import {LoadingService} from './services/loading-service';
import {Router} from '@angular/router';
import {ErrorModalComponent, ErrorModalData, MenuItem, NavbarItem} from '@elm/elm-styleguide-ui';
import {AuthService} from './services/auth-service';
import {ErrorService} from './services/error-service';
import {MatDialog} from '@angular/material/dialog';

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

  navItemClicked(item: NavbarItem): void {
    if (item.click) {
      item.click();
    }
  }

  constructor(private loadingService: LoadingService,
              private router: Router,
              public authService: AuthService,
              private errorService: ErrorService,
              private dialog: MatDialog) {
    this.loadingService.loadingSubject.subscribe((args) => {
      this.dataLoading = args[0] as boolean;
      this.label = args[1] as string;
    });
    this.initializeErrors();
  }

  public ngOnInit(): void {
    this.dataLoading = false;
  }

  private initializeErrors(): void {
    this.errorService.getErrors().subscribe(error => {
      const modalData: ErrorModalData = {
        title: 'Error',
        innerHtmlMessage: `<strong>Status:</strong> ${error.status}<br>` +
          `${error.error.message}`
      };
      this.dialog.open(ErrorModalComponent, {
        width: '400px',
        autoFocus: false,
        data: modalData,
      });
      this.dialog.afterAllClosed.subscribe(() => {
        if (error.status === '401') {
          this.router.navigate(['/logged-out']).then();
        }
      });
    });
  }
}
