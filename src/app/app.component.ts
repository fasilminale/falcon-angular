import {Component, OnInit} from '@angular/core';
import {LoadingService} from './services/loading-service';
import {Router} from '@angular/router';
import {MenuItem, NavbarItem} from '@elm/elm-styleguide-ui';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'elm-falcon-ui';
  dataLoading = true;
  userMenuItems: Array<MenuItem> = [];
  navBarItems = [
    {
      label: 'Create Invoice',
      click: () => this.router.navigate(['/invoice/create'])
    },
    {
      label: 'Invoice List',
      click: () => this.router.navigate(['/invoices'])
    }
  ];

  navItemClicked(item: NavbarItem): void {
    if (item.click) {
      item.click();
    }
  }

  constructor(private loadingService: LoadingService,
              private router: Router) {
    this.loadingService.loadingSubject.subscribe(isLoading => {
      this.dataLoading = isLoading;
    });
  }

  public ngOnInit(): void {
    this.dataLoading = false;
  }
}
