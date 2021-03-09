import {Component, OnInit} from '@angular/core';
import {LoadingService} from './services/loading-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'elm-falcon-ui';
  dataLoading = true;
  pageTabs = [
    {label: 'Create Invoice', path: '/invoice/create'},
    {label: 'Invoice List', path: '/invoices'}
  ];

  constructor(private loadingService: LoadingService) {
    this.loadingService.loadingSubject.subscribe(isLoading => {
      this.dataLoading = isLoading;
    });
  }

  public ngOnInit(): void {
    this.dataLoading = false;
  }
}
