import {Component, OnInit} from '@angular/core';

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

  public ngOnInit(): void {
    this.dataLoading = false;
  }
}
